import { getDatabase } from './db';

/**
 * Chaves conhecidas do estado do aplicativo.
 * Centralizadas aqui para evitar strings soltas pelo código.
 */
export const APP_STATE_KEYS = {
  versaoBaseInstalada: 'versao_base_instalada',
  dataUltimaFrase: 'data_ultima_frase',
  idFraseDoDia: 'id_frase_do_dia',
  notificacaoAtiva: 'notificacao_ativa',
  notificacaoHorario: 'notificacao_horario',
} as const;

export type AppStateKey = (typeof APP_STATE_KEYS)[keyof typeof APP_STATE_KEYS];

export async function getAppState(chave: AppStateKey): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ valor: string }>(
    'SELECT valor FROM app_estado WHERE chave = ?',
    [chave],
  );
  return row ? row.valor : null;
}

export async function setAppState(chave: AppStateKey, valor: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO app_estado (chave, valor) VALUES (?, ?) ON CONFLICT (chave) DO UPDATE SET valor = excluded.valor',
    [chave, valor],
  );
}
