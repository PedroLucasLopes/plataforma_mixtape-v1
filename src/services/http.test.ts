import { beforeAll, describe, expect, it } from 'vitest'
import { i18n } from '@/plugins/i18n'
import { buildUrl, describeError } from './http'

beforeAll(() => {
  i18n.global.locale.value = 'pt-BR'
})

describe('montagem de URL da API', () => {
  it('ignora parâmetros vazios e mantém zero e false', () => {
    expect(buildUrl('/rankings', { category: 'overall', period: null, page: 0, withText: false, q: '', limit: undefined }))
      .toBe('/api/v1/rankings?category=overall&page=0&withText=false')
  })

  it('não põe interrogação sem parâmetros', () => {
    expect(buildUrl('/genres')).toBe('/api/v1/genres')
  })
})

describe('mensagens de erro', () => {
  it('traduz pelo código estável da API, nunca pela mensagem do servidor', () => {
    expect(describeError(404, 'ALBUM_NOT_FOUND')).toBe('Álbum não encontrado no catálogo.')
    expect(describeError(422, 'UNDERAGE', { minAge: 13 })).toBe('É preciso ter pelo menos 13 anos para criar uma conta.')
  })

  it('mostra o que trocar no texto barrado e quanto esperar pelo próximo link', () => {
    expect(describeError(422, 'CONTENT_REJECTED', { terms: ['merda', 'porra'] }))
      .toBe('O texto tem palavras que não são permitidas aqui (merda, porra). Troque e tente de novo.')
    expect(describeError(422, 'CONTENT_REJECTED', { terms: [], reasons: ['HARASSMENT'] }))
      .toBe('O texto foi barrado pela moderação por ofensa, ódio ou ameaça. Reescreva e tente de novo.')
    expect(describeError(429, 'PASSWORD_RESET_TOO_MANY', { retryAfterSeconds: 30 }))
      .toBe('Você já pediu vários links agora há pouco. Confira a caixa de entrada (e o spam) ou tente de novo em 30 segundos.')
    expect(describeError(429, 'PASSWORD_RESET_TOO_MANY', { retryAfterSeconds: 240 }))
      .toBe('Você já pediu vários links agora há pouco. Confira a caixa de entrada (e o spam) ou tente de novo em 4 minutos.')
  })

  it('o login diz quanto esperar na conta travada e o que fazer quando o Auth0 trava', () => {
    expect(describeError(401, 'INVALID_CREDENTIALS')).toBe('E-mail, usuário ou senha incorretos.')
    expect(describeError(429, 'TOO_MANY_LOGIN_ATTEMPTS', { retryAfterSeconds: 30 }))
      .toBe('Muitas senhas erradas seguidas nesta conta. Por segurança, tente de novo em 30 segundos.')
    expect(describeError(429, 'TOO_MANY_LOGIN_ATTEMPTS', { retryAfterSeconds: 240 }))
      .toBe('Muitas senhas erradas seguidas nesta conta. Por segurança, tente de novo em 4 minutos.')
    expect(describeError(429, 'LOGIN_BLOCKED')).toContain('“Esqueceu a senha?”')
    expect(describeError(503, 'IDENTITY_PROVIDER_UNAVAILABLE')).toBe('O serviço de login está fora do ar agora. Tente de novo em alguns minutos.')
  })

  it('cai na mensagem do status quando o código é desconhecido', () => {
    expect(describeError(429, 'SOMETHING_NEW')).toBe('Muitas tentativas seguidas. Aguarde um pouco e tente de novo.')
    expect(describeError(502, null)).toBe('O Mixtape tropeçou aqui. Tente de novo em instantes.')
    expect(describeError(418, null)).toBe('Algo deu errado. Tente de novo.')
  })
})
