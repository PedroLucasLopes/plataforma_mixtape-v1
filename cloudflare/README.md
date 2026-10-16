# ☁️ The Cloudflare edge (Free plan)

Mixtape's front layer as code: CDN, firewall, per-IP limit, bots, tunnel, Turnstile and Access, all within the
**Free** plan (US$ 0). `edge.config.mjs` states what the account should have; `apply.mjs` reads the account and
applies only the difference. Everything that belongs to the account (token, zone, hostnames, e-mails) comes from
the terminal's environment, never from the repository.

```bash
npm run edge:plan                          # shows what would change (without a token: what would be created, touching nothing)
npm run edge:apply                         # applies it
npm run edge:apply -- --write-env          # applies it and writes the tunnel token (site .env) and Turnstile keys (API .env)
npm run test:edge                          # checks the configuration without touching the account
COMPOSE_PROFILES=cloudflare docker compose up -d   # brings the tunnel up with the site
```

## What is switched on

| Layer | What | Why |
|---|---|---|
| Entrance | **Tunnel** (`cloudflared` in the site's Compose project) to nginx on port **8081** | the machine opens no port: the tunnel dials out to Cloudflare |
| Real IP | nginx accepts `CF-Connecting-IP` only on 8081 (reachable only by the tunnel) and rewrites `X-Forwarded-For` | nobody picks their own IP for the API's limits (with `TRUST_PROXY=1` on the API) |
| TLS | Full (strict), always HTTPS, TLS 1.2+, TLS 1.3, HTTP/3, no 0-RTT | 0-RTT accepts replayed requests |
| Cache | covers (30 days), the public catalog and the sitemap, following the API's `Cache-Control`; **Tiered Cache** | slow MusicBrainz and archive.org responses cost only the first visitor |
| Never cached | HTML (the CSP nonce changes on every page), search, `/reviews`, `/stats` and anything that declares no cache | the API answers `no-store` by default: a new route that depends on the caller is protected from birth |
| Firewall | free managed rules + 3 of ours: scans (`/.env`, `/wp-admin`, `.php`…), methods the site does not use, API calls without a User-Agent | out of the 5 the Free plan allows |
| Per-IP limit | 150 API requests in 10 s (covers excluded), 10 s block | the Free plan's only rule: flood protection only; the fine-grained limits belong to the API |
| Bots | Bot Fight Mode and blocking of AI crawlers | Bot Fight Mode **accepts no exceptions** (see Pitfalls) |
| Forms | **Turnstile** (widget "Mixtape (dev)") on login, sign-up and "forgot password"; the API verifies it | free and unlimited |
| Dev | **Access** in front of `dev.<domain>` (one-time code by e-mail, only for the addresses in `MIXTAPE_ACCESS_EMAILS`) and `X-Robots-Tag: noindex` | the development computer is not open to the internet |
| DNS | DNSSEC | the DS record goes to the domain's registrar |
| Zone | no Always Online (it would ignore `stale-while-revalidate`), no Email Obfuscation or Rocket Loader (they would break the CSP), browser cache following the origin | |

## Before the first `apply` (in the dashboard, once)

1. A Cloudflare account, with **two-factor authentication**.
2. The **domain** added to the account (Free plan) and its name servers switched at the registrar (Registro.br,
   for example). The domain stays yours; Cloudflare starts answering its DNS.
3. **Zero Trust** enabled on the Free plan (dashboard > Zero Trust; you pick a team name). Without it, `apply` warns
   and skips Access, and then **do not bring up the dev environment's tunnel**.
4. An **API token** (My Profile > API Tokens > Create Token > Custom), limited to this account and this zone:
   - Account: *Cloudflare Tunnel: Edit*, *Turnstile Sites: Edit* (or *Account Settings: Edit*), *Access: Apps and
     Policies: Edit*, *Access: Organizations, Identity Providers, and Groups: Edit*.
   - Zone: *Zone: Read*, *Zone Settings: Edit*, *DNS: Edit*, *Zone WAF: Edit*, *Cache Settings: Edit*, *Transform
     Rules: Edit*, *Bot Management: Edit*.
   - If one is missing, `apply` says which call failed and carries on with the others.

## Terminal environment

| Variable | Example | |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | — | secret: never in any project's `.env` (the API's goes whole into its container) |
| `CLOUDFLARE_ACCOUNT_ID` | — | dashboard > the account > right side of the zone's page |
| `CLOUDFLARE_ZONE` | `mydomain.com` | |
| `MIXTAPE_EDGE_HOSTNAME` | `dev.mydomain.com` | the zone or one of its subdomains |
| `MIXTAPE_EDGE_STAGE` | `dev` (default) or `prod` | `dev` turns on Access and `noindex`, and Turnstile accepts `localhost` |
| `MIXTAPE_ACCESS_EMAILS` | `you@example.com` | required for `dev` (comma-separated) |
| `MIXTAPE_API_ENV_FILE` | `../api/.env` (default) | where `--write-env` writes the Turnstile keys |

`--write-env` writes `CLOUDFLARE_TUNNEL_TOKEN` to the site's `.env`, and `TURNSTILE_ENABLED`, `TURNSTILE_SITE_KEY`,
`TURNSTILE_SECRET_KEY` (it exists only when the widget is created; `--rotate-turnstile-secret` makes a new one),
`TURNSTILE_HOSTNAMES` and `TURNSTILE_ALLOW_TEST_KEYS=false` to the API's. Only the key names appear on screen.

## Developing without a domain

Everything keeps working on `localhost`, just without the edge:

- **Turnstile:** Cloudflare's public test keys (the challenge passes on its own, no account needed). In the API's
  `.env`: `TURNSTILE_ENABLED=true`, `TURNSTILE_SITE_KEY=1x00000000000000000000AA`,
  `TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA` and `TURNSTILE_ALLOW_TEST_KEYS=true`. The test secret
  accepts **any** token: the API refuses both test keys without `TURNSTILE_ALLOW_TEST_KEYS`, and the security suite
  and end-to-end tests send the test token (`XXXX.DUMMY.TOKEN.XXXX`).
- **Real IP and cache:** nginx's port 8081 and the API's `no-store` behave the same; the security suite checks that a
  spoofed IP does not escape the limit and that personal routes leave with `no-store`.

## ⚠️ Pitfalls

- **Never publish nginx's port 8081.** It accepts whatever IP arrives in `CF-Connecting-IP`; published, anyone
  could pick their own IP for the limits.
- **Bot Fight Mode accepts no exceptions** (not even through a firewall rule): it may challenge uptime monitors,
  scripts and a future mobile app. The security suite and the end-to-end tests run against `localhost`, not
  against the domain. If it gets in the way, turn it off in `BOT_SETTINGS` and run `apply`.
- **HTML is never cached:** `index.html` leaves with `no-cache`, and no cache rule matches HTML. Cached, the CSP
  nonce would be the same for everyone.
- **A route that depends on the caller needs nothing:** the API answers `no-store` to everything that does not
  declare its own `Cache-Control`. The opposite needs care: mark as `public` only what is the same for everyone.
- **Free plan:** 5 firewall rules (we use 3), 1 per-IP limit (10 s window and block, by IP only), rules without
  regular expressions. Going beyond that takes Pro (US$ 20/month: OWASP, 20 rules, 2 limits).
- **A Turnstile test key in production** would silently disable the check: the API does not start with one unless
  `TURNSTILE_ALLOW_TEST_KEYS=true`, and refuses test-key responses when it is off.
