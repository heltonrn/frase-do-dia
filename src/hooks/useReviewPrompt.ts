import { useCallback, useEffect, useState } from 'react';

import { getReviewEngagement, getReviewState, updateReviewState } from '../database/reviewRepository';
import {
  getReviewStateAfterAnswer,
  ReviewAnswer,
  ReviewEligibilityInput,
  shouldPromptReview,
} from '../services/reviewPolicy';

export interface ReviewPromptController {
  /** true quando o cartão de avaliação deve aparecer na Home. */
  visivel: boolean;
  responder(resposta: ReviewAnswer): Promise<void>;
}

/**
 * Decide se o cartão de avaliação aparece e persiste a resposta.
 *
 * `fraseExibida` indica o momento positivo: só consulta o banco depois
 * que a frase do dia já está na tela. O pedido é opcional — qualquer
 * falha aqui é silenciosa e nunca afeta a exibição da frase.
 */
export function useReviewPrompt(fraseExibida: boolean): ReviewPromptController {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (!fraseExibida) {
      setVisivel(false);
      return;
    }
    let cancelado = false;
    void (async () => {
      try {
        const [engajamento, estado] = await Promise.all([getReviewEngagement(), getReviewState()]);
        const entrada: ReviewEligibilityInput = {
          firstUseDate: engajamento.firstUseDate,
          daysOfUse: engajamento.daysOfUse,
          phraseShownToday: true,
          ...estado,
        };
        if (!cancelado) {
          setVisivel(shouldPromptReview(entrada, new Date()));
        }
      } catch {
        // Falha silenciosa: o cartão simplesmente não aparece.
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [fraseExibida]);

  const responder = useCallback(async (resposta: ReviewAnswer): Promise<void> => {
    setVisivel(false);
    try {
      const estado = await getReviewState();
      await updateReviewState(getReviewStateAfterAnswer(resposta, estado.reviewSnoozeCount, new Date()));
    } catch {
      // No pior caso o cartão volta a aparecer na próxima abertura.
    }
  }, []);

  return { visivel, responder };
}
