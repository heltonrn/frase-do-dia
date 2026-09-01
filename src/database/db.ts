import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'frase_do_dia.db';

let databaseInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Abre (ou reaproveita) a conexão com o banco local e garante que o
 * schema exista. Todas as demais camadas devem obter o banco por aqui,
 * nunca abrindo conexões próprias.
 *
 * Schema:
 * - frases:            base de frases distribuída com o app;
 * - ciclos:            um registro por ciclo de sorteio (RN03/RN04);
 * - frases_utilizadas: histórico de uso, sempre vinculado a um ciclo;
 * - app_estado:        pares chave/valor para estado geral
 *                      (versão da base instalada, frase do dia,
 *                      data da última frase, configurações).
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (databaseInstance) {
    return databaseInstance;
  }

  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS frases (
      id        TEXT PRIMARY KEY NOT NULL,
      texto     TEXT NOT NULL,
      autor     TEXT NOT NULL,
      categoria TEXT NOT NULL,
      ativo     INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS ciclos (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      iniciado_em  TEXT NOT NULL,
      finalizado_em TEXT
    );

    CREATE TABLE IF NOT EXISTS frases_utilizadas (
      ciclo_id  INTEGER NOT NULL,
      frase_id  TEXT NOT NULL,
      data      TEXT NOT NULL,
      PRIMARY KEY (ciclo_id, frase_id),
      FOREIGN KEY (ciclo_id) REFERENCES ciclos (id),
      FOREIGN KEY (frase_id) REFERENCES frases (id)
    );

    CREATE TABLE IF NOT EXISTS app_estado (
      chave TEXT PRIMARY KEY NOT NULL,
      valor TEXT NOT NULL
    );
  `);

  databaseInstance = db;
  return databaseInstance;
}

/** Usado apenas em testes/cenários controlados para reiniciar a conexão. */
export function resetDatabaseInstanceForTests(): void {
  databaseInstance = null;
}
