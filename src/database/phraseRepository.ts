import { Categoria } from '../constants/categories';
import { Phrase } from '../types/Phrase';
import { getDatabase } from './db';

interface PhraseRow {
  id: string;
  texto: string;
  autor: string;
  categoria: string;
  ativo: number;
}

function rowToPhrase(row: PhraseRow): Phrase {
  return {
    id: row.id,
    texto: row.texto,
    autor: row.autor,
    categoria: row.categoria as Categoria,
    ativo: row.ativo === 1,
  };
}

/** Retorna os ids de todas as frases já presentes no banco local. */
export async function getAllPhraseIds(): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ id: string }>('SELECT id FROM frases');
  return rows.map((row) => row.id);
}

/** Retorna os ids das frases ativas (elegíveis para sorteio). */
export async function getActivePhraseIds(): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ id: string }>('SELECT id FROM frases WHERE ativo = 1');
  return rows.map((row) => row.id);
}

/** Retorna uma frase pelo id, ou null se não existir. */
export async function getPhraseById(id: string): Promise<Phrase | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<PhraseRow>('SELECT * FROM frases WHERE id = ?', [id]);
  return row ? rowToPhrase(row) : null;
}

/** Total de frases ativas — usado para detectar base vazia (cenário 10 do MD). */
export async function countActivePhrases(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) AS total FROM frases WHERE ativo = 1',
  );
  return row ? row.total : 0;
}

/**
 * Insere um lote de frases novas em uma única transação.
 * Assume que os ids não existem ainda — a decisão de quais frases são
 * novas é responsabilidade do phraseSyncService.
 */
export async function insertPhrases(frases: Phrase[]): Promise<void> {
  if (frases.length === 0) {
    return;
  }
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const frase of frases) {
      await db.runAsync(
        'INSERT INTO frases (id, texto, autor, categoria, ativo) VALUES (?, ?, ?, ?, ?)',
        [frase.id, frase.texto, frase.autor, frase.categoria, frase.ativo ? 1 : 0],
      );
    }
  });
}

/**
 * Atualiza o indicador ativo/inativo de frases já existentes.
 * Nunca altera texto/autor de um id já publicado e nunca apaga registros —
 * desativar é a única forma de descontinuar uma frase (regra do id permanente).
 */
export async function updatePhrasesAtivo(
  atualizacoes: ReadonlyArray<{ id: string; ativo: boolean }>,
): Promise<void> {
  if (atualizacoes.length === 0) {
    return;
  }
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const atualizacao of atualizacoes) {
      await db.runAsync('UPDATE frases SET ativo = ? WHERE id = ?', [
        atualizacao.ativo ? 1 : 0,
        atualizacao.id,
      ]);
    }
  });
}
