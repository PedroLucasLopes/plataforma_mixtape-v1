import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CloudflareApi } from './cloudflare-api.mjs'
import {
  BOT_SETTINGS,
  cacheRules,
  firewallRules,
  freePlanProblems,
  rateLimitRules,
  resourceNames,
  responseHeaderRules,
  tunnelIngress,
  turnstileDomains,
  ZONE_SETTINGS,
} from './edge.config.mjs'
import { writeEnvFile } from './env-file.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const WEB_ENV_FILE = resolve(HERE, '..', '.env')
const OUR_RULE_PREFIX = 'mixtape_'
const FREE_MANAGED_RULESET = /free managed ruleset/i
const ACCESS_SESSION = '24h'

const flags = new Set(process.argv.slice(2))
const APPLY = flags.has('--apply')
const report = { changed: 0, failed: 0 }

function line (mark, text) {
  console.log(`  ${mark} ${text}`)
}

const ok = text => line('✔', text)
function todo (text) {
  report.changed++
  line(APPLY ? '↻' : '•', `${text}${APPLY ? '' : ' (no --apply)'}`)
}
function fail (text) {
  report.failed++
  line('✖', text)
}

function readInputs (env) {
  const stage = (env.MIXTAPE_EDGE_STAGE ?? 'dev').trim()
  const inputs = {
    token: env.CLOUDFLARE_API_TOKEN?.trim(),
    accountId: env.CLOUDFLARE_ACCOUNT_ID?.trim(),
    zoneName: env.CLOUDFLARE_ZONE?.trim().toLowerCase(),
    hostname: env.MIXTAPE_EDGE_HOSTNAME?.trim().toLowerCase(),
    stage,
    emails: (env.MIXTAPE_ACCESS_EMAILS ?? '')
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(Boolean),
    apiEnvFile: resolve(HERE, '..', env.MIXTAPE_API_ENV_FILE ?? '../api/.env'),
  }
  const problems = []
  if (!['dev', 'prod'].includes(stage)) {
    problems.push('MIXTAPE_EDGE_STAGE deve ser dev ou prod')
  }
  if (inputs.token) {
    if (!inputs.accountId) {
      problems.push('falta CLOUDFLARE_ACCOUNT_ID')
    }
    if (!inputs.zoneName) {
      problems.push('falta CLOUDFLARE_ZONE')
    }
    if (!inputs.hostname) {
      problems.push('falta MIXTAPE_EDGE_HOSTNAME')
    } else if (inputs.zoneName && inputs.hostname !== inputs.zoneName && !inputs.hostname.endsWith(`.${inputs.zoneName}`)) {
      problems.push('MIXTAPE_EDGE_HOSTNAME precisa ser a zona ou um subdomínio dela')
    }
    if (stage === 'dev' && inputs.emails.length === 0 && !flags.has('--no-access')) {
      problems.push('no dev, MIXTAPE_ACCESS_EMAILS é obrigatório: sem o Access, o seu computador fica aberto para a internet')
    }
  }
  return { inputs, problems }
}

function offlinePlan (inputs) {
  console.log('Sem CLOUDFLARE_API_TOKEN: este é o que seria aplicado (nada foi lido nem mudado na conta).\n')
  console.log(`Configurações da zona: ${Object.keys(ZONE_SETTINGS).length} (${Object.keys(ZONE_SETTINGS).join(', ')})`)
  console.log(`Robôs: ${JSON.stringify(BOT_SETTINGS)}`)
  for (const [title, rules] of [
    ['Firewall (regras próprias)', firewallRules()],
    ['Limite por IP', rateLimitRules()],
    ['Cache', cacheRules()],
    ['Cabeçalhos de resposta', responseHeaderRules(inputs.stage, inputs.hostname ?? 'dev.<sua zona>')],
  ]) {
    console.log(`\n${title}:`)
    for (const rule of rules) {
      console.log(`  - ${rule.description}\n      ${rule.expression}`)
    }
  }
  console.log('\nTambém: regras gerenciadas grátis, Tiered Cache, túnel, Turnstile, Access (dev) e DNSSEC. Ver README.md.')
}

function withoutReadOnly (rule) {
  const copy = { ...rule }
  delete copy.version
  delete copy.last_updated
  return copy
}

function comparable (rule) {
  const { ref, description, action, expression, action_parameters: parameters, ratelimit } = rule
  return JSON.stringify({ ref, description, action, expression, parameters: parameters ?? null, ratelimit: ratelimit ?? null })
}

async function syncPhase (api, zoneId, phase, desired, label) {
  const current = await api.find(`/zones/${zoneId}/rulesets/phases/${phase}/entrypoint`)
  const others = (current?.rules ?? []).filter(rule => !rule.ref?.startsWith(OUR_RULE_PREFIX))
  const ours = (current?.rules ?? []).filter(rule => rule.ref?.startsWith(OUR_RULE_PREFIX))
  const same = ours.length === desired.length && ours.every((rule, index) => comparable(rule) === comparable(desired[index]))
  if (same) {
    return ok(`${label}: ${desired.length} regra(s) em dia`)
  }
  todo(`${label}: ${desired.length} regra(s) nossa(s)${others.length > 0 ? `, mantendo ${others.length} de fora` : ''}`)
  if (!APPLY) {
    return
  }
  await api.put(`/zones/${zoneId}/rulesets/phases/${phase}/entrypoint`, { rules: [...others.map(rule => withoutReadOnly(rule)), ...desired] })
}

async function syncZoneSettings (api, zoneId) {
  const current = new Map((await api.get(`/zones/${zoneId}/settings`)).map(setting => [setting.id, setting.value]))
  for (const [id, value] of Object.entries(ZONE_SETTINGS)) {
    if (!current.has(id)) {
      line('–', `${id}: não existe neste plano (ignorado)`)
      continue
    }
    if (String(current.get(id)) === String(value)) {
      continue
    }
    todo(`${id}: ${current.get(id)} → ${value}`)
    if (APPLY) {
      await api.patch(`/zones/${zoneId}/settings/${id}`, { value }).catch(error => fail(`${id}: ${error.message}`))
    }
  }
  ok('configurações da zona conferidas')
}

async function syncToggle (api, path, label) {
  const current = await api.get(path)
  if (current?.value === 'on') {
    return ok(`${label}: ligado`)
  }
  todo(`${label}: ligar`)
  if (APPLY) {
    await api.patch(path, { value: 'on' })
  }
}

async function syncBots (api, zoneId) {
  const current = await api.get(`/zones/${zoneId}/bot_management`)
  const differs = Object.entries(BOT_SETTINGS).filter(([key, value]) => current?.[key] !== value)
  if (differs.length === 0) {
    return ok('robôs: Bot Fight Mode e bloqueio de robôs de IA ligados')
  }
  todo(`robôs: ${differs.map(([key, value]) => `${key}=${value}`).join(', ')}`)
  if (APPLY) {
    await api.put(`/zones/${zoneId}/bot_management`, BOT_SETTINGS)
  }
}

async function syncManagedRules (api, zoneId) {
  const rulesets = await api.get(`/zones/${zoneId}/rulesets`)
  const free = rulesets.find(ruleset => ruleset.kind === 'managed' && FREE_MANAGED_RULESET.test(ruleset.name))
  if (!free) {
    return line('–', 'regras gerenciadas grátis: a zona não oferece (ignorado)')
  }
  const entrypoint = await api.find(`/zones/${zoneId}/rulesets/phases/http_request_firewall_managed/entrypoint`)
  const deployed = (entrypoint?.rules ?? []).some(rule => rule.action === 'execute' && rule.action_parameters?.id === free.id)
  if (deployed) {
    return ok('regras gerenciadas grátis da Cloudflare: ativas')
  }
  await syncPhase(api, zoneId, 'http_request_firewall_managed', [
    {
      ref: `${OUR_RULE_PREFIX}free_managed`,
      description: 'Mixtape: regras gerenciadas grátis da Cloudflare',
      action: 'execute',
      expression: 'true',
      action_parameters: { id: free.id },
    },
  ], 'regras gerenciadas grátis')
}

async function syncTunnel (api, inputs, names) {
  const base = `/accounts/${inputs.accountId}/cfd_tunnel`
  let tunnel = (await api.get(`${base}?name=${encodeURIComponent(names.tunnel)}&is_deleted=false`))[0]
  let token = null
  if (tunnel) {
    ok(`túnel ${names.tunnel}: existe`)
  } else {
    todo(`túnel ${names.tunnel}: criar`)
    if (!APPLY) {
      return { id: null, token: null }
    }
    tunnel = await api.post(base, { name: names.tunnel, config_src: 'cloudflare' })
    token = tunnel.token ?? null
  }
  const desired = tunnelIngress(inputs.hostname)
  const current = await api.find(`${base}/${tunnel.id}/configurations`)
  if (JSON.stringify(current?.config?.ingress ?? []) === JSON.stringify(desired.ingress)) {
    ok(`túnel: ${inputs.hostname} → nginx (porta do túnel)`)
  } else {
    todo(`túnel: ${inputs.hostname} → nginx (porta do túnel)`)
    if (APPLY) {
      await api.put(`${base}/${tunnel.id}/configurations`, { config: desired })
    }
  }
  token ??= APPLY && flags.has('--write-env') ? await api.get(`${base}/${tunnel.id}/token`) : null
  return { id: tunnel.id, token }
}

async function syncDns (api, zoneId, inputs, tunnelId) {
  if (!tunnelId) {
    return todo(`DNS: ${inputs.hostname} → túnel (depois de criar o túnel)`)
  }
  const target = `${tunnelId}.cfargotunnel.com`
  const record = (await api.get(`/zones/${zoneId}/dns_records?name=${encodeURIComponent(inputs.hostname)}`))[0]
  const desired = { type: 'CNAME', name: inputs.hostname, content: target, proxied: true, comment: 'Mixtape: túnel da Cloudflare' }
  if (record?.type === 'CNAME' && record.content === target && record.proxied) {
    return ok(`DNS: ${inputs.hostname} → túnel (com proxy)`)
  }
  todo(`DNS: ${inputs.hostname} → túnel (com proxy)${record ? `, no lugar do ${record.type} atual` : ''}`)
  if (!APPLY) {
    return
  }
  await (record ? api.patch(`/zones/${zoneId}/dns_records/${record.id}`, desired) : api.post(`/zones/${zoneId}/dns_records`, desired))
}

async function syncTurnstile (api, inputs, names) {
  const base = `/accounts/${inputs.accountId}/challenges/widgets`
  const domains = turnstileDomains(inputs.stage, inputs.zoneName)
  const widget = (await api.get(`${base}?per_page=100`)).find(item => item.name === names.widget)
  if (!widget) {
    todo(`Turnstile: criar o widget "${names.widget}" (${domains.join(', ')})`)
    if (!APPLY) {
      return null
    }
    const created = await api.post(base, { name: names.widget, domains, mode: 'managed' })
    return { siteKey: created.sitekey, secret: created.secret }
  }
  const sameDomains = JSON.stringify(widget.domains.toSorted()) === JSON.stringify(domains.toSorted())
  if (sameDomains) {
    ok(`Turnstile: widget "${names.widget}" em dia`)
  } else {
    todo(`Turnstile: hosts do widget → ${domains.join(', ')}`)
    if (APPLY) {
      await api.put(`${base}/${widget.sitekey}`, { name: names.widget, domains, mode: widget.mode })
    }
  }
  if (!flags.has('--rotate-turnstile-secret')) {
    return { siteKey: widget.sitekey, secret: null }
  }
  todo('Turnstile: chave secreta nova')
  if (!APPLY) {
    return { siteKey: widget.sitekey, secret: null }
  }
  const rotated = await api.post(`${base}/${widget.sitekey}/rotate_secret`, { invalidate_immediately: false })
  return { siteKey: widget.sitekey, secret: rotated.secret }
}

async function syncAccess (api, inputs, names) {
  const base = `/accounts/${inputs.accountId}/access`
  const organization = await api.find(`${base}/organizations`).catch(() => null)
  if (!organization?.auth_domain) {
    return fail('Access: o Zero Trust ainda não foi ativado nesta conta (painel > Zero Trust, plano Free); rode de novo depois')
  }
  let provider = (await api.get(`${base}/identity_providers`)).find(item => item.type === 'onetimepin')
  if (provider) {
    ok('Access: entrada por código no e-mail disponível')
  } else {
    todo('Access: ligar a entrada por código no e-mail')
    if (APPLY) {
      provider = await api.post(`${base}/identity_providers`, { name: 'Código por e-mail', type: 'onetimepin', config: {} })
    }
  }
  const policyBody = {
    name: names.accessPolicy,
    decision: 'allow',
    include: inputs.emails.map(email => ({ email: { email } })),
    session_duration: ACCESS_SESSION,
  }
  let policy = (await api.get(`${base}/policies?per_page=100`)).find(item => item.name === names.accessPolicy)
  const policyEmails = new Set((policy?.include ?? []).map(rule => rule.email?.email))
  if (policy && policyEmails.size === inputs.emails.length && inputs.emails.every(email => policyEmails.has(email))) {
    ok(`Access: política com ${inputs.emails.length} e-mail(s)`)
  } else {
    todo(`Access: política com ${inputs.emails.length} e-mail(s)`)
    if (APPLY) {
      policy = await (policy ? api.put(`${base}/policies/${policy.id}`, policyBody) : api.post(`${base}/policies`, policyBody))
    }
  }
  const app = (await api.get(`${base}/apps?per_page=100`)).find(item => item.domain === inputs.hostname)
  if (app?.policies?.some(item => item.id === policy?.id)) {
    return ok(`Access: ${inputs.hostname} protegido`)
  }
  todo(`Access: proteger ${inputs.hostname}`)
  if (!APPLY || !policy || !provider) {
    return
  }
  const appBody = {
    name: names.accessApp,
    domain: inputs.hostname,
    type: 'self_hosted',
    session_duration: ACCESS_SESSION,
    app_launcher_visible: false,
    auto_redirect_to_identity: true,
    allowed_idps: [provider.id],
    policies: [{ id: policy.id, precedence: 1 }],
  }
  await (app ? api.put(`${base}/apps/${app.id}`, appBody) : api.post(`${base}/apps`, appBody))
}

async function syncDnssec (api, zoneId) {
  const dnssec = await api.get(`/zones/${zoneId}/dnssec`)
  if (dnssec?.status === 'active') {
    return ok('DNSSEC: ativo')
  }
  if (dnssec?.status === 'pending') {
    return line('…', `DNSSEC: falta o registro DS no registrador: ${dnssec.ds ?? '(veja no painel > DNS > Settings)'}`)
  }
  todo('DNSSEC: ativar (depois, o registro DS vai no registrador do domínio)')
  if (APPLY) {
    await api.patch(`/zones/${zoneId}/dnssec`, { status: 'active' })
  }
}

async function main () {
  const problems = freePlanProblems()
  if (problems.length > 0) {
    throw new Error(`edge.config.mjs passa do plano Free: ${problems.join(', ')}`)
  }
  const { inputs, problems: inputProblems } = readInputs(process.env)
  if (inputProblems.length > 0) {
    throw new Error(inputProblems.join('; '))
  }
  if (!inputs.token) {
    return offlinePlan(inputs)
  }

  const api = new CloudflareApi(inputs.token, process.env.CLOUDFLARE_API_BASE)
  const names = resourceNames(inputs.stage)
  const zone = (await api.get(`/zones?name=${encodeURIComponent(inputs.zoneName)}&account.id=${encodeURIComponent(inputs.accountId)}`))[0]
  if (!zone) {
    throw new Error(`a zona ${inputs.zoneName} não está nesta conta`)
  }
  console.log(`${APPLY ? 'Aplicando' : 'Plano'} na zona ${zone.name} (plano ${zone.plan?.name ?? '?'}), ambiente ${inputs.stage}, host ${inputs.hostname}\n`)

  const steps = [
    ['Zona', () => syncZoneSettings(api, zone.id)],
    ['Cache em camadas', async () => {
      await syncToggle(api, `/zones/${zone.id}/argo/tiered_caching`, 'Tiered Cache')
      await syncToggle(api, `/zones/${zone.id}/cache/tiered_cache_smart_topology_enable`, 'topologia inteligente')
    }],
    ['Robôs', () => syncBots(api, zone.id)],
    ['Firewall', async () => {
      await syncManagedRules(api, zone.id)
      await syncPhase(api, zone.id, 'http_request_firewall_custom', firewallRules(), 'regras próprias')
      await syncPhase(api, zone.id, 'http_ratelimit', rateLimitRules(), 'limite por IP')
    }],
    ['Cache', () => syncPhase(api, zone.id, 'http_request_cache_settings', cacheRules(), 'regras de cache')],
    ['Cabeçalhos', () => syncPhase(api, zone.id, 'http_response_headers_transform', responseHeaderRules(inputs.stage, inputs.hostname), 'cabeçalhos de resposta')],
  ]
  const secrets = {}
  steps.push(['Túnel e DNS', async () => {
    const tunnel = await syncTunnel(api, inputs, names)
    secrets.tunnelToken = tunnel.token
    await syncDns(api, zone.id, inputs, tunnel.id)
  }], ['Turnstile', async () => {
    secrets.turnstile = await syncTurnstile(api, inputs, names)
  }])
  if (inputs.stage === 'dev' && inputs.emails.length > 0) {
    steps.push(['Access', () => syncAccess(api, inputs, names)])
  }
  steps.push(['DNSSEC', () => syncDnssec(api, zone.id)])

  for (const [title, run] of steps) {
    console.log(title)
    await run().catch(error => fail(error.message))
  }

  if (flags.has('--write-env') && APPLY) {
    await writeSecrets(inputs, secrets)
  }
  console.log(`\n${report.failed > 0 ? `${report.failed} erro(s). ` : ''}${report.changed === 0 ? 'Nada a mudar.' : `${report.changed} mudança(s) ${APPLY ? 'aplicada(s)' : 'no plano: rode com --apply'}.`}`)
  if (report.failed > 0) {
    process.exitCode = 1
  }
}

async function writeSecrets (inputs, secrets) {
  console.log('Arquivos .env')
  if (secrets.tunnelToken) {
    const keys = await writeEnvFile(WEB_ENV_FILE, { CLOUDFLARE_TUNNEL_TOKEN: secrets.tunnelToken })
    ok(`${WEB_ENV_FILE}: ${keys.join(', ')}`)
  }
  const turnstile = secrets.turnstile
  if (turnstile?.siteKey) {
    const values = {
      TURNSTILE_ENABLED: 'true',
      TURNSTILE_SITE_KEY: turnstile.siteKey,
      TURNSTILE_HOSTNAMES: turnstileDomains(inputs.stage, inputs.zoneName).join(','),
      TURNSTILE_ALLOW_TEST_KEYS: 'false',
      ...(turnstile.secret ? { TURNSTILE_SECRET_KEY: turnstile.secret } : {}),
    }
    const keys = await writeEnvFile(inputs.apiEnvFile, values)
    ok(`${inputs.apiEnvFile}: ${keys.join(', ')}`)
    if (!turnstile.secret) {
      line('…', 'a chave secreta do Turnstile só sai na criação: use --rotate-turnstile-secret para gerar outra')
    }
  }
}

main().catch(error => {
  console.error(`✖ ${error.message}`)
  process.exitCode = 1
})
