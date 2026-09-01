import { getDatabase } from './db';

export interface Cycle {
  id: number;
  iniciadoEm: string;
  finalizadoEm: string | null;
}

/** Retorna o ciclo em aberto (finalizado_em nulo), ou null se não houver. */
export async function getOpenCycle(): Promise<Cycle | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    id: number;
    iniciado_em: string;
    finalizado_em: string | null;
  }>('SELECT id, iniciado_em, finalizado_em FROM ciclos WHERE finalizado_em IS NULL ORDER BY id DESC LIMIT 1');
  if (!row) {
    return null;
  }
  return { id: row.id, iniciadoEm: row.iniciado_em, finalizadoEm: row.finalizado_em };
}

/** Cria um novo ciclo iniciado na data informada e retorna seu id. */
export async function createCycle(data: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync('INSERT INTO ciclos (iniciado_em) VALUES (?)', [data]);
  return result.lastInsertRowId;
}

/** Marca um ciclo como finalizado na data informada. */
export async function closeCycle(cicloId: number, data: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE ciclos SET finalizado_em = ? WHERE id = ?', [data, cicloId]);
}

/** Ids das frases já utilizadas dentro de um ciclo. */
export async function getUsedPhraseIdsInCycle(cicloId: number): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ frase_id: string }>(
    'SELECT frase_id FROM frases_utilizadas WHERE ciclo_id = ?',
    [cicloId],
  );
  return rows.map((row) => row.frase_id);
}

/** Registra o uso de uma frase em um ciclo, na data informada. */
export async function recordPhraseUsed(
  cicloId: number,
  fraseId: string,
  data: string,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO frases_utilizadas (ciclo_id, frase_id, data) VALUES (?, ?, ?)',
    [cicloId, fraseId, data],
  );
}
