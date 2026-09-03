import { useCallback, useEffect, useState } from 'react';

import { APP_STATE_KEYS, getAppState, setAppState } from '../database/appStateRepository';
import {
  cancelDailyReminder,
  ensureNotificationPermission,
  isNotificationsSupported,
  scheduleDailyReminder,
} from '../services/notificationService';
import { HORARIO_PADRAO, parseHorario } from '../utils/parseHorario';

export interface NotificationSettings {
  carregado: boolean;
  ativa: boolean;
  hora: number;
  minuto: number;
  /** false quando o usuário negou a permissão do sistema. */
  permissaoNegada: boolean;
  /** false quando o ambiente não suporta notificações (Expo Go Android). */
  suportado: boolean;
  alternar(): Promise<void>;
  definirHorario(hora: number, minuto: number): Promise<void>;
}

/**
 * Gerencia a configuração do lembrete diário: carrega do banco,
 * persiste alterações e mantém o agendamento nativo em sincronia.
 * A tela só consome este hook — nenhuma regra fica no componente.
 */
export function useNotificationSettings(): NotificationSettings {
  const [carregado, setCarregado] = useState(false);
  const [ativa, setAtiva] = useState(false);
  const [hora, setHora] = useState(HORARIO_PADRAO.hora);
  const [minuto, setMinuto] = useState(HORARIO_PADRAO.minuto);
  const [permissaoNegada, setPermissaoNegada] = useState(false);

  useEffect(() => {
    let montado = true;
    void (async () => {
      try {
        const ativaRaw = await getAppState(APP_STATE_KEYS.notificacaoAtiva);
        const horarioRaw = await getAppState(APP_STATE_KEYS.notificacaoHorario);
        const horario = parseHorario(horarioRaw);
        if (montado) {
          setAtiva(ativaRaw === 'true');
          setHora(horario.hora);
          setMinuto(horario.minuto);
          setCarregado(true);
        }
      } catch (erro) {
        console.error('Falha ao carregar configurações de notificação:', erro);
        if (montado) {
          setCarregado(true);
        }
      }
    })();
    return () => {
      montado = false;
    };
  }, []);

  const alternar = useCallback(async () => {
    try {
      if (ativa) {
        await cancelDailyReminder();
        await setAppState(APP_STATE_KEYS.notificacaoAtiva, 'false');
        setAtiva(false);
        return;
      }
      const permitido = await ensureNotificationPermission();
      if (!permitido) {
        setPermissaoNegada(true);
        return;
      }
      await scheduleDailyReminder(hora, minuto);
      await setAppState(APP_STATE_KEYS.notificacaoAtiva, 'true');
      setPermissaoNegada(false);
      setAtiva(true);
    } catch (erro) {
      console.error('Falha ao alternar notificação:', erro);
    }
  }, [ativa, hora, minuto]);

  const definirHorario = useCallback(
    async (novaHora: number, novoMinuto: number) => {
      try {
        setHora(novaHora);
        setMinuto(novoMinuto);
        const valor = `${String(novaHora).padStart(2, '0')}:${String(novoMinuto).padStart(2, '0')}`;
        await setAppState(APP_STATE_KEYS.notificacaoHorario, valor);
        if (ativa) {
          await scheduleDailyReminder(novaHora, novoMinuto);
        }
      } catch (erro) {
        console.error('Falha ao definir horário da notificação:', erro);
      }
    },
    [ativa],
  );

  return {
    carregado,
    ativa,
    hora,
    minuto,
    permissaoNegada,
    suportado: isNotificationsSupported(),
    alternar,
    definirHorario,
  };
}
