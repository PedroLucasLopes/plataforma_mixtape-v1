// A borda da Cloudflare do Mixtape como código, só com o que o plano Free cobre. Este arquivo é a fonte da verdade:
// o apply.mjs lê o que está na conta e aplica a diferença. O que é da conta (token, conta, zona, hosts, e-mails do
// Access) vem do ambiente; nada sensível mora aqui. Ver README.md.

/** Limites do plano Free que as regras respeitam (o apply recusa passar deles). */
export const FREE_PLAN = {
  customRules: 5,
  rateLimitRules: 1,
  /** No Free, o limite por IP conta em janelas de 10 s e bloqueia por 10 s. */
  rateLimitSeconds: 10,
  turnstileHostnames: 10,
}

/** Por onde o túnel entra: o nginx (serviço "web" do compose) na porta que aceita o IP vindo da Cloudflare. */
export const TUNNEL_ORIGIN = 'http://web:8081'

/** Configurações da zona (PATCH /zones/:zona/settings/:nome). */
export const ZONE_SETTINGS = {
  'ssl': 'strict',
  'always_use_https': 'on',
  'min_tls_version': '1.2',
  'tls_1_3': 'on',
  'automatic_https_rewrites': 'on',
  'opportunistic_encryption': 'on',
  'http3': 'on',
  // Retomada 0-RTT aceita repetição do pedido: fica desligada.
  '0rtt': 'off',
  'browser_check': 'on',
  // Ligado, faz a Cloudflare ignorar o stale-while-revalidate da origem.
  'always_online': 'off',
  // Os dois reescrevem o HTML e injetam script: com a CSP por nonce, quebrariam a página.
  'email_obfuscation': 'off',
  'rocket_loader': 'off',
  // 0: respeitar o Cache-Control da origem (a API e o nginx já dizem quanto tempo cada coisa vale).
  'browser_cache_ttl': 0,
  'ip_geolocation': 'on',
  'websockets': 'on',
}

/** Robôs: Bot Fight Mode (grátis; não aceita exceção) e bloqueio dos robôs de IA que copiam conteúdo. */
export const BOT_SETTINGS = { fight_mode: true, enable_js: true, ai_bots_protection: 'block' }

/** Pedaços de caminho que só robô de varredura pede: o Mixtape não tem PHP, WordPress, painel nem arquivo escondido. */
export const SCANNER_PATH_PARTS = [
  '/.env',
  '/.git',
  '/.svn',
  '/.aws',
  '/.ssh',
  '/.vscode',
  '/.ds_store',
  '/wp-admin',
  '/wp-login',
  '/wp-content',
  '/wp-includes',
  '/xmlrpc',
  '/phpmyadmin',
  '/cgi-bin',
  '/server-status',
  '/actuator',
  '/vendor/phpunit',
]

export const SCANNER_EXTENSIONS = ['.php', '.asp', '.aspx', '.jsp', '.cgi', '.bak', '.sql']

/** Métodos que o site e a API usam; o resto para na borda. */
export const ALLOWED_METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']

/**
 * Limite por IP na borda, só contra inundação: 150 pedidos à API em 10 s (15 por segundo, sem contar as capas). Os
 * limites finos, por rota, continuam na API.
 */
export const API_FLOOD = { requestsPerPeriod: 150 }

export const COVERS_PREFIX = '/api/v1/images/'

/**
 * Rotas públicas que a borda guarda pelo tempo que a API manda no Cache-Control. Embaixo delas existem rotas que
 * dependem de quem pede (`/reviews` e `/stats` trazem a "minha avaliação"): ficam de fora aqui, e a API ainda
 * responde `no-store` em tudo que não declara cache (duas travas).
 */
export const CACHED_API_PREFIXES = ['/api/v1/albums/', '/api/v1/tracks/', '/api/v1/artists/', '/api/v1/genres', '/api/v1/charts/', '/api/v1/seo/']
export const PERSONAL_SUFFIXES = ['/reviews', '/stats']

/** Cabeçalho que tira o ambiente de desenvolvimento dos buscadores. */
export const DEV_ROBOTS_TAG = 'noindex, nofollow'

/** Nome dos recursos na conta (túnel, widget do Turnstile, aplicação e política do Access), por ambiente. */
export function resourceNames (stage) {
  return {
    tunnel: `mixtape-${stage}`,
    widget: `Mixtape (${stage})`,
    accessApp: `Mixtape (${stage})`,
    accessPolicy: `Mixtape (${stage}): quem pode entrar`,
  }
}

/** Texto entre aspas na linguagem de regras da Cloudflare. */
export function quote (value) {
  return `"${String(value).replaceAll('\\', '\\\\').replaceAll('"', String.raw`\"`)}"`
}

function anyOf (conditions) {
  return `(${conditions.join(' or ')})`
}

const PATH = 'http.request.uri.path'
const LOWER_PATH = `lower(${PATH})`

/** Regras próprias do firewall (WAF custom rules). Sem expressão regular: o Free não tem. */
export function firewallRules () {
  const scanners = anyOf([
    ...SCANNER_PATH_PARTS.map(part => `${LOWER_PATH} contains ${quote(part)}`),
    ...SCANNER_EXTENSIONS.map(extension => `ends_with(${LOWER_PATH}, ${quote(extension)})`),
  ])
  return [
    {
      ref: 'mixtape_scanners',
      description: 'Mixtape: varreduras de arquivos e painéis que o site não tem',
      action: 'block',
      expression: scanners,
    },
    {
      ref: 'mixtape_methods',
      description: 'Mixtape: métodos HTTP que o site não usa',
      action: 'block',
      expression: `not http.request.method in {${ALLOWED_METHODS.map(method => quote(method)).join(' ')}}`,
    },
    {
      ref: 'mixtape_api_no_agent',
      description: 'Mixtape: chamada à API sem User-Agent',
      action: 'block',
      expression: `(starts_with(${PATH}, "/api/") and http.user_agent eq "")`,
    },
  ]
}

/** A única regra de limite por IP do Free. */
export function rateLimitRules () {
  return [
    {
      ref: 'mixtape_api_flood',
      description: 'Mixtape: inundação na API (por IP; os limites finos são da API)',
      action: 'block',
      expression: `(starts_with(${PATH}, "/api/") and not starts_with(${PATH}, ${quote(COVERS_PREFIX)}))`,
      ratelimit: {
        characteristics: ['cf.colo.id', 'ip.src'],
        period: FREE_PLAN.rateLimitSeconds,
        requests_per_period: API_FLOOD.requestsPerPeriod,
        mitigation_timeout: FREE_PLAN.rateLimitSeconds,
      },
    },
  ]
}

const RESPECT_ORIGIN = {
  cache: true,
  edge_ttl: { mode: 'respect_origin' },
  browser_ttl: { mode: 'respect_origin' },
  serve_stale: { disable_stale_while_updating: false },
}

/** Regras de cache: o HTML nunca entra (o nonce da CSP muda a cada página); a busca e o que é pessoal, também não. */
export function cacheRules () {
  const catalog = [
    'http.request.method eq "GET"',
    anyOf(CACHED_API_PREFIXES.map(prefix => `starts_with(${PATH}, ${quote(prefix)})`)),
    ...PERSONAL_SUFFIXES.map(suffix => `not ends_with(${PATH}, ${quote(suffix)})`),
  ].join(' and ')
  return [
    {
      ref: 'mixtape_covers',
      description: 'Mixtape: capas (30 dias, conforme a API)',
      action: 'set_cache_settings',
      expression: `starts_with(${PATH}, ${quote(COVERS_PREFIX)})`,
      action_parameters: RESPECT_ORIGIN,
    },
    {
      ref: 'mixtape_catalog',
      description: 'Mixtape: catálogo público (o Cache-Control da API decide quanto tempo)',
      action: 'set_cache_settings',
      expression: `(${catalog})`,
      action_parameters: RESPECT_ORIGIN,
    },
    {
      ref: 'mixtape_sitemaps',
      description: 'Mixtape: sitemap e robots.txt',
      action: 'set_cache_settings',
      expression: `(${PATH} in {"/sitemap.xml" "/robots.txt"} or starts_with(${PATH}, "/sitemaps/"))`,
      action_parameters: RESPECT_ORIGIN,
    },
  ]
}

/** Cabeçalhos de resposta: o ambiente de desenvolvimento fica fora dos buscadores. */
export function responseHeaderRules (stage, hostname) {
  if (stage !== 'dev') {
    return []
  }
  return [
    {
      ref: 'mixtape_dev_noindex',
      description: 'Mixtape: ambiente de desenvolvimento fora dos buscadores',
      action: 'rewrite',
      expression: `(http.host eq ${quote(hostname)})`,
      action_parameters: { headers: { 'X-Robots-Tag': { operation: 'set', value: DEV_ROBOTS_TAG } } },
    },
  ]
}

/** Entrada do túnel: o host vai para o nginx; o resto, 404 (a regra que pega tudo precisa ser a última). */
export function tunnelIngress (hostname) {
  return { ingress: [{ hostname, service: TUNNEL_ORIGIN, originRequest: {} }, { service: 'http_status:404' }] }
}

/**
 * Hosts do widget do Turnstile: o domínio da zona (vale para os subdomínios). No desenvolvimento entra o localhost,
 * para a mesma chave valer em localhost:5180; em produção, nunca.
 */
export function turnstileDomains (stage, zoneName) {
  return stage === 'dev' ? [zoneName, 'localhost'] : [zoneName]
}

/** Confere os limites do Free antes de tocar na conta. Devolve a lista de problemas (vazia: dentro do plano). */
export function freePlanProblems () {
  const problems = []
  if (firewallRules().length > FREE_PLAN.customRules) {
    problems.push(`mais de ${FREE_PLAN.customRules} regras de firewall`)
  }
  if (rateLimitRules().length > FREE_PLAN.rateLimitRules) {
    problems.push(`mais de ${FREE_PLAN.rateLimitRules} regra de limite`)
  }
  const expressions = [...firewallRules(), ...rateLimitRules(), ...cacheRules()].map(rule => rule.expression)
  if (expressions.some(expression => /\smatches\s|~/.test(expression))) {
    problems.push('expressão regular (o Free não tem)')
  }
  return problems
}
