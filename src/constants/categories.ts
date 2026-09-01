/**
 * Categorias temáticas das frases (seção 4 do documento de requisitos).
 * Lista não é definitiva — novas categorias podem ser adicionadas aqui
 * sem exigir mudança de schema, pois é um union type simples.
 */
export const CATEGORIAS = [
  'Motivação',
  'Sucesso',
  'Persistência',
  'Coragem',
  'Disciplina',
  'Foco',
  'Superação',
  'Felicidade',
  'Vida',
  'Reflexão',
  'Sabedoria',
  'Gratidão',
  'Relacionamentos',
  'Trabalho',
  'Estudos',
  'Humor/reflexão leve',
] as const;

export type Categoria = (typeof CATEGORIAS)[number];
