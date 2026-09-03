# Publicação — Frase do Dia (Fase 10)

## Já pronto no projeto

- [x] Ícone, adaptive icon (Android), ícone monocromático e splash na
      identidade visual (assets/).
- [x] app.json: nome "Frase do Dia", versão 1.0.0, cores da marca,
      pacote Android `com.frasedodia.app`, bundle iOS idem, splash.
- [x] eas.json com perfis development / preview (APK) / production.
- [x] AdMob Android: App ID e bloco reais configurados; em
      desenvolvimento o app usa automaticamente os IDs de teste.
- [x] Minuta da política de privacidade (POLITICA_DE_PRIVACIDADE.md).

## Decisões/ações que dependem de você

1. **Nome do pacote Android** — está `com.frasedodia.app`. IMPORTANTE:
   depois do primeiro envio à Play Store ele NUNCA mais pode mudar.
   Se preferir usar um domínio seu (ex.: `br.com.suaempresa.frasedodia`),
   troque em `app.json` (android.package e ios.bundleIdentifier) ANTES
   do primeiro build de produção.
2. **Política de privacidade** — preencher data e e-mail de contato na
   minuta e HOSPEDAR em uma URL pública (GitHub Pages resolve). A URL é
   exigida no cadastro da Play Store e do App Store Connect.
3. **Conta Google Play Console** — criar (taxa única de US$ 25) e
   preencher a ficha do app: descrição, capturas de tela, classificação
   etária, formulário de segurança de dados (declarar: app não coleta
   dados; AdMob coleta identificadores para publicidade).
4. **Conta Expo/EAS** — criar em expo.dev (gratuita) e rodar
   `npx eas login` na sua máquina.
5. **iOS (opcional/depois)** — Apple Developer (US$ 99/ano), criar o
   app iOS no AdMob e substituir os placeholders de iOS em
   `src/constants/ads.ts` e `app.json`.

## Anúncios: teste vs produção

O app decide qual bloco de anúncio usar pela variável `EXPO_PUBLIC_ADS_ENV`,
definida por perfil no `eas.json` — não pelo `__DEV__` (que é sempre
`false` em qualquer APK/AAB gerado pelo EAS, inclusive o preview):

- `development` e `preview` → `"test"` (bloco de teste do Google).
- `production` → `"production"` (seu bloco real).

Se um dia adicionar um novo perfil no `eas.json`, lembre de definir essa
variável nele também — sem ela, o app cai no padrão seguro (teste).

## Fase de testes internos — o que é realmente exigido

A trilha **"Teste interno"** do Play Console é bem mais leve que
produção. Pra colocar o app lá, você precisa de:

- [ ] Conta no Play Console criada (taxa única de US$ 25).
- [ ] App criado no console (nome, idioma padrão PT-BR, categoria).
- [ ] **Ficha da loja básica**: ícone, título, descrições curta/longa
      — já preparados em `FICHA_PLAY_STORE.md`. Capturas de tela **não
      são obrigatórias para teste interno** (só entram quando promover
      pra produção).
- [ ] **Formulário de Segurança de Dados** preenchido (obrigatório
      mesmo em teste) — roteiro pronto em `FICHA_PLAY_STORE.md`.
- [ ] **Classificação de conteúdo** (questionário do IARC) —
      respostas sugeridas em `FICHA_PLAY_STORE.md`.
- [ ] Política de privacidade **hospedada numa URL pública** e
      informada no console.
- [ ] Lista de e-mails dos testadores (até 100 pessoas na trilha
      interna) — inclui você mesmo.
- [ ] Uma "Service Account" do Google Cloud com permissão de acesso à
      API do Play Console, pra `eas submit` funcionar (veja abaixo).

O que **não** precisa agora: capturas de tela em vários tamanhos,
vídeo promocional, texto de novidades da versão — tudo isso só é
cobrado quando o app sai de teste e vai pra revisão de produção.

### Criando a Service Account (necessária para `eas submit`)

1. No **Google Cloud Console**, criar um projeto (ou usar um
   existente) e ativar a **Google Play Android Developer API**.
2. Criar uma **conta de serviço** (Service Account), gerar uma chave
   JSON e baixar o arquivo.
3. No **Play Console** → Configurações → Acesso à API → vincular esse
   projeto do Google Cloud e dar à conta de serviço a permissão
   **"Administrador (acesso total)"** ou, no mínimo, permissão de
   gerenciar versões.
4. Salvar o arquivo baixado como `play-store-service-account.json` na
   raiz do projeto (já está no `.gitignore` — nunca vai pro
   repositório).

## Sequência de comandos (na sua máquina)

```bash
npm install                       # dependências
npx eas login                     # sua conta Expo
npx eas build:configure           # vincula o projeto ao EAS (gera projectId)

# 1) Testar notificações e banner de verdade (APK instalável):
npx eas build --platform android --profile preview

# 2) Build de produção (AAB) para a trilha de teste interno:
npx eas build --platform android --profile production

# 3) Enviar à trilha de teste interno (usa a Service Account acima):
npx eas submit --platform android
```

Depois do `eas submit`, o AAB aparece no Play Console dentro de
**Teste > Teste interno**, em análise (geralmente libera em minutos a
poucas horas, bem mais rápido que a revisão de produção). Daí é só
adicionar os e-mails dos testadores e compartilhar o link de opt-in.

## Antes de apertar o botão de produção

- [ ] Rodar o roteiro TESTES.md no APK de preview (M1–M10 — nele o
      banner e as notificações funcionam de verdade).
- [ ] Conferir que o banner exibido no preview é o de TESTE do Google
      (por segurança da conta AdMob, anúncio real só no build final).
- [ ] Vincular o app à Play Store no painel do AdMob após a publicação
      e configurar o app-ads.txt se solicitado.
- [ ] Guardar a keystore/credenciais que o EAS gerar (ele guarda na
      nuvem por padrão — não perder o acesso à conta Expo).
