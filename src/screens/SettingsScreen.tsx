import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { AdBanner } from '../components/AdBanner';
import { useNotificationSettings } from '../hooks/useNotificationSettings';
import { colors, fonts, spacing } from '../theme';

interface SettingsScreenProps {
  onVoltar(): void;
}

function formatarHorario(hora: number, minuto: number): string {
  return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
}

/** Tela de configurações: notificação diária (toggle + horário). */
export function SettingsScreen({ onVoltar }: SettingsScreenProps): React.JSX.Element {
  const config = useNotificationSettings();

  const mudarHora = (delta: number): void => {
    const novaHora = (config.hora + delta + 24) % 24;
    void config.definirHorario(novaHora, config.minuto);
  };

  const mudarMinuto = (delta: number): void => {
    const novoMinuto = (config.minuto + delta + 60) % 60;
    void config.definirHorario(config.hora, novoMinuto);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar para a frase do dia"
          onPress={onVoltar}
          hitSlop={12}
        >
          <Text style={styles.titulo}>← Configurações</Text>
        </Pressable>
      </View>

      <View style={styles.corpo}>
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Notificação diária</Text>

          <View style={styles.linha}>
            <View style={styles.linhaTextos}>
              <Text style={styles.linhaTitulo}>Lembrete diário</Text>
              <Text style={styles.linhaSubtitulo}>
                Avisa quando a frase do dia estiver disponível
              </Text>
            </View>
            <Switch
              accessibilityLabel="Ativar ou desativar o lembrete diário"
              value={config.ativa}
              onValueChange={() => void config.alternar()}
              trackColor={{ false: colors.line, true: colors.forest }}
              thumbColor={colors.paper}
              disabled={!config.carregado || !config.suportado}
            />
          </View>

          <View style={[styles.linha, styles.linhaComBorda]}>
            <Text style={styles.linhaTitulo}>Horário</Text>
            <View style={styles.seletorHorario}>
              <View style={styles.grupoStepper}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Diminuir uma hora"
                  style={styles.stepper}
                  onPress={() => mudarHora(-1)}
                >
                  <Text style={styles.stepperTexto}>−</Text>
                </Pressable>
                <Text style={styles.horarioTexto}>
                  {formatarHorario(config.hora, config.minuto)}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Aumentar uma hora"
                  style={styles.stepper}
                  onPress={() => mudarHora(1)}
                >
                  <Text style={styles.stepperTexto}>+</Text>
                </Pressable>
              </View>
              <View style={styles.grupoMinutos}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Diminuir quinze minutos"
                  style={styles.stepperPequeno}
                  onPress={() => mudarMinuto(-15)}
                >
                  <Text style={styles.stepperPequenoTexto}>−15 min</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Aumentar quinze minutos"
                  style={styles.stepperPequeno}
                  onPress={() => mudarMinuto(15)}
                >
                  <Text style={styles.stepperPequenoTexto}>+15 min</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {!config.suportado && (
            <Text style={styles.avisoPermissao}>
              Notificações não funcionam no Expo Go do Android. Use um development build
              para testar este recurso — no aplicativo publicado funciona normalmente.
            </Text>
          )}

          {config.permissaoNegada && (
            <Text style={styles.avisoPermissao}>
              A permissão de notificações está desativada. Habilite nas configurações do sistema
              para receber o lembrete.
            </Text>
          )}
        </View>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm + 4,
  },
  titulo: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: colors.forestDark,
  },
  corpo: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
  },
  cardTitulo: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.forestDark,
    marginBottom: spacing.sm + 4,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  linhaComBorda: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  linhaTextos: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  linhaTitulo: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.ink,
  },
  linhaSubtitulo: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.inkSoft,
    marginTop: 2,
  },
  seletorHorario: {
    alignItems: 'flex-end',
  },
  grupoStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.forestLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperTexto: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.forestDark,
  },
  horarioTexto: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.forestDark,
    minWidth: 56,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  grupoMinutos: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  stepperPequeno: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.forestLight,
  },
  stepperPequenoTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11.5,
    color: colors.forestDark,
  },
  avisoPermissao: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.plum,
    backgroundColor: colors.plumLight,
    borderRadius: 10,
    padding: spacing.sm + 2,
    marginTop: spacing.sm,
  },
});
