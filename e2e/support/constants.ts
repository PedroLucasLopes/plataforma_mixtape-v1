export const E2E = {
  baseUrl: process.env.E2E_BASE_URL ?? 'http://localhost:5180',
  mailpitUrl: process.env.E2E_MAILPIT_URL ?? 'http://localhost:8025',
  channel: process.env.E2E_CHANNEL ?? 'chrome',
  testTimeout: 90_000,
  expectTimeout: 20_000,
  mailTimeoutMs: 30_000,
}

export const AUTH_STATE = 'e2e/.auth/user.json'

export const TEST_PROFILE = {
  fullName: 'Pessoa de Teste',
  birthDate: '1996-06-06',
}

export const SAMPLE = {
  album: 'b1392450-e666-3926-a536-22c65f834433',
  track: '9f9cf187-d6f9-437f-9d98-d59cdbd52757',
  artist: 'a74b1b7f-71a5-4011-9441-d0b5e4122711',
}

export const API_PATHS = {
  register: '/api/v1/auth/register',
  login: '/api/v1/auth/login',
  refresh: '/api/v1/auth/refresh',
  profile: '/api/v1/me/profile',
  progress: (username: string) => `/api/v1/users/${encodeURIComponent(username)}/progress`,
}

export const SESSION_HEADER = { 'X-Session-Transport': 'cookie' }

/**
 * Token da prova de que é uma pessoa (Turnstile) para o cadastro e o login feitos direto na API. O padrão é o token de
 * teste da Cloudflare, que só passa com as chaves de teste (pilha local); a tela resolve o desafio sozinha.
 */
export const HUMAN_CHECK_HEADER = { 'X-Human-Check': process.env.E2E_HUMAN_TOKEN ?? 'XXXX.DUMMY.TOKEN.XXXX' }

/** A dica de sessão do site (`SESSION.hintKey` em `src/constants/api.ts`): com ela, a página pede o access token. */
export const SESSION_HINT = { key: 'mx.session', value: '1' }

export const ANONYMOUS = { storageState: { cookies: [], origins: [] } }

export const IGNORED_CONSOLE_ERRORS = [/^Failed to load resource/]
