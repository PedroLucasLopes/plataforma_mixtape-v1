export const FREE_PLAN = {
  customRules: 5,
  rateLimitRules: 1,
  rateLimitSeconds: 10,
  turnstileHostnames: 10,
}

export const TUNNEL_ORIGIN = 'http://web:8081'

export const ZONE_SETTINGS = {
  'ssl': 'strict',
  'always_use_https': 'on',
  'min_tls_version': '1.2',
  'tls_1_3': 'on',
  'automatic_https_rewrites': 'on',
  'opportunistic_encryption': 'on',
  'http3': 'on',
  '0rtt': 'off',
  'browser_check': 'on',
  'always_online': 'off',
  'email_obfuscation': 'off',
  'rocket_loader': 'off',
  'browser_cache_ttl': 0,
  'ip_geolocation': 'on',
  'websockets': 'on',
}

export const BOT_SETTINGS = { fight_mode: true, enable_js: true, ai_bots_protection: 'block' }

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

export const ALLOWED_METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']

export const API_FLOOD = { requestsPerPeriod: 150 }

export const COVERS_PREFIX = '/api/v1/images/'

export const CACHED_API_PREFIXES = ['/api/v1/albums/', '/api/v1/tracks/', '/api/v1/artists/', '/api/v1/genres', '/api/v1/charts/', '/api/v1/seo/']
export const PERSONAL_SUFFIXES = ['/reviews', '/stats']

export const DEV_ROBOTS_TAG = 'noindex, nofollow'

export function resourceNames (stage) {
  return {
    tunnel: `mixtape-${stage}`,
    widget: `Mixtape (${stage})`,
    accessApp: `Mixtape (${stage})`,
    accessPolicy: `Mixtape (${stage}): quem pode entrar`,
  }
}

export function quote (value) {
  return `"${String(value).replaceAll('\\', '\\\\').replaceAll('"', String.raw`\"`)}"`
}

function anyOf (conditions) {
  return `(${conditions.join(' or ')})`
}

const PATH = 'http.request.uri.path'
const LOWER_PATH = `lower(${PATH})`

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

export function tunnelIngress (hostname) {
  return { ingress: [{ hostname, service: TUNNEL_ORIGIN, originRequest: {} }, { service: 'http_status:404' }] }
}

export function turnstileDomains (stage, zoneName) {
  return stage === 'dev' ? [zoneName, 'localhost'] : [zoneName]
}

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
