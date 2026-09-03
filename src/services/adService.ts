import Constants, { ExecutionEnvironment } from 'expo-constants';
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
 * O SDK do AdMob só existe em development build / produção. No Expo Go
 * o módulo nativo não está presente e a simples tentativa de require
 * gera erro ruidoso no console — então nem tentamos.
 */
export function isAdsSupported(): boolean {
  return Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
}

/**
 * Tenta carregar o SDK. Retorna null quando o módulo nativo não está
 * presente (ex.: Expo Go) — nunca lança.
 */
export function loadAdsModule(): GoogleMobileAdsModule | null {
  if (!isAdsSupported()) {
    return null;
  }
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
 * Decide se o app deve usar os blocos de anúncio de TESTE.
 *
 * IMPORTANTE: `__DEV__` não serve para essa decisão — ele só é `true`
 * dentro do Metro/Expo Go. Um APK gerado por `eas build` (inclusive o
 * perfil "preview", usado para testar no aparelho) já roda com
 * `__DEV__ = false`, então usaria o bloco de PRODUÇÃO sem querer.
 *
 * Em vez disso, usamos a variável pública `EXPO_PUBLIC_ADS_ENV`,
 * definida por perfil em eas.json: "test" em development/preview,
 * "production" apenas no perfil de produção. Variáveis EXPO_PUBLIC_*
 * são embutidas no bundle JS em tempo de build, então cada perfil sai
 * com o valor certo já fixado.
 */
function deveUsarBlocoDeTeste(): boolean {
  return process.env.EXPO_PUBLIC_ADS_ENV !== 'production';
}

/**
 * Resolve o id do bloco de banner conforme plataforma e ambiente.
 */
export function getBannerUnitId(): string {
  if (deveUsarBlocoDeTeste()) {
    return Platform.OS === 'ios' ? AD_UNIT_BANNER_IOS_TESTE : AD_UNIT_BANNER_ANDROID_TESTE;
  }
  return Platform.OS === 'ios' ? AD_UNIT_BANNER_IOS_PRODUCAO : AD_UNIT_BANNER_ANDROID_PRODUCAO;
}
