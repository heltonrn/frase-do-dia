import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CANAL_ANDROID = 'frase-do-dia-diaria';
const IDENTIFICADOR_AGENDAMENTO = 'lembrete-diario';

/**
 * Serviço de notificações locais (seção 7 do MD).
 *
 * - Agendamento 100% local, sem backend.
 * - A notificação é apenas um lembrete genérico: ela NÃO seleciona nem
 *   revela a frase, porque selecionar a frase no momento do agendamento
 *   consumiria uma frase fora da abertura do app (violaria RN01/RN05).
 *   A frase só é consumida quando o usuário abre o aplicativo.
 * - Diferenças de plataforma ficam encapsuladas aqui (canal no Android).
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function garantirCanalAndroid(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync(CANAL_ANDROID, {
    name: 'Lembrete diário',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/**
 * Garante a permissão de notificações, solicitando ao usuário se ainda
 * não foi decidida. Retorna true se a permissão está concedida.
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) {
    return true;
  }
  if (atual.canAskAgain) {
    const resposta = await Notifications.requestPermissionsAsync();
    return resposta.granted;
  }
  return false;
}

/**
 * Agenda (ou reagenda) o lembrete diário no horário informado.
 * Cancela o agendamento anterior antes, garantindo no máximo um
 * lembrete por dia.
 */
export async function scheduleDailyReminder(hora: number, minuto: number): Promise<void> {
  await garantirCanalAndroid();
  await cancelDailyReminder();
  await Notifications.scheduleNotificationAsync({
    identifier: IDENTIFICADOR_AGENDAMENTO,
    content: {
      title: 'Frase do Dia',
      body: 'Sua frase de hoje está esperando por você. 📖',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hora,
      minute: minuto,
      channelId: Platform.OS === 'android' ? CANAL_ANDROID : undefined,
    },
  });
}

/** Cancela o lembrete diário, se houver. */
export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(IDENTIFICADOR_AGENDAMENTO);
}
