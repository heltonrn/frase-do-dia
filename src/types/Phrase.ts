import { Categoria } from '../constants/categories';

/**
 * Representa uma frase da base do aplicativo.
 *
 * O campo `id` é permanente: uma vez publicado, nunca deve ser
 * reaproveitado para um texto diferente, nem removido do banco local.
 * É esse id estável que permite comparar a base instalada com uma
 * base nova (vinda de atualização do app) e identificar exatamente
 * quais frases são novidade — ver PhraseRepository (Fase 3).
 */
export interface Phrase {
  /** Identificador estável e permanente da frase (ex: "frase-001"). */
  id: string;
  /** Texto da frase, sem aspas — a formatação de exibição fica na UI. */
  texto: string;
  /** Autor conhecido, ou "Autor desconhecido" quando não confirmado. */
  autor: string;
  /** Categoria temática da frase. */
  categoria: Categoria;
  /**
   * Indica se a frase pode ser sorteada. Frases descontinuadas devem
   * ser marcadas como false, nunca apagadas do banco (RN06/RN03).
   */
  ativo: boolean;
}

/**
 * Formato do pacote de conteúdo distribuído com o app (ver src/database/phrasesData.ts).
 * `versaoBase` é um contador só da base de frases, independente da versão do app.
 */
export interface PhraseBasePackage {
  versaoBase: number;
  frases: Phrase[];
}
