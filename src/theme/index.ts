/**
 * Tokens visuais do aplicativo — mesma paleta e tipografia do mock
 * aprovado (padrão visual compartilhado com o Meu Mercado).
 */
export const colors = {
  cream: '#FAF6EE',
  paper: '#FFFFFF',
  forest: '#2B6E52',
  forestDark: '#1F5540',
  forestLight: '#E4EFE6',
  mustard: '#C9922E',
  mustardLight: '#F6E8CE',
  plum: '#8B3A4B',
  plumLight: '#F3E1E4',
  ink: '#2B2620',
  inkSoft: '#83786C',
  line: '#E9E2D6',
} as const;

export const fonts = {
  display: 'Quicksand_700Bold',
  displaySemiBold: 'Quicksand_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
