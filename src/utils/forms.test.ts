import { describe, expect, it } from 'vitest'
import {
  ageOn,
  avatarUrlProblem,
  isoDateYearsAgo,
  isPredictablePassword,
  isValidEmail,
  isValidFullName,
  isValidUsername,
  normalizeUsername,
  passwordAccepted,
  passwordChecks,
} from './forms'

const TODAY = new Date(Date.UTC(2026, 9, 6))

describe('regras de senha (iguais às da API)', () => {
  const owner = { email: 'ana.souza@exemplo.com', username: 'ana_souza', fullName: 'Ana Conceição Souza' }

  it('aceita senha com tamanho, letras e números, sem dados pessoais e sem sequência', () => {
    const checks = passwordChecks('discos2026!', owner)
    expect(checks).toEqual({ withinLength: true, mix: true, personal: true, unpredictable: true })
    expect(passwordAccepted(checks)).toBe(true)
  })

  it('recusa senha curta ou sem números', () => {
    expect(passwordChecks('curta1', owner).withinLength).toBe(false)
    expect(passwordChecks('sónumerosnão', owner).mix).toBe(false)
  })

  it('recusa senha com o usuário, o e-mail, o nome (com ou sem acento) ou o nome do site', () => {
    expect(passwordChecks('meu-ana_souza-1', owner).personal).toBe(false)
    expect(passwordChecks('x-ana.souza-2026', owner).personal).toBe(false)
    expect(passwordChecks('Conceicao2026', owner).personal).toBe(false)
    expect(passwordChecks('Mixtape2026!', owner).personal).toBe(false)
  })

  it('recusa sequência ou repetição que domina a senha, mas aceita um trecho curto numa senha longa', () => {
    expect(passwordChecks('12345678a', owner).unpredictable).toBe(false)
    expect(passwordChecks('aaaa1111', owner).unpredictable).toBe(false)
    expect(passwordChecks('zyxw9876', owner).unpredictable).toBe(false)
    expect(isPredictablePassword('Correct1234Horse!')).toBe(false)
  })

  it('não marca as regras como cumpridas com a senha vazia', () => {
    expect(passwordChecks('', owner).personal).toBe(false)
    expect(passwordChecks('', owner).unpredictable).toBe(false)
  })
})

describe('idade a partir da data de nascimento', () => {
  it('conta o aniversário só depois do dia', () => {
    expect(ageOn('2013-10-06', TODAY)).toBe(13)
    expect(ageOn('2013-10-07', TODAY)).toBe(12)
  })

  it('recusa datas inexistentes ou no futuro', () => {
    expect(ageOn('2001-02-30', TODAY)).toBeNull()
    expect(ageOn('2030-01-01', TODAY)).toBeNull()
    expect(ageOn('06/10/2001', TODAY)).toBeNull()
  })

  it('gera a data limite para o campo de nascimento', () => {
    expect(isoDateYearsAgo(13, TODAY)).toBe('2013-10-06')
  })
})

describe('validação de cadastro', () => {
  it('normaliza e valida o nome de usuário como a API', () => {
    expect(normalizeUsername(' @Ana.Souza ')).toBe('ana.souza')
    expect(isValidUsername('ana.souza')).toBe(true)
    expect(isValidUsername('ana..souza')).toBe(false)
    expect(isValidUsername('.ana')).toBe(false)
    expect(isValidUsername('an')).toBe(false)
  })

  it('valida e-mail e nome completo', () => {
    expect(isValidEmail('ana@exemplo.com')).toBe(true)
    expect(isValidEmail('ana@exemplo')).toBe(false)
    expect(isValidFullName('Ana Souza')).toBe(true)
    expect(isValidFullName('12')).toBe(false)
  })

  it('aceita avatar só em https e nos hosts que a API aceita', () => {
    expect(avatarUrlProblem('')).toBeNull()
    expect(avatarUrlProblem('https://i.imgur.com/abc.png')).toBeNull()
    expect(avatarUrlProblem('https://pt.gravatar.com/avatar/abc')).toBeNull()
    expect(avatarUrlProblem('ftp://i.imgur.com/abc.png')).toBe('url')
    expect(avatarUrlProblem('https://ana:senha@i.imgur.com/abc.png')).toBe('url')
    expect(avatarUrlProblem('javascript:alert(1)')).toBe('url')
    expect(avatarUrlProblem('https://rastreio.exemplo/pixel.gif')).toBe('host')
    expect(avatarUrlProblem('https://i.imgur.com.exemplo/abc.png')).toBe('host')
  })
})
