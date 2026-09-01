import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { getBannerUnitId, initializeAds, loadAdsModule } from '../services/adService';
import { colors } from '../theme';

/**
 * Banner discreto fixado na parte inferior das telas (seção 9 do MD).
 *
 * - Nunca cobre a frase: ocupa uma faixa própria abaixo do conteúdo.
 * - Sem SDK disponível (Expo Go) ou com falha de carregamento do
 *   anúncio, não renderiza nada — a experiência principal segue igual.
 */
export function AdBanner(): React.JSX.Element | null {
  const [pronto, setPronto] = useState(false);
  const [falhou, setFalhou] = useState(false);
  const modulo = loadAdsModule();

  useEffect(() => {
    if (!modulo) {
      return;
    }
    void initializeAds().then(() => setPronto(true));
  }, [modulo]);

  if (!modulo || !pronto || falhou) {
    return null;
  }

  const { BannerAd, BannerAdSize } = modulo;

  return (
    <View style={styles.faixa}>
      <BannerAd
        unitId={getBannerUnitId()}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={() => setFalhou(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  faixa: {
    alignItems: 'center',
    backgroundColor: colors.cream,
  },
});
