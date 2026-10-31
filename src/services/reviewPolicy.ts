/**
 * Regras puras (sem APIs nativas) do pedido de avaliação do app.
 * Tudo aqui é determinístico: o "agora" sempre entra por parâmetro.
 *
 * Mesmo formato adotado no Hidrata: o pedido só aparece depois de uso
 * real, em duas etapas ("Está gostando?"), com adiamentos limitados e
 * feedback negativo encaminhado por e-mail em vez de ir para a loja.
 */

export const REVIEW_FEEDBACK_EMAIL = 'contato@volvet.com.br';

/** Dias corridos desde a primeira frase vista. */
export const REVIEW_MIN_DAYS_SINCE_FIRST_USE = 7;
/** Dias distintos em que o usuário abriu o app e viu uma frase. */
export const REVIEW_MIN_DAYS_OF_USE = 5;
export const REVIEW_MAX_SNOOZES = 3;
export const REVIEW_SNOOZE_DAYS = 30;
export const REVIEW_FEEDBACK_COOLDOWN_DAYS = 60;

const DAY_MS = 24 * 60 * 60 * 1000;

export type ReviewAnswer = 'yes' | 'improve' | 'later';

export interface ReviewEligibilityInput {
  /** Data (YYYY-MM-DD) da primeira frase vista; null se ainda não houve uso. */
  firstUseDate: string | null;
  daysOfUse: number;
  reviewCompleted: boolean;
  reviewSnoozeCount: number;
  reviewNextPromptAt: string | null;
  /** O pedido só aparece num momento positivo: a frase do dia já está na tela. */
  phraseShownToday: boolean;
}

export interface ReviewState {
  reviewCompleted: boolean;
  reviewSnoozeCount: number;
  reviewNextPromptAt: string | null;
}

export type ReviewStateChange = Partial<ReviewState>;

/**
 * Aceita data simples ("YYYY-MM-DD"), ISO 8601 completo e o formato do
 * SQLite `datetime('now')`. Retorna null se não for interpretável.
 */
export function parseStoredTimestamp(value: string): number | null {
  const trimmed = value.trim();
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(trimmed)
    ? `${trimmed.replace(' ', 'T')}Z`
    : trimmed;
  const parsed = Date.parse(normalized);

  return Number.isNaN(parsed) ? null : parsed;
}

function addDays(now: Date, days: number): string {
  return new Date(now.getTime() + days * DAY_MS).toISOString();
}

export function shouldPromptReview(input: ReviewEligibilityInput, now: Date): boolean {
  if (input.reviewCompleted || !input.phraseShownToday) {
    return false;
  }

  if (input.reviewSnoozeCount >= REVIEW_MAX_SNOOZES) {
    return false;
  }

  if (input.firstUseDate === null) {
    return false;
  }
  const firstUseMs = parseStoredTimestamp(input.firstUseDate);
  if (
    firstUseMs === null ||
    now.getTime() - firstUseMs < REVIEW_MIN_DAYS_SINCE_FIRST_USE * DAY_MS
  ) {
    return false;
  }

  if (input.daysOfUse < REVIEW_MIN_DAYS_OF_USE) {
    return false;
  }

  if (input.reviewNextPromptAt !== null) {
    const nextPromptMs = parseStoredTimestamp(input.reviewNextPromptAt);
    if (nextPromptMs !== null && now.getTime() < nextPromptMs) {
      return false;
    }
  }

  return true;
}

export function getReviewStateAfterAnswer(
  answer: ReviewAnswer,
  reviewSnoozeCount: number,
  now: Date,
): ReviewStateChange {
  switch (answer) {
    case 'yes':
      return { reviewCompleted: true, reviewNextPromptAt: null };
    case 'improve':
      return { reviewNextPromptAt: addDays(now, REVIEW_FEEDBACK_COOLDOWN_DAYS) };
    case 'later':
      return {
        reviewSnoozeCount: reviewSnoozeCount + 1,
        reviewNextPromptAt: addDays(now, REVIEW_SNOOZE_DAYS),
      };
  }
}

export const FEEDBACK_CATEGORIES = [
  'Frases',
  'Visual',
  'Lembretes',
  'Algo não funciona',
  'Outro',
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export interface FeedbackMailInput {
  category: FeedbackCategory;
  message: string;
  appVersion: string;
  platform: string;
  osVersion: string;
}

export function buildFeedbackMailtoUrl(input: FeedbackMailInput): string {
  const subject = `Sugestão — Frase do Dia (${input.category})`;
  const body = [
    input.message.trim(),
    '',
    '—',
    `Frase do Dia ${input.appVersion} · ${input.platform} ${input.osVersion}`,
  ].join('\n');

  return `mailto:${REVIEW_FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
