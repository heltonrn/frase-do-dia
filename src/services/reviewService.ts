import Constants from 'expo-constants';
import { Linking, Platform } from 'react-native';

import { buildFeedbackMailtoUrl, FeedbackCategory } from './reviewPolicy';

const ANDROID_PACKAGE_PADRAO = 'br.com.volvet.frase';

type StoreReviewModule = typeof import('expo-store-review');

/**
 * Carrega o expo-store-review de forma tardia e protegida (mesmo padrão
 * dos demais SDKs nativos do app): se o módulo faltar no binário, o
 * pedido cai para a página da loja em vez de derrubar o app.
 */
function getStoreReviewModule(): StoreReviewModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-store-review') as StoreReviewModule;
  } catch {
    return null;
  }
}

async function openStorePageUrl(): Promise<void> {
  const androidPackage = Constants.expoConfig?.android?.package ?? ANDROID_PACKAGE_PADRAO;
  const url =
    getStoreReviewModule()?.storeUrl() ??
    (Platform.OS === 'android' ? `market://details?id=${androidPackage}` : null);

  if (!url) {
    throw new Error('Link da loja indisponível.');
  }

  await Linking.openURL(url);
}

/**
 * Abre o diálogo nativo de avaliação. Se o sistema não oferecer (ou
 * limitar) o diálogo, cai para a página do app na loja.
 */
export async function requestStoreReview(): Promise<void> {
  try {
    const modulo = getStoreReviewModule();
    if (modulo && (await modulo.isAvailableAsync())) {
      await modulo.requestReview();
      return;
    }
  } catch {
    // segue para o fallback da página da loja
  }

  await openStorePageUrl();
}

/** Abre direto a página do app na loja (item permanente das Configurações). */
export async function openStorePage(): Promise<void> {
  await openStorePageUrl();
}

export async function sendFeedbackEmail(category: FeedbackCategory, message: string): Promise<void> {
  const url = buildFeedbackMailtoUrl({
    category,
    message,
    appVersion: Constants.expoConfig?.version ?? 'desconhecida',
    platform: Platform.OS,
    osVersion: String(Platform.Version),
  });

  await Linking.openURL(url);
}
