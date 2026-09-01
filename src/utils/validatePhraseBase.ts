import { Phrase, PhraseBasePackage } from '../types/Phrase';

export interface PhraseBaseValidationResult {
  valido: boolean;
  erros: string[];
}

function normalizarTexto(texto: string): string {
  return texto.trim().toLowerCase();
}

/**
 * Valida a base de frases contra os cuidados descritos na seção 4 do MD:
 * ids únicos, textos não duplicados (nem quase-duplicados por
 * normalização simples), e campos obrigatórios preenchidos.
 *
 * Não decide sozinho o que é "quase-duplicado" de forma sofisticada —
 * isso continua sendo trabalho de revisão editorial. Aqui pegamos só
 * os casos óbvios (mesmo texto, diferindo em espaços/maiúsculas).
 */
export function validatePhraseBase(pacote: PhraseBasePackage): PhraseBaseValidationResult {
  const erros: string[] = [];
  const idsVistos = new Set<string>();
  const textosVistos = new Map<string, string>();

  pacote.frases.forEach((frase: Phrase) => {
    if (!frase.id.trim()) {
      erros.push(`Frase com id vazio: "${frase.texto}"`);
      return;
    }
    if (idsVistos.has(frase.id)) {
      erros.push(`Id duplicado: ${frase.id}`);
    }
    idsVistos.add(frase.id);

    if (!frase.texto.trim()) {
      erros.push(`Frase ${frase.id} está com texto vazio`);
    }
    if (!frase.autor.trim()) {
      erros.push(`Frase ${frase.id} está sem autor (use "Autor desconhecido")`);
    }

    const chave = normalizarTexto(frase.texto);
    if (textosVistos.has(chave)) {
      erros.push(`Frase ${frase.id} é duplicada (ou quase-duplicada) da frase ${textosVistos.get(chave)}`);
    } else {
      textosVistos.set(chave, frase.id);
    }
  });

  return { valido: erros.length === 0, erros };
}
