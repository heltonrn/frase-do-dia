import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '../theme';

interface ReviewPromptCardProps {
  onYes(): void;
  onImprove(): void;
  onLater(): void;
}

/**
 * Pedido de avaliação em duas etapas: primeiro pergunta se o usuário está
 * gostando; só quem responde "sim" é convidado a avaliar na loja.
 */
export function ReviewPromptCard({
  onYes,
  onImprove,
  onLater,
}: ReviewPromptCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconeCaixa}>
          <Text style={styles.icone}>★</Text>
        </View>
        <Text style={styles.pergunta}>Está gostando do Frase do Dia?</Text>
      </View>
      <View style={styles.acoes}>
        <Pressable
          accessibilityRole="button"
          onPress={onYes}
          style={({ pressed }) => [styles.botaoPrimario, pressed && styles.pressionado]}
        >
          <Text style={styles.rotuloPrimario}>Sim, estou!</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onImprove}
          style={({ pressed }) => [styles.botaoSecundario, pressed && styles.pressionado]}
        >
          <Text style={styles.rotuloSecundario}>Pode melhorar</Text>
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onLater}
        style={({ pressed }) => [styles.botaoDepois, pressed && styles.pressionado]}
      >
        <Text style={styles.rotuloDepois}>Agora não</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.mustardLight,
    borderRadius: 16,
    gap: spacing.sm + 4,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm + 4,
  },
  iconeCaixa: {
    alignItems: 'center',
    backgroundColor: colors.mustard,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  icone: {
    color: colors.paper,
    fontSize: 20,
  },
  pergunta: {
    color: colors.forestDark,
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 16,
    lineHeight: 21,
  },
  acoes: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  botaoPrimario: {
    alignItems: 'center',
    backgroundColor: colors.forest,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  rotuloPrimario: {
    color: colors.paper,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  botaoSecundario: {
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderColor: colors.forest,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  rotuloSecundario: {
    color: colors.forestDark,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  botaoDepois: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  rotuloDepois: {
    color: colors.inkSoft,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  pressionado: {
    opacity: 0.7,
  },
});
