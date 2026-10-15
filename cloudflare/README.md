# ☁️ Borda da Cloudflare (plano Free)

A camada da frente do Mixtape como código: CDN, firewall, limite por IP, robôs, túnel, Turnstile e Access, tudo dentro
do plano **Free** (US$ 0). O `edge.config.mjs` diz o que a conta deve ter; o `apply.mjs` lê a conta e aplica só a
diferença. O que é da conta (token, zona, hosts, e-mails) vem do ambiente do terminal, nunca do repositório.

```bash
npm run edge:plan                          # mostra o que muda (sem token: o que seria criado, sem tocar em nada)
npm run edge:apply                         # aplica
npm run edge:apply -- --write-env          # aplica e grava o token do túnel (.env do site) e o Turnstile (.env da API)
npm run test:edge                          # confere a configuração sem tocar na conta
COMPOSE_PROFILES=cloudflare docker compose up -d   # sobe o túnel junto com o site
```

## O que fica ligado

| Camada | O quê | Por quê |
|---|---|---|
| Entrada | **Tunnel** (`cloudflared` no compose do site) até o nginx na porta **8081** | a máquina não abre porta nenhuma: o túnel sai dela até a Cloudflare |
| IP real | o nginx só aceita o `CF-Connecting-IP` na 8081 (que só o túnel alcança) e reescreve o `X-Forwarded-For` | ninguém escolhe o próprio IP para os limites da API (com `TRUST_PROXY=1` nela) |
| TLS | Full (strict), HTTPS sempre, TLS 1.2+, TLS 1.3, HTTP/3, sem 0-RTT | 0-RTT aceita repetição de pedido |
| Cache | capas (30 dias), catálogo público e sitemap, pelo `Cache-Control` que a API manda; **Tiered Cache** | o MusicBrainz e o archive.org lentos só pesam para o primeiro |
| Nunca em cache | HTML (o nonce da CSP muda a cada página), busca, `/reviews`, `/stats` e tudo que não declara cache | a API responde `no-store` por padrão: rota nova que depende de quem pede já nasce protegida |
| Firewall | regras gerenciadas grátis + 3 nossas: varreduras (`/.env`, `/wp-admin`, `.php`…), métodos que o site não usa, API sem User-Agent | de 5 possíveis no Free |
| Limite por IP | 150 pedidos à API em 10 s (fora as capas), bloqueio de 10 s | a única regra do Free: só contra inundação; os limites finos são da API |
| Robôs | Bot Fight Mode e bloqueio dos robôs de IA | o Bot Fight Mode **não aceita exceção** (ver Armadilhas) |
| Formulários | **Turnstile** (widget "Mixtape (dev)") no login, cadastro e "esqueci a senha"; a API confere | grátis e sem limite |
| Dev | **Access** na frente de `dev.<domínio>` (código por e-mail, só os e-mails de `MIXTAPE_ACCESS_EMAILS`) e `X-Robots-Tag: noindex` | o computador de desenvolvimento não fica aberto para a internet |
| DNS | DNSSEC | o registro DS vai no registrador do domínio |
| Zona | sem Always Online (ignoraria o `stale-while-revalidate`), sem Email Obfuscation e Rocket Loader (quebrariam a CSP), cache do navegador conforme a origem | |

## Antes do primeiro `apply` (no painel, uma vez)

1. Conta na Cloudflare, com **autenticação em dois fatores**.
2. **Domínio** adicionado à conta (plano Free) e os servidores de nome trocados no registrador (Registro.br,
   por exemplo). O domínio continua seu; a Cloudflare passa a responder o DNS dele.
3. **Zero Trust** ativado no plano Free (painel > Zero Trust; escolhe-se um nome de equipe). Sem ele, o `apply` avisa e
   pula o Access, e então **não suba o túnel do ambiente dev**.
4. **Token de API** (My Profile > API Tokens > Create Token > Custom), só para esta conta e esta zona:
   - Conta: *Cloudflare Tunnel: Edit*, *Turnstile Sites: Edit* (ou *Account Settings: Edit*), *Access: Apps and
     Policies: Edit*, *Access: Organizations, Identity Providers, and Groups: Edit*.
   - Zona: *Zone: Read*, *Zone Settings: Edit*, *DNS: Edit*, *Zone WAF: Edit*, *Cache Settings: Edit*, *Transform
     Rules: Edit*, *Bot Management: Edit*.
   - Se faltar alguma, o `apply` diz qual chamada falhou e segue com as outras.

## Ambiente do terminal

| Variável | Exemplo | |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | — | segredo: nunca no `.env` de nenhum projeto (o da API vai inteiro para o container) |
| `CLOUDFLARE_ACCOUNT_ID` | — | painel > a conta > lado direito da página da zona |
| `CLOUDFLARE_ZONE` | `meudominio.com` | |
| `MIXTAPE_EDGE_HOSTNAME` | `dev.meudominio.com` | a zona ou um subdomínio dela |
| `MIXTAPE_EDGE_STAGE` | `dev` (padrão) ou `prod` | `dev` liga o Access e o `noindex`, e o Turnstile aceita `localhost` |
| `MIXTAPE_ACCESS_EMAILS` | `voce@exemplo.com` | obrigatório no `dev` (separados por vírgula) |
| `MIXTAPE_API_ENV_FILE` | `../api/.env` (padrão) | onde o `--write-env` grava as chaves do Turnstile |

O `--write-env` grava `CLOUDFLARE_TUNNEL_TOKEN` no `.env` do site e `TURNSTILE_ENABLED`, `TURNSTILE_SITE_KEY`,
`TURNSTILE_SECRET_KEY` (só existe na criação do widget; `--rotate-turnstile-secret` gera outra), `TURNSTILE_HOSTNAMES` e
`TURNSTILE_ALLOW_TEST_KEYS=false` no da API. Na tela aparecem só os nomes das chaves.

## Desenvolvimento sem domínio

Tudo continua funcionando no `localhost`, só sem a borda:

- **Turnstile:** as chaves de teste públicas da Cloudflare (o desafio passa sozinho, sem conta). No `.env` da API:
  `TURNSTILE_ENABLED=true`, `TURNSTILE_SITE_KEY=1x00000000000000000000AA`,
  `TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA` e `TURNSTILE_ALLOW_TEST_KEYS=true`. A secreta de teste
  aceita **qualquer** token: a API recusa as duas chaves de teste sem o `TURNSTILE_ALLOW_TEST_KEYS`, e o pentest e os
  testes de ponta a ponta mandam o token de teste (`XXXX.DUMMY.TOKEN.XXXX`).
- **IP real e cache:** o nginx da 8081 e o `no-store` da API valem igual; o pentest confere que IP forjado não escapa
  do limite e que rota pessoal sai `no-store`.

## ⚠️ Armadilhas

- **Nunca publique a porta 8081 do nginx.** Ela aceita o IP que vier no `CF-Connecting-IP`; publicada, qualquer um
  escolheria o próprio IP para os limites.
- **Bot Fight Mode não aceita exceção** (nem por regra de firewall): ele pode desafiar monitores de disponibilidade,
  scripts e um futuro app de celular. O pentest e os testes de ponta a ponta rodam contra o `localhost`, não contra o
  domínio. Se atrapalhar, desligue em `BOT_SETTINGS` e rode o `apply`.
- **HTML nunca vai para cache:** o `index.html` sai com `no-cache` e nenhuma regra de cache pega HTML. Guardado, o nonce da
  CSP seria o mesmo para todo mundo.
- **Rota que depende de quem pede não precisa fazer nada:** a API responde `no-store` em tudo que não declara o próprio
  `Cache-Control`. O contrário é que pede cuidado: só marque como `public` o que for igual para todo mundo.
- **Plano Free:** 5 regras de firewall (usamos 3), 1 de limite por IP (janela e bloqueio de 10 s, só por IP), regras
  sem expressão regular. Passar disso pede o Pro (US$ 20/mês: OWASP, 20 regras, 2 limites).
- **Chave de teste do Turnstile em produção** desligaria a prova sem ninguém perceber: a API não sobe com ela sem o
  `TURNSTILE_ALLOW_TEST_KEYS=true`, e recusa resposta de chave de teste quando ele está desligado.
