export const RECENT_SEARCHES = {
  key: 'mx.recent-searches',
  limit: 8,
} as const

/**
 * Recarga depois de um deploy (chunk antigo que sumiu). Uma por janela: se o arquivo continuar
 * faltando, o erro aparece em vez de um laço de recargas.
 */
export const DEPLOY_RELOAD = {
  key: 'mx.deploy-reload',
  windowMs: 30_000,
} as const
