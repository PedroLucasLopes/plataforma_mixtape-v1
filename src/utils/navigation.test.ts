import { describe, expect, it } from 'vitest'
import { queryEnum, queryNumber, queryString, safeRedirect } from './navigation'

describe('redirecionamento depois do login', () => {
  it('aceita só caminhos internos', () => {
    expect(safeRedirect('/u/ana.souza')).toBe('/u/ana.souza')
    expect(safeRedirect(['/charts', '/x'])).toBe('/charts')
  })

  it('recusa endereços externos e as próprias telas de entrada', () => {
    expect(safeRedirect('https://exemplo.com')).toBeNull()
    expect(safeRedirect('//exemplo.com')).toBeNull()
    expect(safeRedirect(String.raw`/\exemplo.com`)).toBeNull()
    expect(safeRedirect('/login?redirect=/x')).toBeNull()
    expect(safeRedirect('/register')).toBeNull()
    expect(safeRedirect(undefined)).toBeNull()
  })

  it('recusa tabulação, quebra de linha e barra invertida, que o navegador apaga ou troca por /', () => {
    expect(safeRedirect('/\t/exemplo.com')).toBeNull()
    expect(safeRedirect('/\n/exemplo.com')).toBeNull()
    expect(safeRedirect(String.raw`/u/ana\..\exemplo`)).toBeNull()
    expect(safeRedirect('/u/ana%2F%2Fx')).toBe('/u/ana%2F%2Fx')
  })
})

describe('leitura da query string', () => {
  it('lê texto, número e opções conhecidas', () => {
    expect(queryString(['rock', 'pop'])).toBe('rock')
    expect(queryString('')).toBeNull()
    expect(queryNumber('3.5')).toBe(3.5)
    expect(queryNumber('abc', 0)).toBe(0)
    expect(queryEnum('tracks', ['albums', 'tracks'] as const, 'albums')).toBe('tracks')
    expect(queryEnum('podcasts', ['albums', 'tracks'] as const, 'albums')).toBe('albums')
  })
})
