import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AdBanner } from '../components/AdBanner';
import { PhraseCard } from '../components/PhraseCard';
import { useDailyPhrase } from '../hooks/useDailyPhrase';
import { sharePhrase } from '../services/sharingService';
import { colors, fonts, spacing } from '../theme';

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function formatarDataExtenso(data: Date): string {
  return `${data.getDate()} de ${MESES[data.getMonth()]} de ${data.getFullYear()}`;
}

interface HomeScreenProps {
  onAbrirConfiguracoes(): void;
}

/** Tela principal: exibe a frase do dia. */
export function HomeScreen({ onAbrirConfiguracoes }: HomeScreenProps): React.JSX.Element {
  const estado = useDailyPhrase();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>📖 Frase do Dia</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir configurações"
          style={styles.engrenagem}
          onPress={onAbrirConfiguracoes}
          hitSlop={8}
        >
          <Text style={styles.engrenagemIcone}>⚙</Text>
        </Pressable>
      </View>

      <View style={styles.conteudo}>
        {estado.status === 'carregando' && (
          <ActivityIndicator size="large" color={colors.forest} />
        )}

        {estado.status === 'ok' && (
          <>
            <Text style={styles.data}>{formatarDataExtenso(new Date())}</Text>
            <PhraseCard frase={estado.frase} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Compartilhar a frase do dia"
              style={({ pressed }) => [styles.botaoCompartilhar, pressed && styles.botaoPressionado]}
              onPress={() => void sharePhrase(estado.frase)}
            >
              <Text style={styles.botaoCompartilharTexto}>↗ Compartilhar</Text>
            </Pressable>
            <Text style={styles.dica}>Volte amanhã para uma nova frase</Text>
          </>
        )}

        {estado.status === 'sem_frases' && (
          <Text style={styles.mensagem}>
            Nenhuma frase disponível no momento. Atualize o aplicativo para receber novas frases.
          </Text>
        )}

        {estado.status === 'erro' && (
          <Text style={styles.mensagem}>
            Não foi possível carregar a frase de hoje. Feche e abra o aplicativo novamente.
          </Text>
        )}
      </View>

      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    paddingHorizontal: spacing.md + 2,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titulo: {
    fontFamily: fonts.display,
    fontSize: 19,
    color: colors.forestDark,
  },
  engrenagem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.forestLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  engrenagemIcone: {
    fontSize: 15,
    color: colors.forestDark,
  },
  conteudo: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md + 2,
  },
  data: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: spacing.sm + 2,
  },
  dica: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  botaoCompartilhar: {
    backgroundColor: colors.forest,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: spacing.lg - 2,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  botaoPressionado: {
    backgroundColor: colors.forestDark,
  },
  botaoCompartilharTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14.5,
    color: colors.paper,
  },
  mensagem: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkSoft,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
