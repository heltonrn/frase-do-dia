import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Phrase } from '../types/Phrase';
import { colors, fonts, spacing } from '../theme';
import { ZigzagEdge } from './ZigzagEdge';

interface PhraseCardProps {
  frase: Phrase;
}

/** Cartão em formato de ticket com a frase do dia. */
export function PhraseCard({ frase }: PhraseCardProps): React.JSX.Element {
  return (
    <View>
      <ZigzagEdge direction="top" />
      <View style={styles.card}>
        <View style={styles.categoriaChip}>
          <Text style={styles.categoriaTexto}>{frase.categoria}</Text>
        </View>
        <Text style={styles.aspas}>{'\u201C'}</Text>
        <Text style={styles.texto}>{frase.texto}</Text>
        <Text style={styles.autor}>— {frase.autor}</Text>
      </View>
      <ZigzagEdge direction="bottom" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl - 2,
    paddingBottom: spacing.lg - 2,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 4,
  },
  categoriaChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.forestLight,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: spacing.md,
  },
  categoriaTexto: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 11,
    color: colors.forestDark,
    letterSpacing: 0.2,
  },
  aspas: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 40,
    color: colors.mustard,
    marginBottom: -spacing.sm,
  },
  texto: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.ink,
    marginBottom: spacing.md + 2,
  },
  autor: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.inkSoft,
  },
});
