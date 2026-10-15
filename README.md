# Mixtape — Web

Front do Mixtape, o "Letterboxd da música": avalie álbuns e músicas de 0 a 5 discos, escreva
resenhas, monte playlists, dispute rankings e Awards. Vue 3 + Vuetify 4 + Pinia, com a interface da
biblioteca `@pedrolucaslopes/mixtape-ui` e os dados da API do Mixtape (`mixtape-api-v1`).

As decisões de arquitetura, desempenho, SEO e segurança estão em [`CLAUDE.md`](CLAUDE.md).

## Rodar no Docker

Com a API rodando no compose dela (porta publicada em `API_PORT`, 3001 nesta máquina):

```bash
cp .env.example .env
docker compose up -d --build
```

O site abre em `http://localhost:5180` (porta em `WEB_PORT`). O nginx do container serve o build e
encaminha `/api`, `/ads.txt` e o sitemap para a API.

## Desenvolver

```bash
npm ci
npm run dev
```

O Vite sobe em `http://localhost:5180` e encaminha `/api` para `MIXTAPE_DEV_API`.

## Configuração (`.env`)

| Variável | Para quê |
|---|---|
| `WEB_PORT` | Porta do site na máquina (container) |
| `MIXTAPE_API_UPSTREAM` | Onde o nginx do container encontra a API |
| `MIXTAPE_PUBLIC_URL` | Endereço público do site (vai no `robots.txt`) |
| `MIXTAPE_DEV_API` | Onde o Vite encontra a API em `npm run dev` |
| `VITE_CONTACT_EMAIL` | Contato da política de privacidade e dos termos (público: vai para o navegador) |
| `NODE_AUTH_TOKEN` | Token clássico do GitHub com `read:packages`, para instalar a biblioteca do GitHub Packages |

O `.env` não entra no git nem na imagem. O `NODE_AUTH_TOKEN` chega ao build do Docker como secret do
BuildKit. Para `npm install` fora do Docker, ele precisa estar no ambiente do terminal (o npm não lê
o `.env`).

## Conferir

```bash
npm run lint
npm test
npm run build      # tipos, traduções, ícones e build
npm run analyze    # tamanho de cada chunk
```

O CI (`.github/workflows/ci.yml`) roda tudo isso e constrói a imagem em cada pull request e push na
`main`.
