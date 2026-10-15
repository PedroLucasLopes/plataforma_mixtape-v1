import { describe, expect, it } from 'vitest'
import { closedMonths, monthKey, rotateDaily } from './periods'

describe('rodízio diário dos estilos', () => {
  it('muda quem vem primeiro a cada dia e repete no mesmo dia', () => {
    const genres = ['mpb', 'samba', 'rock']
    const day = new Date(Date.UTC(2026, 9, 7, 9))
    const sameDay = new Date(Date.UTC(2026, 9, 7, 22))
    const nextDay = new Date(Date.UTC(2026, 9, 8, 9))
    expect(rotateDaily(genres, day)).toEqual(rotateDaily(genres, sameDay))
    expect(rotateDaily(genres, nextDay)[0]).not.toBe(rotateDaily(genres, day)[0])
    expect(rotateDaily(genres, day).toSorted()).toEqual(genres.toSorted())
    expect(rotateDaily([], day)).toEqual([])
  })
})

describe('meses encerrados para os Awards', () => {
  it('começa no mês anterior e atravessa a virada do ano', () => {
    const today = new Date(Date.UTC(2026, 1, 15))
    expect(closedMonths(3, today)).toEqual(['2026-01', '2025-12', '2025-11'])
  })

  it('formata a chave do mês com dois dígitos', () => {
    expect(monthKey(new Date(Date.UTC(2026, 8, 1)))).toBe('2026-09')
  })
})
