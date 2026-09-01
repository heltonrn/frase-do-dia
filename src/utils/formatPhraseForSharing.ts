import { Phrase } from '../types/Phrase';

/**
 * Formata a frase para compartilhamento, no formato definido na
 * seção 8 do MD:
 *
 *   "Texto da frase"
 *
 *   — Autor
 *
 * Função pura, sem dependência de plataforma, para poder ser testada
 * isoladamente.
 */
export function formatPhraseForSharing(frase: Phrase): string {
  return `\u201C${frase.texto}\u201D\n\n\u2014 ${frase.autor}`;
}
