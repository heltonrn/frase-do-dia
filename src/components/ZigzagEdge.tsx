import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';

interface ZigzagEdgeProps {
  /** 'top' desenha os dentes apontando para cima; 'bottom', para baixo. */
  direction: 'top' | 'bottom';
  /** Quantidade de dentes do serrilhado. */
  teeth?: number;
}

const TOOTH_SIZE = 8;

/**
 * Borda serrilhada de "ticket", usada acima e abaixo do cartão da frase.
 * Desenhada com triângulos de borda (técnica padrão do React Native),
 * sem dependência de SVG.
 */
export function ZigzagEdge({ direction, teeth = 18 }: ZigzagEdgeProps): React.JSX.Element {
  const items = Array.from({ length: teeth }, (_, indice) => indice);
  return (
    <View style={styles.row} pointerEvents="none">
      {items.map((indice) => (
        <View
          key={indice}
          style={[styles.tooth, direction === 'top' ? styles.toothTop : styles.toothBottom]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  tooth: {
    width: 0,
    height: 0,
    borderLeftWidth: TOOTH_SIZE,
    borderRightWidth: TOOTH_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  toothTop: {
    borderBottomWidth: TOOTH_SIZE,
    borderBottomColor: colors.paper,
  },
  toothBottom: {
    borderTopWidth: TOOTH_SIZE,
    borderTopColor: colors.paper,
  },
});
