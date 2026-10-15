# 🎧 mixtape-web-v1

Front do Mixtape, o seu diário musical: Vue 3 + Vuetify 4 + Pinia + vue-router + vue-i18n +
@unhead/vue. A interface (componentes, tema, movimento, textos dos componentes) vem da biblioteca
**`@pedrolucaslopes/mixtape-ui`** (`mixtape-lib-v1`), instalada **pelo npm**; nada aqui importa
`../ui/src`. A API é o `mixtape-api-v1`. Cada um tem o próprio compose, sem rede compartilhada.

```bash
npm run dev                  # localhost:5180; /api vai para MIXTAPE_DEV_API (proxy do Vite)
npm run build                # tipos, traduções, ícones e o build do Vite (o mesmo do Dockerfile)
npm run lint
npm test                     # vitest: formulários, navegação, períodos, cliente HTTP
npm run check:testids        # cada página, layout e componente com data-testid (também no build)
npm run test:e2e             # Playwright no Chrome; E2E_BASE_URL aponta o front (padrão localhost:5180)
npm run check:locales        # pt-BR (referência), en e es, e cada chave usada no código
npm run sync:icons           # regenera src/plugins/icons.generated.ts a partir do @mdi/js
npm run check:icons          # falha se algum mdi-* do código não estiver registrado
npm run generate:api         # tipos da API a partir do OpenAPI (MIXTAPE_OPENAPI_URL)
npm run analyze              # o que pesa em cada chunk (build em node_modules/.tmp/analyze)
npm run edge:plan            # borda da Cloudflare: o que mudaria (ver cloudflare/README.md)
npm run edge:apply           # aplica a borda (token e zona no ambiente do terminal)
npm run test:edge            # confere a configuração da borda sem tocar na conta
docker compose up -d --build # nginx em localhost:${WEB_PORT}
COMPOSE_PROFILES=cloudflare docker compose up -d  # + o túnel da Cloudflare (precisa do token no .env)
```

---

## 📦 A biblioteca

- **Registro:** GitHub Packages, escopo `@pedrolucaslopes`. O `.npmrc` versionado aponta o escopo e lê
  `${NODE_AUTH_TOKEN}` do ambiente (token clássico só com `read:packages`). O npm não lê o `.env`:
  para `npm install` fora do Docker, o token precisa estar no ambiente do terminal.
- **Docker:** o compose passa `NODE_AUTH_TOKEN` do `.env` como **secret do BuildKit**; ele não vira
  camada nem fica no histórico da imagem.
- **CI:** `GITHUB_TOKEN` com `packages: read`, depois de dar a este repositório acesso ao pacote
  (*Manage Actions access* na página do pacote). Sem isso, o secret `MIXTAPE_LIB_TOKEN`.
- **Versão:** `^0.7.4`, do registro. Em 0.x o `^` não aceita a minor seguinte (é nela que a
  biblioteca quebra): trocar é `npm install @pedrolucaslopes/mixtape-ui@^0.<n>.0` e conferir o que
  mudou no `CLAUDE.md` dela. A 0.4.0 trocou `listens` por `listeners` no `MxItemCard`; a 0.5.0 trocou o
  `MxReactionBar` pelo `MxLikeButton` (coração), tirou o `MxCommentItem` e criou o `MxGroupReviewCard`; a 0.5.1 trouxe o `MxPagedGrid` (discografia paginada); a 0.6.0 trouxe o `MxRotator`, blobs que cobrem qualquer largura, `data-testid` em todos os componentes e mudou onde `MxIconButton`, `MxImageCredit` e `MxUserMenu` põem o que recebem de fora (no botão, não mais no menu teleportado: classe com escopo da página precisa de `:deep()`, ver Armadilhas); a 0.7.0 trouxe a `MxCrate` (pilha de discos, com `open` e `compact`) e o `listenersSource` do `MxItemCard`; a 0.7.1 trouxe o `MxPersonCard` (busca de pessoas), o `showProgress` do `MxBadge` (badge de outra pessoa, sem progresso) e o `MxSegmented` que rola até a opção marcada; a 0.7.2 trouxe a `MxCoverStack` (pilhas da grade da biblioteca) e o `pickable` da `MxCrate` (o clique na pilha de avaliações recentes do perfil abre a avaliação); a 0.7.3, o `widePanel` da `MxCrate` (resenha em 2/3 e discos em 1/3 no perfil); a 0.7.4, o `clear` do `MxSearchField` (desfazer a busca) e as setas do `MxRail` acompanhando itens novos.
- **Espaçamento entre letras** vem dos tokens da biblioteca (`--mx-tracking-display`, `-title`,
  `-numeral`); só o logotipo (`AppBrand`) tem o dele.
- **Testar mudança da biblioteca antes de publicar:** `npm run build` e
  `npm pack --pack-destination <pasta temporária>` lá, `npm install <tgz>` aqui. Antes de commitar,
  volte para o registro: o `package.json` não pode apontar para arquivo, que o Docker e o CI não têm.
- **`@pedrolucaslopes/mixtape-auth`** (`mixtape-oauth-lib-v1`, mesmo registro e mesmo token): daqui só a entrada
  principal, o **contrato de login** com a API (`AUTH_API_PATHS` e `safeReturnTo`), sem dependência nenhuma. A
  entrada `/server` (os SDKs do Auth0) é da API e nunca é importada aqui. No CI, o repositório precisa de acesso
  aos dois pacotes.

## 🪝 Ganchos do git (Husky)

Repositório git local desde 14/10/2026 (ainda sem o remoto `mixtape-web-v1`). O `npm install` liga os ganchos
(`prepare`: `husky || exit 0`, que pula no Docker, onde não há `.git`). Nada de `--no-verify` sem motivo.

| Gancho | Roda | Tempo |
|---|---|---|
| `pre-commit` | `lint-staged --relative`: `eslint --fix` nos `.ts`/`.vue`/`.js`/`.mjs` do commit (com mais de 40, `lint:fix` no projeto: a lista estoura a linha de comando do Windows); `.vue` → `check:testids`; `.ts`/`.vue` → `check:locales` e `check:icons`; tradução → `check:locales` (cada checagem uma vez) | ~13 s |
| `commit-msg` | `commitlint` com Conventional Commits (`feat:`, `fix:`…); assunto em qualquer caixa e corpo sem limite de linha | — |
| `pre-push` | `type-check` e testes de unidade (os de ponta a ponta precisam da pilha no ar: rode à mão) | ~60 s |

## ⚡ Desempenho: só carrega o que a página usa

Medido na Home, no container de produção, com a 0.2.1 (antes) e a 0.3.0 (depois):

| | Antes | Depois |
|---|---|---|
| CSS | 608 KB num arquivo só (Vuetify completo, CSS da fonte MDI e a biblioteca inteira), 8.412 regras | 104 KB, divididos por página, 1.018 regras |
| Fonte de ícones | 403 KB de woff2 | nenhuma (SVG) |
| JS decodificado | 722 KB | 608 KB |
| `filter` animado / `will-change` | blobs com `blur(60px)`, vinil e capas com `drop-shadow` / 20 | 0 / 5 |

| Regra | Como |
|---|---|
| **Só o núcleo do Vuetify** | `vuetify/styles/core`. Os 235 KB de utilitárias e 40 KB de cores não são usados; as poucas utilitárias que os componentes do Vuetify emitem sozinhos estão no `base.css` da biblioteca |
| **Ícones em SVG, só os usados** | `mixtapeIcons(APP_ICON_PATHS)`: os da biblioteca + `icons.generated.ts`, que o `sync:icons` gera a partir dos `mdi-*` do código (sem repetir os da biblioteca). O nome continua `mdi-album` |
| **CSS por componente** | a biblioteca é um arquivo por módulo e cada componente importa o próprio CSS; com `sideEffects`, o que não é usado sai, e o resto vai para o chunk da página |
| **Línguas sob demanda** | pt-BR (referência e reserva) no bundle; en e es são chunks, baixados antes de montar (`await loadLocale` no `main.ts`) ou antes de trocar (`changeLanguage` nas configurações) |
| **Diálogos globais na primeira abertura** | `AppLayout` monta avaliação, playlist, compartilhar, celebração e consentimento com `defineAsyncComponent` + `useLatch`: o chunk só baixa quando a store abre o diálogo, e ele fica montado depois |
| **Fontes do primeiro quadro pré-carregadas** | o plugin `preloadFonts` do `vite.config.mts` põe `<link rel=preload>` para a Bricolage e a Figtree latinas (o título do herói é o LCP) |
| **Sombra parada** | capa do herói usa `--mx-cover-shadow`, não `filter: drop-shadow` num pai que flutua; vinil girando já traz a sombra dele |
| **Desfoque só no que flutua** | `MxGlass` sem `blur` é translúcido sem `backdrop-filter`; o cartão do login fica sem, porque os blobs se mexem atrás dele |

## 📝 Cadastro em etapas

- `RegisterPage` usa o `MxStepper` da biblioteca: **Conta** (e-mail, usuário, senha), **Sobre você**
  (nome, nascimento), **Preferências** (`MxBalloonPicker` com `GET /genres/showcase`, até
  `MAX_FAVORITE_GENRES`, pode pular) e **Pronto** (resumo, consentimento e "Criar conta").
- Cada etapa é um `<form>` próprio: Enter avança. O "Continuar" valida só os campos da etapa
  (`STEP_FIELDS`); erro do servidor volta para a etapa do campo (`USERNAME_ALREADY_TAKEN` leva para
  Conta) e as etapas já feitas continuam liberadas nas abas.
- A etapa Conta pede a senha duas vezes: o "Confirme a senha" só mostra erro depois de tocado (ou
  quando já tem o tamanho da senha), e o "Continuar" não passa com as duas diferentes.
- Os estilos vão num `PATCH /me/profile` depois do cadastro. Se falhar, a conta fica criada e um aviso
  manda escolher nas configurações.
- A rota tem `meta.wide`: o `AuthLayout` alarga o cartão para os balões caberem.

## ❤️ Curtidas e review da galera

- **Avaliação alheia só recebe curtida** (coração, `useLikes`: muda na hora e volta se a API recusar).
  Não existe "não gostei" nem comentário; o autor não curte a própria (o coração vira só o número).
- **Review da galera:** no grupo, o botão "Review da galera" (`mdi-account-group`) abre o
  `GroupReviewProposeDialog` (busca no catálogo, álbum ou música). Sugerido o item, o editor de avaliação
  global abre para quem sugeriu: `composer.start(alvo, { id, groupName, isPublic })` manda a nota para
  `PUT /group-reviews/:id/my-review` e avisa quem vai ver; avaliação que já estava em outra review da galera
  bloqueia o "Publicar". `composer.savedGroupReview` deixa as listas trocarem só o cartão salvo.
- **Onde aparece:** aba "Reviews da galera" do grupo (a padrão, `GroupReviewList`), página própria
  `/group-reviews/:id` (destino do selo), painel na página da avaliação, seção no perfil
  (`GET /users/:username/group-reviews`) e selo + cadeado na grade da biblioteca. `useGroupReviewCards`
  liga a resposta ao `MxGroupReviewCard`: o nome do grupo só vira link para membros (a página do grupo é
  deles).
- **Visibilidade:** grupo público mostra as reviews da galera para todo mundo; privado, só para os
  membros (no formulário do grupo, abrir um grupo privado avisa que as que já existem ficam públicas).
  Avaliação que não é pública não tem "Compartilhar" nem "Adicionar à playlist"; a que ficou só do autor
  (grupo privado desfeito ou autor saiu) mostra "Tornar pública" na página dela.

## ⭐ Favoritos e página de avaliação

- **Favoritos do perfil** (até 5 álbuns e 5 músicas, `FAVORITE_LIMITS`): vitrine logo abaixo do topo do perfil
  (`FavoritesShelf`), em dois grupos numerados (`FAVORITE_GROUPS`: álbuns, depois músicas), com "Editar" para o dono
  (`FavoritesEditorDialog`, carregado só quando abre: subir e descer dentro do grupo, tirar, buscar e adicionar, e
  salvar a lista inteira de uma vez). Quem já tinha mais de 5 de um tipo (o limite era 10 no total) não perde nada: a
  vitrine mostra os 5 primeiros de cada grupo e o editor avisa e só salva depois de tirar os que passam. A API recusa
  com `FAVORITES_FULL` e o tipo (`details.kind`), e o texto diz qual grupo encheu. Nas páginas de álbum e
  música, a estrela (`FavoriteButton`) favorita ou tira **na hora**: enquanto a API confirma, vale o estado
  desejado (`wanted` na store) e clique repetido não faz nada; recusado, volta e mostra o erro. `stores/favorites`
  guarda os meus e muda `version` a cada alteração, para a vitrine recarregar. Na API, item que apareceu numa lista
  (busca, paradas, página do álbum…) vira cartão na hora (~80 ms em vez de ~3,6 s).
- **Outras avaliações da mesma obra**, na página de uma avaliação: uma por vez no `MxRotator` da biblioteca
  (troca a cada `REVIEW_ROTATION_MS`, para no hover, no foco e no botão, e começa parado com movimento
  reduzido), sem repetir a avaliação aberta, e o "Ver todas as avaliações" embaixo.
- **Pódio das paradas:** o 1º no meio e mais alto, o 2º à esquerda e o 3º à direita, cada um mais baixo
  (`--lift-first`, `--lift-second`), sem degrau, coroa nem metal. Cada cartão é um duotone (`CHART_PODIUM`:
  lima, violeta, rosa) e **flutua** (sobe e desce, cada um no seu ritmo), com um brilho na cor dele embaixo
  que encolhe quando ele sobe; o número contornado do `MxItemCard` fica no canto de baixo da capa (à
  direita no 3º). Atrás do 1º gira o sol de espinhos (`MxStarburst`, `PODIUM_BURST`) na cor de destaque do
  duotone. Com movimento reduzido, tudo para. A ordem do HTML continua 1, 2, 3 (é a do leitor de tela); só a
  grade muda a posição.

## 🎧 Artista

- O número principal é **ouvintes mensais** (`monthlyListeners`: o último mês fechado no ListenBrainz,
  com o mês na frase do cartão). Sem esse dado, o total desde sempre (`listenerCount`), com o rótulo dele.
- **Discografia paginada** (`MxPagedGrid` da biblioteca, `DISCOGRAPHY_GRID`): duas fileiras, colunas pela
  largura (cartão de 160 px no mínimo: 4 colunas no desktop, 2 no celular), páginas lado a lado (desliza no
  toque e no trackpad) e números de página. Nada de rolagem infinita; trocar o filtro (Álbum, EP, Single…)
  volta para a página 1.

## 📦 Pilha de discos, Descubra e "Ouvir depois"

- **Pilha de discos** é a `MxCrate` da biblioteca: o disco da frente inteiro e a borda de cima dos de trás, sem
  caixote (o produto achou o caixote feio). Subir o mouse pela pilha folheia e descer traz os discos de volta; o
  clique (ou Enter, ou "Puxar disco") puxa o da frente. O disco puxado mostra o `CratePulledCard` no slot `pulled`:
  ver o item, avaliar (álbum e música pelo `RateButton`; artista leva à tela de avaliar buscando pelo nome), "Ver
  avaliação" quando vem de uma biblioteca, e "Ouvir depois".
- **Onde aparece:** opção "Pilha" na busca (`?view=crate`), na biblioteca (`?view=crate`, ao lado de grade e lista)
  e nas avaliações recentes do perfil (`?view=crate`, ao lado da fileira), e o Descubra e o "Ouvir depois" do meu
  perfil. `crateRecord` (em `useCatalogCards`) liga um cartão do catálogo a um disco da pilha.
- **Na biblioteca, o painel do disco já vem aberto** (`open` do `MxCrate`, em `ReviewCrate`): mostra o disco da frente
  com nota, "Ver disco" e "Ver avaliação", e troca enquanto se folheia; lá não existe puxar nem devolver. Nas outras
  pilhas, o painel só abre ao puxar.
- **Avaliações recentes do perfil em pilha** (`?view=crate`): também com o painel aberto, à direita (embaixo, em
  largura estreita), com 2/3 da largura para a resenha e 1/3 para os discos (`widePanel`, a pedido), com a nota e o texto da resenha (`body` do `CratePulledCard`, até 8 linhas), trocando conforme o
  mouse folheia, sem clicar. Com `pickable`, o clique (ou Enter) no disco da frente abre a avaliação dele.
- **Descubra fica dentro do meu perfil**, só para o dono (não é página nem aba, e não tem estilo definido):
  `DiscoverCard` mostra `DISCOVER_ALBUMS` (10) álbuns de `GET /me/discover`, sorteados a cada pedido entre os mais
  ouvidos de sempre no ListenBrainz, fora os que eu já avaliei e sem repetir artista. "Sortear outros" pede um
  sorteio novo; o álbum que eu avalio sai da pilha na hora (`composer.changed`).
  - **Tela larga** (`lgAndUp`, `discoverAside`): os favoritos ocupam a linha inteira e, embaixo, os quadrados de
    destaque viram uma grade 2×2 com o Descubra ao lado (coluna própria, na mesma linha, da mesma altura; não fixo na
    rolagem). É um cartão no estilo dos quadrados (duotone `DISCOVER_DUOTONE`), com a pilha `compact`; puxar abre um
    `MxDialog` com capa, ouvintes, "Ver disco", "Avaliar" e "Ouvir depois". Avaliar fecha o diálogo antes do
    compositor abrir.
  - **Tela menor:** volta a ser uma seção do perfil depois das avaliações recentes (`DiscoverCard inline`), com a
    pilha grande e o painel ao lado ou embaixo.
  - O `FavoritesShelf` tem mais de uma raiz: na grade do perfil ele vai dentro de `.profile__favorites`, senão a regra
    de linha inteira não chega nele e o Descubra sobe para o lado dos favoritos.
- **"Ouvir depois"** (`stores/listenLater`, `ListenLaterButton`): álbuns, músicas e artistas guardados, até 200, só a
  pessoa vê. No meu perfil, a seção "Ouvir depois" é uma pilha (`ListenLaterCrate`). Avaliar um item guardado tira
  ele da lista na API; a store relê a lista a cada avaliação (`composer.version`).

## 🔎 Busca de pessoas e o que cada um vê do perfil

- **Busca:** a aba "Pessoas" (`?type=people`, `SEARCH_KINDS`) procura pelo nome ou pelo @usuário em
  `GET /search/users` (sem ligar para acento e maiúscula; nunca pelo e-mail) e mostra `MxPersonCard`, que leva ao
  perfil. Sem texto, só a dica e as buscas recentes (as seções de discos são do catálogo). No modo avaliar
  (`?rate=1`), a aba não aparece.
- **Progresso só para o dono:** no meu perfil, o painel e as badges vêm de `GET /me/progress` (o progresso até o
  próximo disco, o de cada badge e as que faltam, em "Próximos badges"). No perfil de outra pessoa, só o que o
  perfil público traz: o disco conquistado (sem a frase "faltam X avaliações"), a seção vira "Pontos e ranking"
  (sem o `MxDiscProgress`) e as badges conquistadas aparecem com o nível e a data, sem o anel nem o caminho até o
  próximo (`BadgeGrid` liga o `showProgress` só quando a badge traz progresso). A API também não manda o
  progresso de ninguém além do dono.

## 🎯 Sugestões e listas grandes

- **Tela de avaliar** (`/search?rate=1`, sem texto digitado), por aba (álbuns, músicas, artistas):
  - **Para você:** `GET /genres/suggestions/{tipo}` com os estilos favoritos, que giram um passo por dia
    (`rotateDaily`), porque a API usa só os 5 primeiros. É paginado (`usePaged`, "Mais sugestões"): as novas entram
    no fim do trilho, então ele rola até a primeira delas e o foco vai para ela (`HomeRail.reveal`); antes, o clique
    parecia não fazer nada. A mistura dos estilos pode mudar entre uma página e outra (estilo que atrasou na API entra
    na seguinte), e as repetidas saem (`forYouShown`).
  - **Desfazer a busca:** limpar (×), Esc ou Enter com o campo vazio (`clear` do `MxSearchField`) tira o `q` da URL e
    volta às sugestões, às buscas recentes e aos estilos. Antes, o Enter vazio não fazia nada.
    Sem estilos, aparece o convite para escolher nas configurações.
  - **Em alta no mundo:** paradas da semana do ListenBrainz.
  - **Em alta no Mixtape:** só quando tem algo; antes, ficava um espaço vazio.
  - Artistas vêm com `cover`, a capa do disco mais ouvido, e o `useCatalogCards` usa essa capa no cartão.
- **Minha biblioteca:** grade por padrão (`ReviewGrid`: capa, nota, título; o cartão inteiro leva à
  avaliação) ou lista (`?view=list`), as duas paginadas (24 e 20).
- **Pilhas na grade da biblioteca** (`GET /users/:username/library/stacks`): a música avaliada de um álbum que a
  pessoa também avaliou vai para debaixo dele (a página conta entradas). A capa vira a `MxCoverStack` da biblioteca
  (as capas de trás na diagonal e o selo com o número de músicas): é um botão com `aria-expanded`, por cima do link que
  cobre o cartão, que abre a pilha ali mesmo. As músicas entram na grade logo depois do álbum, uma depois da outra
  (`LIBRARY_STACK_STAGGER`), com "Do álbum …", e a pilha aberta fica numa faixa da mesma cor; as outras deslizam
  (`TransitionGroup`). Ao fechar, a música que sai fica fora do fluxo, no lugar dela (`keepInPlace`), enquanto as
  outras voltam. A ordem do HTML é a da tela (o leitor de tela ouve as músicas logo depois do álbum). Lista e pilha de
  discos continuam com `GET /users/:username/library` (uma avaliação por item).
- **Playlist:** a API devolve até 500 itens de uma vez (o reordenar precisa da lista inteira); a página
  desenha 50 por vez (`PLAYLIST_RENDER_STEP`, "Mostrar mais").

## 🔐 Sessão

- **O login é a tela do Mixtape**, com e-mail ou usuário e senha (`session.login` → `POST /auth/login`, o caminho
  vem do `AUTH_API_PATHS` da lib de login); a API confere a senha no Auth0. Erros com texto próprio:
  `INVALID_CREDENTIALS` (o mesmo para senha errada e conta que não existe), `TOO_MANY_LOGIN_ATTEMPTS` (diz quanto
  esperar), `LOGIN_BLOCKED` (o Auth0 travou a conta: manda criar uma senha nova, que destrava) e `LOGIN_DENIED`.
  Erro apaga a senha digitada; o destino (`?redirect=`) passa pelo `safeRedirect`. Até 10/10/2026 o login era a
  tela do Auth0 (ida e volta pela API); a pedido, voltou a ser a nossa.
- Cadastro também é aqui (a API manda a senha para o Auth0 e já devolve a sessão). Falha do provedor de
  login no cadastro, no login, na senha nova ou na exclusão vira `IDENTITY_PROVIDER_UNAVAILABLE`.
- Modo cookie (`X-Session-Transport: cookie`): o refresh token é cookie `HttpOnly`, `SameSite=Strict`,
  restrito a `/api/v1/auth`; o access token fica só em memória. É o único cookie do Mixtape.
- Erros da API com texto próprio: `BREACHED_PASSWORD` (marca o campo de senha), `AVATAR_HOST_NOT_ALLOWED`,
  `CONTENT_REJECTED` (lista os termos; sem termos, é a moderação pelo contexto: `CONTENT_REJECTED_TONE`),
  `PAYLOAD_TOO_LARGE` e os de espera (`…_TOO_MANY`, que dizem quanto esperar com `Intl.NumberFormat`).
- `safeRedirect` é o `safeReturnTo` da lib de login (a mesma regra da API) com `AUTH_SCREENS` fora: recusa
  caractere de controle e `\` em qualquer posição (o navegador apaga a tabulação e `/\t/site.com` viraria
  `//site.com`), `//` e as telas de entrada.
- A política de privacidade cita o Auth0 (senha só como hash, conferida quando a pessoa entra, servidores nos
  EUA), o cookie da sessão e o registro de acessos de 6 meses (Marco Civil); `LEGAL_UPDATED_AT` muda junto com o
  texto.
- Avatar: `avatarUrlProblem` confere https e os mesmos hosts da API (`AVATAR_HOSTS` em
  `constants/validation.ts`, espelho do `identity.constants.ts` da API) antes de salvar e antes da
  prévia.
- `localStorage['mx.session']` é só uma **dica** de que há sessão: sem ela, a primeira visita não chama
  `/auth/refresh` (que daria 401 no console). Nunca guarda token.
- **Senha só muda pelo e-mail.** Não existe formulário de troca de senha: "Esqueceu a senha?" no login
  leva a `/forgot-password` (a página ainda aceita o e-mail pelo `history.state`, nunca pela URL) e, na
  conta, o botão manda o link direto (`POST /me/password-reset`), com "enviar de novo" só depois de
  `PASSWORD_RESET_RESEND_SECONDS`. O link do e-mail abre `/reset-password#token=…`: a página lê o token
  do fragmento, tira ele da barra de endereço, confere (`valid`) antes de mostrar o formulário e, salva a
  senha, sai da sessão se era a mesma conta e manda para o login. As duas rotas aceitam logado e
  deslogado, e os e-mails saem na língua da tela (`emailLocale()` em `services/mixtape.ts`).
- **Exclusão da conta (LGPD), também só pelo e-mail.** Em Conta e segurança, "Enviar link para excluir a conta"
  (`POST /me/account-deletion`) não apaga nada, só manda o link (reenvio depois de `ACCOUNT_DELETION_RESEND_SECONDS`).
  O link abre `/delete-account#token=…` (`DeleteAccountPage`, no `AuthLayout`, logado ou não): tira o token da barra,
  confere, mostra a conta e o que some, e só apaga no botão "Excluir minha conta para sempre". Se o navegador estava
  nessa conta, sai dela. Testado de ponta a ponta pelo Mailpit (`e2e/account-deletion.spec.ts`, com conta própria
  descartável: nunca a do `signedIn`).
- Abas sincronizam login e logout pelo `BroadcastChannel`.
- **Prova de que é uma pessoa (Turnstile, da Cloudflare)** no login, no cadastro (etapa "Pronto") e no "esqueci a
  senha": `HumanCheck.vue` pergunta à API (`GET /auth/human-check`, uma vez por visita) se ela pede e com qual chave,
  carrega o script do Turnstile (`render=explicit`; entra pela CSP porque quem cria o `<script>` é o nosso, com o
  nonce, e a `'strict-dynamic'` deixa) e monta o widget invisível (`appearance: interaction-only`: só aparece se a
  Cloudflare pedir um clique). A lógica fica em `services/human-check.ts` (`HumanCheckController`, testado sem
  navegador): `take()` entrega o token do envio (espera o desafio terminar, até `HUMAN_CHECK.waitMs`) e `reset()` pede
  outro depois de cada envio que falhou (o token vale uma vez). O token vai no cabeçalho `X-Human-Check`.
  `HUMAN_CHECK_REQUIRED`/`_FAILED` têm texto próprio, e erro da prova não apaga a senha digitada. Sem a prova ligada
  na API, nada carrega. Nos testes de ponta a ponta, o cadastro e o login feitos direto na API mandam o token de teste
  (`HUMAN_CHECK_HEADER`, ou `E2E_HUMAN_TOKEN`); a tela resolve sozinha com a chave de teste.

## 🔎 SEO

- Robôs (Googlebot, WhatsApp, Telegram, X, Facebook…) recebem o `<head>` da página renderizado pela
  API (`/api/v1/seo/head`), incluído pelo nginx via SSI no `index.html` (`$mixtape_seo_bot`).
- Essas tags vêm com `data-mx-ssr`, e o `main.ts` as remove antes de montar: no navegador, quem manda
  é o `useSeo` (unhead). O JSON-LD fica.
- Busca com termo é `noindex`. `robots.txt` e `sitemap.xml` saem do nginx e da API.

## ☁️ Cloudflare e o IP de quem chama

- **A borda é código:** `cloudflare/` (`edge.config.mjs`, `apply.mjs`, ver o `README.md` de lá): CDN, firewall,
  limite por IP, robôs, Tunnel, Turnstile e Access, só no plano Free. O token e a zona vêm do ambiente do terminal.
- **Duas portas no nginx**, com o mesmo site (`nginx/site.conf.template`, incluído pelos dois `server` do
  `default.conf.template`; o envsubst gera `conf.d/mixtape/site.conf`, fora do `conf.d/*.conf` que o nginx inclui
  sozinho):
  - **8080**, a publicada (`WEB_PORT`): o IP de quem chama é o da conexão;
  - **8081**, só na rede do compose, para o `cloudflared`: aceita o `CF-Connecting-IP` (o IP que a borda viu).
- `nginx/client-ip.conf` **reescreve** o `X-Forwarded-For` (não soma ao que o navegador mandou), o `X-Real-IP` e o
  `X-Forwarded-Proto`, e apaga `CF-Connecting-IP` e `True-Client-IP` antes da API. Com `TRUST_PROXY=1` na API, o limite
  por IP vale para o IP certo e ninguém escolhe o próprio.
- **Túnel:** serviço `cloudflared` no compose, só com `COMPOSE_PROFILES=cloudflare` e o `CLOUDFLARE_TUNNEL_TOKEN` no
  `.env` (gravado pelo `npm run edge:apply -- --write-env`). Ele sai da máquina até a Cloudflare: nenhuma porta aberta.

## 🛡️ Headers e CSP

- O Vite escreve `MIXTAPE_CSP_NONCE` em cada `<script>`/`<link>` gerado; o nginx troca pelo
  `$request_id` (`sub_filter`) e manda o mesmo valor no `Content-Security-Policy`
  (`script-src 'nonce-…' 'strict-dynamic'`).
- `security-headers.conf`: `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`,
  `Permissions-Policy`, COOP e HSTS. `/assets/` com cache imutável; `index.html` sempre revalidado.
- **HSTS só atrás de https:** o `map` de `$http_x_forwarded_proto` põe `max-age=31536000` quando o
  proxy de TLS avisa `https`; em http puro o valor fica vazio e o nginx não manda o cabeçalho. Sem
  `includeSubDomains` de propósito.

---

## 🧪 `data-testid` e testes de interface

| Onde | Padrão | Exemplo |
|---|---|---|
| Página | `page-<rota>` na raiz; partes `page-<rota>-<parte>` | `page-login`, `page-login-submit`, `page-charts-place-1` |
| Layout | `layout-<nome>` | `layout-app`, `layout-app-user-menu` |
| Componente | `<nome em kebab>`; partes `<nome>-<parte>` | `favorite-button`, `review-composer-submit` |

- Todo elemento interativo (botão, link, campo, formulário, componente da biblioteca que vira link ou
  botão, elemento com `@click`) tem id; o `check:testids` (`scripts/check-testids.mjs`, cópia do da
  biblioteca) recusa o que faltar e roda no `npm run build`. Mensagem de erro de formulário também tem
  (`page-login-error`): o campo do Vuetify também tem `role="alert"`.
- O id passado a um componente da biblioteca troca o `mx-*` dele (o de quem usa ganha). As partes internas
  continuam com o `mx-*`: `getByTestId('page-charts-period').getByTestId('mx-segmented-option-month')`.
- **Playwright** (`e2e/`, `playwright.config.ts`): Chrome instalado (`channel: 'chrome'`), um worker,
  projeto `setup` que cria uma conta `e2e_*` pela API (o cadastro já abre a sessão no cookie; `registerAndEnter`
  liga a dica de sessão, como o cadastro pela tela) ou, com `E2E_EMAIL`/`E2E_PASSWORD`, entra pela tela de login;
  `desktop` com tudo e `mobile` com as páginas e as paradas. Os testes de login digitam na **nossa** tela (a API
  confere no Auth0, que precisa do grant "Password" na aplicação): entrar pelo usuário e voltar ao destino, a
  mesma mensagem para senha errada e conta que não existe, campos obrigatórios, o olho da senha e a senha nova
  pelo e-mail. A trava por tentativas fica com o pentest (o limite por IP do login, 10 por minuto, não deixa
  testar as duas coisas na mesma rodada). A busca de pessoas e o perfil visto pelo dono e por um visitante
  (`people.spec.ts`) também são conferidos. A pilha de discos é testada com mouse de verdade (subir folheia,
  descer volta, clique puxa), teclado e o botão de puxar; "Ouvir depois" guarda pelo Descubra do perfil e tira pela
  pilha ao lado. Na grade da biblioteca, o álbum e a música dele avaliados viram uma pilha que abre (clique) e fecha
  (Enter); os favoritos caem cada um no grupo dele (álbuns, músicas). Na busca (`search.spec.ts`), Enter com o campo vazio
  e o botão de limpar voltam às sugestões, e o "Mais sugestões" rola o trilho até a primeira nova, com o foco nela (os
  estilos da conta de teste são gravados pela API, com a sessão da página: no seletor, a lista é virtualizada). `E2E_BASE_URL`, `E2E_MAILPIT_URL`, `E2E_EMAIL`/`E2E_PASSWORD` (opcionais) vêm do ambiente. A
  redefinição de senha e a exclusão da conta são testadas de verdade pelo Mailpit (pulam sem ele).
- **A API troca o refresh token a cada uso.** O teste que abre a página consome o token salvo: os testes
  logados usam `signedIn` (`e2e/support/session.ts`), que guarda a sessão como ficou ao terminar, e o
  próximo começa dela (por isso um worker só).
- Campo de texto com `auto-grow` tem um segundo `textarea` escondido: use `getByRole('textbox')`.
- Álbum sem avaliação nenhuma (banco novo) mostra dois "Avaliar": o do topo e o do estado vazio. Os testes
  miram o do topo (`getByTestId('mx-page-hero').getByTestId('rate-button')`); só passavam porque o banco de
  desenvolvimento já tinha avaliações.
- `e2e/.auth` guarda cookies de sessão de teste: fora do git e do contexto do Docker.

## 🚨 Armadilhas já pagas

⚠️ **Classe com escopo da página em componente da biblioteca que repassa `$attrs` a um elemento de
dentro** (`MxIconButton`, `MxImageCredit`, `MxUserMenu`): o elemento não leva o atributo de escopo da
página, então a regra precisa de `:deep()` a partir de um elemento da página. O crédito da foto do artista
(`.artist__photo :deep(.artist__credit)`) nunca tinha ficado no canto da foto por isso.

⚠️ **`vue-tsc` e arrow function no template:** binding importado usado dentro de `() => …` no
template é tipado como acesso a `.value`. Carregadores e mapas vão para funções ou `computed` no script.

⚠️ **Diálogo montado já aberto não vê a transição.** Com o `useLatch`, o componente nasce com a store
já aberta: `watch` que reage à abertura precisa de `{ immediate: true }` (ver `ReviewComposer`).

⚠️ **O título do herói não anima opacidade.** O `h1` costuma ser o LCP, e o Chrome não conta elemento
com opacidade 0.

⚠️ **Testes importam a biblioteca com CSS:** `test.server.deps.inline` no `vitest.config.ts`, e os
testes têm `tsconfig.vitest.json` próprio (no `tsconfig.node.json` quebravam o `import.meta.glob`).

⚠️ **nginx:** `location ^~ /assets/` antes da regex de imagens e fontes (senão o cache imutável se
perde), e `Accept-Encoding ""` na sub-requisição do SSI (o nginx não inclui corpo comprimido).

⚠️ **Nunca publique a porta 8081 do nginx.** Ela aceita o IP que vier no `CF-Connecting-IP`; publicada, qualquer um
escolheria o próprio IP para os limites da API. Só o `cloudflared`, na rede do compose, chega nela.

⚠️ **HTML nunca vai para cache** (nem o da Cloudflare): o nonce da CSP muda a cada página. O `index.html` sai com
`no-cache`, e nenhuma regra da borda pega HTML.

⚠️ **Ícone de fora do MDI** (hoje, o hambúrguer do menu, `fa-burger` do Font Awesome Free) mora em
`plugins/fun-icons.ts` como `IconShape` (`{ path, viewBox }`), somado aos do `icons.generated.ts`. O
`check:icons` só confere `mdi-*`. O Font Awesome é CC BY 4.0: o crédito está nos termos de uso
(`legal.terms.sections.catalog`), porque o build tira os comentários do código.

⚠️ **Capas sobrevivem aos rebuilds:** o `proxy_cache` do nginx fica no volume `nginx-cache`
(`/var/cache/nginx`). Dentro do container, cada deploy recomeçava do zero e as capas voltavam a demorar.

⚠️ **Os JSON de `locales/` não sobrevivem a `JSON.parse` + `JSON.stringify`:** os badges ficam em
objetos de uma linha só. Script que edita tradução troca o texto exato, não regrava o arquivo inteiro.

⚠️ **Número de ouvintes sempre diz a fonte:** o ListenBrainz conta só a comunidade dele, bem menor que a de um
Spotify, e "4 mil ouvintes desde sempre" num sucesso mundial parecia número errado. Todo número sai com "no
ListenBrainz": nas paradas (`charts.monthlyListeners`, `charts.allTimeListeners`), nos rótulos das páginas de
álbum, música e artista (`item.listeners`, `artist.monthlyListeners`), nos cartões (`listenersSource` do
`MxItemCard`, que o `useCatalogCards` já preenche com `LISTENERS_SOURCE`) e no `labels.listeners`. Fonte maior
(Last.fm) só com licença comercial por escrito: os termos dele proíbem uso comercial sem acordo.

⚠️ **"Ouvintes", não "escutas", e sempre com o período:** o número é de pessoas distintas no
ListenBrainz. As paradas continuam ordenadas pelas execuções do período (`listenCount`); ao lado, álbuns e
artistas mostram os **ouvintes do último mês fechado** (`monthlyListeners`: "1,4 mil ouvintes em
setembro") e músicas, que o ListenBrainz não conta por mês, os de sempre ("… ouvintes desde sempre").
O texto sai de `labels.chartListeners`, usado nas paradas e na vitrine da Home; álbum ou artista cujo
número do mês ainda não chegou (a API busca por trás) cai no "desde sempre". As músicas mais ouvidas do
artista são reordenadas por ouvintes para as barras não subirem e descerem.

⚠️ **Trocar de aba ou filtro mostrava a lista anterior.** Com o ListenBrainz lento, o pedido novo levava
até 25 s (5 s de prazo na API e duas novas tentativas no cliente) e a lista da aba anterior ficava na
tela como se fosse a nova. Agora `useAsyncData` tem `resetOnChange` (esqueleto quando o que é observado
muda), o carregador recebe o `AbortSignal` (o pedido antigo é cancelado, e a espera entre tentativas
também) e a seleção das paradas só muda enquanto a rota é a das paradas (sair da página não recarrega).

⚠️ **QA no painel de navegador oculto:** sem quadros, `requestAnimationFrame` não roda; números com
`useCountUp` ficam em 0 e transições param no meio. O valor certo está no texto para leitor de tela.

---

## 📁 Estrutura

```bash
.github/            # ci.yml (lint, tipos, testes, build, imagem) e dependabot.yml
cloudflare/         # a borda da Cloudflare como código (plano Free): edge.config.mjs, apply.mjs, testes e README
nginx/              # default.conf.template (as duas portas), site.conf.template (proxy da API, SSI de SEO, nonce,
                    # cache), client-ip.conf (o IP de quem chama) e security-headers.conf
scripts/            # check-locales, sync-icons, generate-api-types
src/
├─ constants/       # tudo que é fixo: rotas da API, navegação, SEO, validação, filtros, fontes de dados
├─ plugins/         # i18n (línguas sob demanda), vuetify (núcleo + ícones), icons.generated.ts
├─ router/          # rotas (lazy), carregamento, guardas de sessão
├─ services/        # cliente HTTP (refresh, erros) e a API do Mixtape
├─ stores/          # sessão, preferências, anúncios, consentimento e os diálogos globais
├─ composables/     # dados assíncronos, paginação, SEO, rótulos, cartões do catálogo, useLatch
├─ layouts/         # AppLayout (casca, diálogos sob demanda) e AuthLayout
├─ pages/           # uma por rota
├─ components/      # peças da aplicação (as genéricas moram na biblioteca)
├─ locales/         # pt-BR (referência), en, es
├─ types/           # api.generated.ts (OpenAPI) e os tipos derivados
└─ utils/           # formulários, itens, navegação, períodos (com testes)
```

## ✅ Invariantes ao alterar

- Nada sensível no código: segredos e endereços no `.env` (fora do git e da imagem); valores fixos em
  `src/constants/`. `VITE_*` vai para o navegador: só o que é público.
- A senha é sempre do usuário: o front mostra as regras e o medidor, nunca sugere nem gera.
- Texto de tela nos três JSON de `locales/`; rode `npm run check:locales`.
- Usou um `mdi-*` novo, rode `npm run sync:icons` e versione o gerado.
- Diálogo global novo entra no `AppLayout` com `defineAsyncComponent` + `useLatch`.
- Animação de entrada ou em laço só com `transform` e `opacity`, e sempre com contrapartida em
  `prefers-reduced-motion`. Nada de `filter` em elemento que anima.
- Componente genérico (sem regra de negócio) nasce na biblioteca, com story, e não aqui.
