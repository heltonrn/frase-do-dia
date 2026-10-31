import { APP_STATE_KEYS, getAppState, setAppState } from './appStateRepository';
import { getDatabase } from './db';
import { ReviewState, ReviewStateChange } from '../services/reviewPolicy';

export interface ReviewEngagement {
  firstUseDate: string | null;
  daysOfUse: number;
}

/**
 * Resume o engajamento a partir do histórico já persistido: primeiro dia
 * em que uma frase foi exibida e quantos dias distintos de uso existem.
 */
export async function getReviewEngagement(): Promise<ReviewEngagement> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ primeiro: string | null; dias: number }>(
    'SELECT MIN(data) AS primeiro, COUNT(DISTINCT data) AS dias FROM frases_utilizadas',
  );
  return { firstUseDate: row?.primeiro ?? null, daysOfUse: row?.dias ?? 0 };
}

/** Estado do pedido de avaliação (guardado em app_estado; sem migração). */
export async function getReviewState(): Promise<ReviewState> {
  const [concluida, adiamentos, proximo] = await Promise.all([
    getAppState(APP_STATE_KEYS.avaliacaoConcluida),
    getAppState(APP_STATE_KEYS.avaliacaoAdiamentos),
    getAppState(APP_STATE_KEYS.avaliacaoProximoPedidoEm),
  ]);
  const adiamentosNumero = Number.parseInt(adiamentos ?? '0', 10);
  return {
    reviewCompleted: concluida === '1',
    reviewSnoozeCount: Number.isNaN(adiamentosNumero) ? 0 : adiamentosNumero,
    // Valor vazio representa "sem data" (app_estado.valor é NOT NULL).
    reviewNextPromptAt: proximo ? proximo : null,
  };
}

export async function updateReviewState(change: ReviewStateChange): Promise<void> {
  if (change.reviewCompleted !== undefined) {
    await setAppState(APP_STATE_KEYS.avaliacaoConcluida, change.reviewCompleted ? '1' : '0');
  }
  if (change.reviewSnoozeCount !== undefined) {
    await setAppState(APP_STATE_KEYS.avaliacaoAdiamentos, String(change.reviewSnoozeCount));
  }
  if (change.reviewNextPromptAt !== undefined) {
    await setAppState(APP_STATE_KEYS.avaliacaoProximoPedidoEm, change.reviewNextPromptAt ?? '');
  }
}
