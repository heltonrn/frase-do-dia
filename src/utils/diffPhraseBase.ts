import { Phrase, PhraseBasePackage } from '../types/Phrase';

export interface PhraseBaseDiff {
  /** Frases do pacote cujos ids ainda não existem no banco local. */
  novas: Phrase[];
  /** Frases já existentes cujo indicador ativo mudou no pacote. */
  ativoAlterado: Array<{ id: string; ativo: boolean }>;
}

/**
 * Calcula a diferença entre a base já instalada (representada apenas
 * pelos ids e pelo estado ativo conhecidos) e o pacote distribuído com
 * a versão atual do app.
 *
 * Função pura, sem acesso a banco — isso permite testá-la isoladamente
 * e mantém o phraseSyncService como um orquestrador fino.
 */
export function diffPhraseBase(
  pacote: PhraseBasePackage,
  idsInstalados: ReadonlySet<string>,
  ativoInstalado: ReadonlyMap<string, boolean>,
): PhraseBaseDiff {
  const novas: Phrase[] = [];
  const ativoAlterado: Array<{ id: string; ativo: boolean }> = [];

  for (const frase of pacote.frases) {
    if (!idsInstalados.has(frase.id)) {
      novas.push(frase);
      continue;
    }
    const ativoAtual = ativoInstalado.get(frase.id);
    if (ativoAtual !== undefined && ativoAtual !== frase.ativo) {
      ativoAlterado.push({ id: frase.id, ativo: frase.ativo });
    }
  }

  return { novas, ativoAlterado };
}
