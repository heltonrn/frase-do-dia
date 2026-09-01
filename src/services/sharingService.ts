import { Share } from 'react-native';

import { Phrase } from '../types/Phrase';
import { formatPhraseForSharing } from '../utils/formatPhraseForSharing';

/**
 * Abre a folha de compartilhamento nativa do sistema com a frase
 * formatada (seção 8 do MD). Usa o mecanismo nativo, então o usuário
 * escolhe o destino (WhatsApp, Telegram, e-mail etc.) — nenhuma
 * integração específica por aplicativo.
 *
 * Compartilhar não altera o controle da frase do dia (cenário 8):
 * este serviço não toca em persistência alguma.
 *
 * Retorna true se a folha foi aberta com sucesso, false em caso de
 * falha (ex.: restrição do sistema) — a tela decide como comunicar.
 */
export async function sharePhrase(frase: Phrase): Promise<boolean> {
  try {
    await Share.share({ message: formatPhraseForSharing(frase) });
    return true;
  } catch (erro) {
    console.error('Falha ao abrir o compartilhamento nativo:', erro);
    return false;
  }
}
