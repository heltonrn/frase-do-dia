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

/**
 * Orquestra o boot da tela principal: sincroniza a base de frases
 * (primeira instalação ou atualização) e em seguida obtém a frase do
 * dia pelo motor. A tela só consome o estado — nenhuma regra de
 * negócio vive no componente (seção 13 do MD).
 */
export function useDailyPhrase(): DailyPhraseState {
  const [state, setState] = useState<DailyPhraseState>({ status: 'carregando' });

  const carregar = useCallback(async () => {
    try {
      await syncPhraseBase();
      const resultado = await getDailyPhrase();
      if (resultado.status === 'ok') {
        setState({ status: 'ok', frase: resultado.frase });
      } else {
        setState({ status: 'sem_frases' });
      }
    } catch (erro) {
      console.error('Falha ao obter a frase do dia:', erro);
      setState({ status: 'erro' });
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
