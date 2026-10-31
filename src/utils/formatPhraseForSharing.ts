import { Phrase } from '../types/Phrase';

/** Link do app na Google Play (válido a partir da publicação). */
export const LINK_APP =
  'https://play.google.com/store/apps/details?id=br.com.volvet.frasedodia.app';

/** Assinatura adicionada ao final de todo conteúdo compartilhado. */
export const ASSINATURA_APP = `📲 Frase do Dia — uma frase por dia\n${LINK_APP}`;

/**
 * Formata a frase para compartilhamento (seção 8 do MD), com a
 * assinatura do aplicativo ao final:
 *
 *   "Texto da frase"
 *
 *   — Autor
 *
 *   📲 Frase do Dia — uma frase por dia
 *   <link do app>
 *
 * Função pura, sem dependência de plataforma, para poder ser testada
 * isoladamente.
 */
export function formatPhraseForSharing(frase: Phrase): string {
  return `“${frase.texto}”\n\n— ${frase.autor}\n\n${ASSINATURA_APP}`;
}
