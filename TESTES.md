# Roteiro de testes manuais — Frase do Dia

Os testes automatizados (`npm test`) já cobrem toda a lógica pura:
validação da base, sincronização/merge, motor da frase do dia
(cenários 1–7 e 10 do documento de requisitos), formato de
compartilhamento e parse de horário.

Este roteiro cobre o que **só pode ser verificado no aparelho**:
SQLite real, folha de compartilhamento, notificações do sistema e o
banner de anúncio.

## Ambientes

| Teste | Expo Go | Development build |
|---|---|---|
| Frase do dia + persistência | ✅ | ✅ |
| Compartilhamento | ✅ | ✅ |
| Notificações | ⚠️ parcial (Android tem limitações no Expo Go) | ✅ |
| Banner de anúncio | ❌ não aparece (proposital) | ✅ |

Para o development build: `npx expo run:android` (com Android Studio) ou
`eas build --profile development` nas duas plataformas.

## M1 — Primeiro acesso (cenário 1)
1. Instalar e abrir o app pela primeira vez.
2. **Esperado:** spinner breve → uma frase aparece no ticket com
   categoria, aspas, autor e a data de hoje por extenso.

## M2 — Reabertura no mesmo dia (cenário 2)
1. Fechar o app por completo (remover da lista de recentes) e reabrir.
2. **Esperado:** exatamente a mesma frase, sem nova seleção.

## M3 — Novo dia (cenário 3)
1. No dia seguinte (real), abrir o app.
2. **Esperado:** frase nova, diferente da anterior.

## M4 — Reinicialização do aparelho (cenário 7)
1. Reiniciar o telefone e abrir o app no mesmo dia.
2. **Esperado:** mesma frase do dia; histórico preservado.

## M5 — Virada de meia-noite com app em segundo plano
1. Deixar o app aberto em background antes da meia-noite; após a
   virada, trazê-lo de volta ao primeiro plano.
2. **Esperado:** a tela atualiza sozinha para a frase do novo dia.

## M6 — Relógio do aparelho
1. Com a frase de hoje exibida, atrasar manualmente a data do sistema
   em alguns dias e reabrir o app.
2. **Esperado:** continua exibindo a mesma frase registrada — nenhuma
   frase extra é consumida.
3. Restaurar a data automática ao final.

## M7 — Compartilhamento (cenário 8)
1. Tocar em "↗ Compartilhar".
2. **Esperado:** folha nativa do sistema abre; enviar para o WhatsApp
   (ou outro app) e conferir o formato: frase entre aspas, linha em
   branco, travessão e autor.
3. Voltar ao app: a frase do dia permanece a mesma.
4. Repetir no Android e no iOS.

## M8 — Notificação diária (cenário 9)
1. Abrir Configurações (engrenagem) e ativar o lembrete.
2. **Esperado:** o sistema pede permissão na primeira ativação.
3. Definir um horário 2–3 minutos à frente e aguardar com o app fechado.
4. **Esperado:** notificação "Sua frase de hoje está esperando por
   você" chega no horário; tocar nela abre o app na frase do dia — a
   mesma já registrada, nunca uma segunda frase.
5. Negar a permissão no sistema e tentar ativar de novo.
6. **Esperado:** aviso em vinho orientando a habilitar nas
   configurações do sistema; o toggle não liga.
7. Desativar o lembrete e conferir que a notificação não chega mais.
8. Repetir no Android e no iOS (os fluxos de permissão diferem).

## M9 — Banner (somente development build)
1. Abrir o app no development build.
2. **Esperado:** banner de TESTE do Google no rodapé, sem cobrir a
   frase nem o botão de compartilhar.
3. Ativar modo avião e abrir o app.
4. **Esperado:** sem internet o banner simplesmente não aparece e o
   restante funciona normalmente (offline-first, RN08).

## M10 — Atualização da base (quando existir uma v2)
1. Com o app já usado por alguns dias, instalar a versão com a base v2
   por cima (sem desinstalar).
2. **Esperado:** histórico e ciclo preservados; as frases novas passam
   a concorrer no sorteio dos próximos dias.

## Registro

Anotar para cada item: dispositivo, sistema/versão, resultado
(passou/falhou) e evidência (print) em caso de falha.
