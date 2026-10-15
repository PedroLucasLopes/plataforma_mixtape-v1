export const API_PREFIX = '/api/v1'

export const PAGE_SIZE = 20
export const SEARCH_PAGE_SIZE = 24
export const RAIL_SIZE = 12
export const LIBRARY_GRID_PAGE_SIZE = 24
export const PLAYLIST_RENDER_STEP = 50
export const WORLD_CHART_RANGE = 'week' as const
export const CHART_SIZE = 25
export const HOME_REVIEWS = 6
export const HOME_RANKING = 5
export const HOME_GENRES = 18
export const REVIEW_PREVIEW_LENGTH = 220
export const ITEM_REVIEWS_PAGE = 8
/** Outras avaliações da mesma obra na página de uma avaliação: uma por vez, trocando sozinhas. */
export const OTHER_REVIEWS_ROTATION = 8
export const REVIEW_ROTATION_MS = 10_000
export const TOP_TRACKS_PREVIEW = 10
export const RANGE_DEBOUNCE_MS = 450
export const GROUP_TOP_ITEMS = 10
/** Resultados da busca ao sugerir uma review da galera. */
export const GALERA_SEARCH_LIMIT = 8
/** Reviews da galera por página (cada uma traz a parte de cada membro; a API aceita até 12). */
export const GALERA_PAGE_SIZE = 6
/** Reviews da galera no perfil. */
export const PROFILE_GALERA = 4

export const SESSION = {
  header: 'X-Session-Transport',
  transport: 'cookie',
  refreshMarginMs: 60_000,
  lockName: 'mixtape-session-refresh',
  channel: 'mixtape-session',
  hintKey: 'mx.session',
} as const

export const CATALOG_RETRY = {
  attempts: 2,
  maxWaitSeconds: 6,
} as const

/** Favoritos do perfil: espelho do `FAVORITES_LIMIT` da API (álbuns e músicas). */
export const FAVORITES_LIMIT = 10
/** Resultados da busca no editor de favoritos. */
export const FAVORITES_SEARCH_LIMIT = 8

/** Línguas em que a API escreve os e-mails da conta (a primeira é a reserva). */
export const EMAIL_LOCALES = ['pt-BR', 'en', 'es'] as const

/** Espera entre dois pedidos de link de redefinição na mesma tela (a API ainda tem a cota por conta). */
export const PASSWORD_RESET_RESEND_SECONDS = 60

/** O mesmo para o link de exclusão da conta. */
export const ACCOUNT_DELETION_RESEND_SECONDS = 60

export const QR_CODE_SIZE = 512

export function qrCodePath (username: string, format: 'png' | 'svg') {
  return `${API_PREFIX}/users/${encodeURIComponent(username)}/qrcode?format=${format}&size=${QR_CODE_SIZE}`
}
