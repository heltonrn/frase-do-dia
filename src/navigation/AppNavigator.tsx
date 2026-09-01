import React, { useState } from 'react';

import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

type Tela = 'home' | 'configuracoes';

/**
 * Navegação do MVP: apenas duas telas, alternadas por estado local.
 *
 * Decisão deliberada de não adicionar react-navigation (e suas quatro
 * dependências nativas) para um app de duas telas — seção 13 do MD:
 * "evitar dependências desnecessárias". Se o app ganhar mais telas no
 * futuro, este componente é o único ponto a substituir.
 */
export function AppNavigator(): React.JSX.Element {
  const [tela, setTela] = useState<Tela>('home');

  if (tela === 'configuracoes') {
    return <SettingsScreen onVoltar={() => setTela('home')} />;
  }
  return <HomeScreen onAbrirConfiguracoes={() => setTela('configuracoes')} />;
}
