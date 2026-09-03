import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { getDailyPhrase } from '../services/dailyPhraseService';
import { syncPhraseBase } from '../services/phraseSyncService';
import { Phrase } from '../types/Phrase';

export type DailyPhraseState =
  | { status: 'carregando' }
  | { status: 'ok'; frase: Phrase }
  | { status: 'sem_frases' }
  | { status: 'erro' };

const TENTATIVAS_MAXIMAS = 3;
const ESPERA_BASE_MS = 300;

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Orquestra o boot da tela principal: sincroniza a base de frases
 * (primeira instalação ou atualização) e em seguida obtém a frase do
 * dia pelo motor. A tela só consome o estado — nenhuma regra de
 * negócio vive no componente (seção 13 do MD).
 *
 * No cold start (primeira abertura após instalar/reiniciar o app), a
 * inicialização do SQLite nativo pode não estar 100% pronta no
 * primeiro instante. Em vez de mostrar erro na primeira falha, tenta
 * de novo automaticamente algumas vezes com espera crescente antes de
 * desistir — cobre esse tipo de soluço passageiro sem o usuário
 * precisar minimizar/reabrir o app manualmente.
 */
export function useDailyPhrase(): DailyPhraseState {
  const [state, setState] = useState<DailyPhraseState>({ status: 'carregando' });

  const carregar = useCallback(async () => {
    for (let tentativa = 1; tentativa <= TENTATIVAS_MAXIMAS; tentativa += 1) {
      try {
        await syncPhraseBase();
        const resultado = await getDailyPhrase();
        if (resultado.status === 'ok') {
          setState({ status: 'ok', frase: resultado.frase });
        } else {
          setState({ status: 'sem_frases' });
        }
        return;
      } catch (erro) {
        const ultimaTentativa = tentativa === TENTATIVAS_MAXIMAS;
        console.error(
          `Falha ao obter a frase do dia (tentativa ${tentativa}/${TENTATIVAS_MAXIMAS}):`,
          erro,
        );
        if (ultimaTentativa) {
          setState({ status: 'erro' });
          return;
        }
        await esperar(ESPERA_BASE_MS * tentativa);
      }
    }
  }, []);

  useEffect(() => {
    void carregar();
    // Virada de meia-noite com o app em segundo plano: ao voltar ao
    // primeiro plano, reconsulta o motor. No mesmo dia ele devolve a
    // mesma frase (RN01); em dia novo, seleciona a próxima (RN02).
    const inscricao = AppState.addEventListener('change', (estadoApp) => {
      if (estadoApp === 'active') {
        void carregar();
      }
    });
    return () => inscricao.remove();
  }, [carregar]);

  return state;
}
