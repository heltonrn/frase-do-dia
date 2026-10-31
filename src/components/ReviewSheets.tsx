import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  FEEDBACK_CATEGORIES,
  FeedbackCategory,
  REVIEW_FEEDBACK_EMAIL,
} from '../services/reviewPolicy';
import { colors, fonts, spacing } from '../theme';

interface SheetShellProps {
  visible: boolean;
  onClose(): void;
  children: React.ReactNode;
}

function SheetShell({ visible, onClose, children }: SheetShellProps): React.JSX.Element {
  return (
    <Modal
      accessibilityViewIsModal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>{children}</View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface BotaoProps {
  rotulo: string;
  onPress(): void;
  desabilitado?: boolean;
}

function BotaoPrimario({ rotulo, onPress, desabilitado }: BotaoProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={desabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        styles.botaoPrimario,
        (pressed || desabilitado) && styles.pressionado,
      ]}
    >
      <Text style={styles.rotuloPrimario}>{rotulo}</Text>
    </Pressable>
  );
}

function BotaoTexto({ rotulo, onPress }: BotaoProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.botaoTexto, pressed && styles.pressionado]}
    >
      <Text style={styles.rotuloTexto}>{rotulo}</Text>
    </Pressable>
  );
}

interface StoreReviewSheetProps {
  visible: boolean;
  onConfirm(): void;
  onDismiss(): void;
}

/** Convite exibido a quem respondeu "Sim, estou!" no cartão da Home. */
export function StoreReviewSheet({
  visible,
  onConfirm,
  onDismiss,
}: StoreReviewSheetProps): React.JSX.Element {
  return (
    <SheetShell onClose={onDismiss} visible={visible}>
      <View style={styles.centralizado}>
        <View style={styles.iconeCaixa}>
          <Text style={styles.iconeGrande}>📖</Text>
        </View>
        <Text style={styles.titulo}>Que bom que você curte!</Text>
        <Text style={styles.corpo}>
          Uma avaliação na loja leva menos de um minuto e ajuda o Frase do Dia a chegar a mais
          pessoas.
        </Text>
        <Text accessibilityLabel="Cinco estrelas" style={styles.estrelas}>
          ★★★★★
        </Text>
      </View>
      <BotaoPrimario onPress={onConfirm} rotulo="Avaliar na loja" />
      <BotaoTexto onPress={onDismiss} rotulo="Mais tarde" />
    </SheetShell>
  );
}

interface FeedbackSheetProps {
  visible: boolean;
  onSend(category: FeedbackCategory, message: string): Promise<void>;
  onCancel(): void;
}

/** Feedback privado enviado por e-mail (sem backend). */
export function FeedbackSheet({
  visible,
  onSend,
  onCancel,
}: FeedbackSheetProps): React.JSX.Element {
  const [category, setCategory] = useState<FeedbackCategory>(FEEDBACK_CATEGORIES[0]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(): Promise<void> {
    if (message.trim().length === 0) {
      setError('Escreva uma sugestão antes de enviar.');
      return;
    }

    setSending(true);
    setError(null);
    try {
      await onSend(category, message);
      setMessage('');
    } catch {
      setError(`Não foi possível abrir seu app de e-mail. Escreva para ${REVIEW_FEEDBACK_EMAIL}.`);
    } finally {
      setSending(false);
    }
  }

  return (
    <SheetShell onClose={onCancel} visible={visible}>
      <Text style={styles.titulo}>Como podemos melhorar?</Text>
      <Text style={styles.corpoEsquerda}>
        Sua sugestão chega direto para nós e nos ajuda a evoluir o Frase do Dia.
      </Text>
      <View style={styles.chips}>
        {FEEDBACK_CATEGORIES.map((item) => {
          const selecionado = item === category;
          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected: selecionado }}
              onPress={() => setCategory(item)}
              style={[styles.chip, selecionado && styles.chipSelecionado]}
            >
              <Text style={[styles.chipRotulo, selecionado && styles.chipRotuloSelecionado]}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.rotuloCampo}>Conte um pouco mais</Text>
      <TextInput
        accessibilityLabel="Conte um pouco mais"
        multiline
        onChangeText={setMessage}
        placeholder="O que você gostaria de ver no Frase do Dia?"
        placeholderTextColor={colors.inkSoft}
        style={styles.campo}
        textAlignVertical="top"
        value={message}
      />
      {error ? <Text style={styles.erro}>{error}</Text> : null}
      <BotaoPrimario
        desabilitado={sending}
        onPress={() => void handleSend()}
        rotulo={sending ? 'Abrindo e-mail...' : 'Enviar sugestão'}
      />
      <BotaoTexto onPress={onCancel} rotulo="Cancelar" />
    </SheetShell>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(43, 38, 32, 0.45)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: spacing.sm + 4,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  centralizado: {
    alignItems: 'center',
    gap: spacing.sm + 4,
  },
  iconeCaixa: {
    alignItems: 'center',
    backgroundColor: colors.forestLight,
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  iconeGrande: {
    fontSize: 30,
  },
  titulo: {
    color: colors.forestDark,
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
  },
  corpo: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  corpoEsquerda: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  estrelas: {
    color: colors.mustard,
    fontSize: 34,
    letterSpacing: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.forestLight,
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 14,
  },
  chipSelecionado: {
    backgroundColor: colors.forest,
  },
  chipRotulo: {
    color: colors.forestDark,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
  },
  chipRotuloSelecionado: {
    color: colors.paper,
  },
  rotuloCampo: {
    color: colors.ink,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  campo: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 15,
    minHeight: 110,
    padding: spacing.sm + 4,
  },
  erro: {
    color: colors.plum,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 17,
  },
  botaoPrimario: {
    alignItems: 'center',
    backgroundColor: colors.forest,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 48,
  },
  rotuloPrimario: {
    color: colors.paper,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
  botaoTexto: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  rotuloTexto: {
    color: colors.inkSoft,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
  },
  pressionado: {
    opacity: 0.7,
  },
});
