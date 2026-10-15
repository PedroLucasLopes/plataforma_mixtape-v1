// node --test cloudflare/ (npm run test:edge): a borda declarada em edge.config.mjs, sem tocar na conta.
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  ALLOWED_METHODS,
  CACHED_API_PREFIXES,
  cacheRules,
  COVERS_PREFIX,
  firewallRules,
  FREE_PLAN,
  freePlanProblems,
  PERSONAL_SUFFIXES,
  quote,
  rateLimitRules,
  responseHeaderRules,
  TUNNEL_ORIGIN,
  tunnelIngress,
  turnstileDomains,
} from './edge.config.mjs'
import { upsertEnv } from './env-file.mjs'

/** O mesmo critério da regra de cache do catálogo, em JavaScript, para conferir caminhos de verdade. */
function cachedCatalog (path) {
  return CACHED_API_PREFIXES.some(prefix => path.startsWith(prefix)) && !PERSONAL_SUFFIXES.some(suffix => path.endsWith(suffix))
}

describe('borda da Cloudflare (plano Free)', () => {
  it('cabe no plano Free: até 5 regras próprias, 1 limite por IP e nenhuma expressão regular', () => {
    assert.deepEqual(freePlanProblems(), [])
    assert.ok(firewallRules().length <= FREE_PLAN.customRules)
    assert.equal(rateLimitRules().length, FREE_PLAN.rateLimitRules)
  })

  it('toda regra é nossa (ref mixtape_*) e tem descrição: o apply só troca as dele', () => {
    for (const rule of [...firewallRules(), ...rateLimitRules(), ...cacheRules(), ...responseHeaderRules('dev', 'dev.exemplo.com')]) {
      assert.match(rule.ref, /^mixtape_/)
      assert.ok(rule.description.startsWith('Mixtape: '))
    }
  })

  it('bloqueia varreduras sem ligar para maiúscula e só os métodos que o site não usa', () => {
    const [scanners, methods] = firewallRules()
    assert.ok(scanners.expression.includes('lower(http.request.uri.path) contains "/.env"'))
    assert.ok(scanners.expression.includes('ends_with(lower(http.request.uri.path), ".php")'))
    for (const method of ALLOWED_METHODS) {
      assert.ok(methods.expression.includes(`"${method}"`))
    }
    assert.ok(methods.expression.startsWith('not http.request.method in {'))
  })

  it('o limite por IP do Free conta em 10 s, por IP e local, e deixa as capas de fora', () => {
    const [flood] = rateLimitRules()
    assert.deepEqual(flood.ratelimit.characteristics, ['cf.colo.id', 'ip.src'])
    assert.equal(flood.ratelimit.period, 10)
    assert.equal(flood.ratelimit.mitigation_timeout, 10)
    assert.ok(flood.expression.includes(`not starts_with(http.request.uri.path, "${COVERS_PREFIX}")`))
  })

  it('guarda o catálogo público e nunca o que depende de quem pede', () => {
    for (const path of ['/api/v1/albums/b1392450-e666-3926-a536-22c65f834433', '/api/v1/charts/albums', '/api/v1/genres/showcase']) {
      assert.ok(cachedCatalog(path), path)
    }
    for (const path of [
      '/api/v1/albums/b1392450-e666-3926-a536-22c65f834433/reviews',
      '/api/v1/tracks/9f9cf187-d6f9-437f-9d98-d59cdbd52757/stats',
      '/api/v1/search/albums',
      '/api/v1/me',
      '/api/v1/users/ana/library',
      '/api/v1/auth/login',
      '/',
      '/index.html',
    ]) {
      assert.ok(!cachedCatalog(path), path)
    }
    const catalog = cacheRules().find(rule => rule.ref === 'mixtape_catalog')
    for (const suffix of PERSONAL_SUFFIXES) {
      assert.ok(catalog.expression.includes(`not ends_with(http.request.uri.path, "${suffix}")`))
    }
    for (const rule of cacheRules()) {
      assert.equal(rule.action_parameters.edge_ttl.mode, 'respect_origin')
    }
  })

  it('só o ambiente dev sai dos buscadores', () => {
    const [noindex] = responseHeaderRules('dev', 'dev.exemplo.com')
    assert.equal(noindex.expression, '(http.host eq "dev.exemplo.com")')
    assert.deepEqual(responseHeaderRules('prod', 'exemplo.com'), [])
  })

  it('o túnel entra pela porta do nginx que aceita o IP da Cloudflare, e o resto dá 404', () => {
    const { ingress } = tunnelIngress('dev.exemplo.com')
    assert.equal(ingress[0].service, TUNNEL_ORIGIN)
    assert.equal(TUNNEL_ORIGIN, 'http://web:8081')
    assert.deepEqual(ingress.at(-1), { service: 'http_status:404' })
  })

  it('o widget do Turnstile vale no localhost só no dev', () => {
    assert.deepEqual(turnstileDomains('dev', 'exemplo.com'), ['exemplo.com', 'localhost'])
    assert.deepEqual(turnstileDomains('prod', 'exemplo.com'), ['exemplo.com'])
  })

  it('escapa aspas e barras no texto das regras', () => {
    assert.equal(quote(String.raw`a"b\c`), String.raw`"a\"b\\c"`)
  })
})

describe('gravação do .env', () => {
  it('troca o valor das chaves que existem, acrescenta as que faltam e mantém o resto', () => {
    const before = '# comentário\nWEB_PORT=5180\nCLOUDFLARE_TUNNEL_TOKEN=velho\n'
    const after = upsertEnv(before, { CLOUDFLARE_TUNNEL_TOKEN: 'novo', TURNSTILE_ENABLED: 'true' })
    assert.equal(after, '# comentário\nWEB_PORT=5180\nCLOUDFLARE_TUNNEL_TOKEN=novo\nTURNSTILE_ENABLED=true\n')
  })

  it('põe aspas quando o valor tem espaço ou caractere especial, e cria o arquivo vazio', () => {
    assert.equal(upsertEnv('', { NOME: 'a b' }), 'NOME="a b"\n')
    assert.equal(upsertEnv('A=1\r\nB=2\r\n', { B: '3' }), 'A=1\nB=3\n')
  })
})
