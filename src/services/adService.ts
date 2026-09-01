import { Platform } from 'react-native';

import {
  AD_UNIT_BANNER_ANDROID_PRODUCAO,
  AD_UNIT_BANNER_ANDROID_TESTE,
  AD_UNIT_BANNER_IOS_PRODUCAO,
  AD_UNIT_BANNER_IOS_TESTE,
} from '../constants/ads';

/**
 * Serviço de publicidade (seção 9 do MD). Isola completamente o SDK
 * react-native-google-mobile-ads (seção 12): nenhum outro arquivo do
 * app importa a biblioteca diretamente.
 *
 * O SDK exige código nativo e portanto NÃO funciona no Expo Go — só em
 * development build ou build de produção. Por isso o carregamento é
 * dinâmico e protegido: quando o módulo nativo não existe, o app segue
 * funcionando normalmente, apenas sem banner (a experiência principal
 * nunca depende de publicidade).
 */

/** Subconjunto tipado do SDK que o aplicativo utiliza. */
export interface GoogleMobileAdsModule {
  default: () => { initialize: () => Promise<unknown> };
  BannerAd: React.ComponentType<{
    unitId: string;
    size: string;
    onAdFailedToLoad?: (error: Error) => void;
  }>;
  BannerAdSize: { ANCHORED_ADAPTIVE_BANNER: string };
}

let moduloCarregado: GoogleMobileAdsModule | null = null;
let tentouCarregar = false;
let inicializado = false;

/**
 * Tenta carregar o SDK. Retorna null quando o módulo nativo não está
 * presente (ex.: Expo Go) — nunca lança.
 */
export function loadAdsModule(): GoogleMobileAdsModule | null {
  if (tentouCarregar) {
    return moduloCarregado;
  }
  tentouCarregar = true;
  try {
    // Require dinâmico protegido: no Expo Go o módulo nativo não existe
    // e o require lança — o catch garante degradação silenciosa.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    moduloCarregado = require('react-native-google-mobile-ads') as GoogleMobileAdsModule;
  } catch {
    moduloCarregado = null;
  }
  return moduloCarregado;
}

/** Inicializa o SDK uma única vez, se disponível. */
export async function initializeAds(): Promise<void> {
  const modulo = loadAdsModule();
  if (!modulo || inicializado) {
    return;
  }
  try {
    await modulo.default().initialize();
    inicializado = true;
  } catch (erro) {
    console.error('Falha ao inicializar o SDK de anúncios:', erro);
  }
}

/**
 * Resolve o id do bloco de banner conforme plataforma e ambiente.
 * Em desenvolvimento sempre usa os ids de teste do Google (obrigatório
 * pela política do AdMob).
 */
export function getBannerUnitId(): string {
  if (__DEV__) {
    return Platform.OS === 'ios' ? AD_UNIT_BANNER_IOS_TESTE : AD_UNIT_BANNER_ANDROID_TESTE;
  }
  return Platform.OS === 'ios' ? AD_UNIT_BANNER_IOS_PRODUCAO : AD_UNIT_BANNER_ANDROID_PRODUCAO;
}
