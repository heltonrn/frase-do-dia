import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

const CANAL_ANDROID = 'frase-do-dia-diaria';
const IDENTIFICADOR_AGENDAMENTO = 'lembrete-diario';

/**
 * Serviço de notificações locais (seção 7 do MD).
 *
 * - Agendamento 100% local, sem backend.
 * - A notificação é apenas um lembrete genérico: ela NÃO seleciona nem
 *   revela a frase — selecionar no agendamento consumiria uma frase
 *   fora da abertura do app (violaria RN01/RN05).
 * - Diferenças de plataforma ficam encapsuladas aqui.
 *
 * IMPORTANTE — Expo Go no Android (SDK 53+): o simples import do
 * expo-notifications dispara um erro em tempo de execução, derrubando
 * o app. Por isso a biblioteca é carregada de forma TARDIA e PROTEGIDA
 * (nunca no topo do arquivo), e no Expo Go Android o serviço se declara
 * indisponível sem sequer tentar carregar o módulo. Em development
 * build e produção funciona normalmente.
 */

type NotificationsModule = typeof import('expo-notifications');

let moduloCarregado: NotificationsModule | null = null;
let tentouCarregar = false;

/** true quando o app está rodando dentro do Expo Go. */
function estaNoExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

/**
 * Indica se as notificações são suportadas neste ambiente.
 * No Expo Go do Android, não são (limitação do SDK 53+).
 */
export function isNotificationsSupported(): boolean {
  return !(Platform.OS === 'android' && estaNoExpoGo());
}

function getNotificationsModule(): NotificationsModule | null {
  if (!isNotificationsSupported()) {
    return null;
  }
  if (tentouCarregar) {
    return moduloCarregado;
  }
  tentouCarregar = true;
  try {
    // Require dinâmico protegido — nunca importar no topo do arquivo.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const modulo = require('expo-notifications') as NotificationsModule;
    modulo.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    moduloCarregado = modulo;
  } catch (erro) {
    console.error('expo-notifications indisponível neste ambiente:', erro);
    moduloCarregado = null;
  }
  return moduloCarregado;
}

async function garantirCanalAndroid(modulo: NotificationsModule): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await modulo.setNotificationChannelAsync(CANAL_ANDROID, {
    name: 'Lembrete diário',
    importance: modulo.AndroidImportance.DEFAULT,
  });
}

/**
 * Garante a permissão de notificações, solicitando ao usuário se ainda
 * não foi decidida. Retorna true se a permissão está concedida; false
 * quando negada ou quando o ambiente não suporta notificações.
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  const modulo = getNotificationsModule();
  if (!modulo) {
    return false;
  }
  const atual = await modulo.getPermissionsAsync();
  if (atual.granted) {
    return true;
  }
  if (atual.canAskAgain) {
    const resposta = await modulo.requestPermissionsAsync();
    return resposta.granted;
  }
  return false;
}

/**
 * Agenda (ou reagenda) o lembrete diário no horário informado.
 * Cancela o agendamento anterior antes, garantindo no máximo um
 * lembrete por dia. Silenciosamente não faz nada em ambiente sem
 * suporte.
 */
export async function scheduleDailyReminder(hora: number, minuto: number): Promise<void> {
  const modulo = getNotificationsModule();
  if (!modulo) {
    return;
  }
  await garantirCanalAndroid(modulo);
  await cancelDailyReminder();
  await modulo.scheduleNotificationAsync({
    identifier: IDENTIFICADOR_AGENDAMENTO,
    content: {
      title: 'Frase do Dia',
      body: 'Sua frase de hoje está esperando por você. 📖',
    },
    trigger: {
      type: modulo.SchedulableTriggerInputTypes.DAILY,
      hour: hora,
      minute: minuto,
      channelId: Platform.OS === 'android' ? CANAL_ANDROID : undefined,
    },
  });
}

/** Cancela o lembrete diário, se houver. */
export async function cancelDailyReminder(): Promise<void> {
  const modulo = getNotificationsModule();
  if (!modulo) {
    return;
  }
  await modulo.cancelScheduledNotificationAsync(IDENTIFICADOR_AGENDAMENTO);
}
