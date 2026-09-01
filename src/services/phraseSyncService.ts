import { APP_STATE_KEYS, getAppState, setAppState } from '../database/appStateRepository';
import { getDatabase } from '../database/db';
import { insertPhrases, updatePhrasesAtivo } from '../database/phraseRepository';
import { phrasesPackageV1 } from '../database/phrasesData';
import { PhraseBasePackage } from '../types/Phrase';
import { diffPhraseBase } from '../utils/diffPhraseBase';

export interface SyncResult {
  executado: boolean;
  frasesInseridas: number;
  frasesComAtivoAlterado: number;
  versaoBase: number;
}

/**
 * Sincroniza a base de frases do pacote com o banco local.
 *
 * Deve ser chamado uma vez a cada abertura do app, antes de qualquer
 * seleção de frase. Cobre os dois cenários combinados:
 *
 * 1. Primeira instalação: banco vazio → todas as frases do pacote são
 *    inseridas e a versão da base é registrada.
 * 2. Atualização do app com base nova: `versaoBase` do pacote é maior
 *    que a instalada → apenas os ids novos são inseridos (entram no
 *    ciclo em andamento como não utilizadas) e mudanças de ativo são
 *    aplicadas. Histórico e ciclo nunca são resetados.
 *
 * Se a versão do pacote for igual à instalada, nada é feito (caminho
 * rápido do dia a dia).
 */
export async function syncPhraseBase(
  pacote: PhraseBasePackage = phrasesPackageV1,
): Promise<SyncResult> {
  const versaoInstaladaRaw = await getAppState(APP_STATE_KEYS.versaoBaseInstalada);
  const versaoInstalada = versaoInstaladaRaw === null ? 0 : Number(versaoInstaladaRaw);

  if (Number.isNaN(versaoInstalada)) {
    throw new Error(
      `Valor inválido para ${APP_STATE_KEYS.versaoBaseInstalada}: "${versaoInstaladaRaw}"`,
    );
  }

  if (pacote.versaoBase <= versaoInstalada) {
    return {
      executado: false,
      frasesInseridas: 0,
      frasesComAtivoAlterado: 0,
      versaoBase: versaoInstalada,
    };
  }

  const db = await getDatabase();
  const linhas = await db.getAllAsync<{ id: string; ativo: number }>(
    'SELECT id, ativo FROM frases',
  );
  const idsInstalados = new Set(linhas.map((linha) => linha.id));
  const ativoInstalado = new Map(linhas.map((linha) => [linha.id, linha.ativo === 1]));

  const diff = diffPhraseBase(pacote, idsInstalados, ativoInstalado);

  await insertPhrases(diff.novas);
  await updatePhrasesAtivo(diff.ativoAlterado);
  await setAppState(APP_STATE_KEYS.versaoBaseInstalada, String(pacote.versaoBase));

  return {
    executado: true,
    frasesInseridas: diff.novas.length,
    frasesComAtivoAlterado: diff.ativoAlterado.length,
    versaoBase: pacote.versaoBase,
  };
}
