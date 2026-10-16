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
export const OTHER_REVIEWS_ROTATION = 8
export const REVIEW_ROTATION_MS = 10_000
export const TOP_TRACKS_PREVIEW = 10
export const RANGE_DEBOUNCE_MS = 450
export const GROUP_TOP_ITEMS = 10
export const GALERA_SEARCH_LIMIT = 8
export const GALERA_PAGE_SIZE = 6
export const PROFILE_GALERA = 4

export const SESSION = {
  header: 'X-Session-Transport',
  transport: 'cookie',
  refreshMarginMs: 60_000,
  lockName: 'mixtape-session-refresh',
  channel: 'mixtape-session',
  hintKey: 'mx.session',
} as const

export const HUMAN_CHECK = {
  header: 'X-Human-Check',
  waitMs: 20_000,
  languages: { 'pt-BR': 'pt-br', 'en': 'en', 'es': 'es' } as Record<string, string>,
} as const

export const CATALOG_RETRY = {
  attempts: 2,
  maxWaitSeconds: 6,
} as const

export const FAVORITE_LIMITS = { ALBUM: 5, TRACK: 5 } as const
export const FAVORITE_GROUPS = ['ALBUM', 'TRACK'] as const
export const FAVORITES_SEARCH_LIMIT = 8

export const EMAIL_LOCALES = ['pt-BR', 'en', 'es'] as const

export const PASSWORD_RESET_RESEND_SECONDS = 60

export const ACCOUNT_DELETION_RESEND_SECONDS = 60

export const QR_CODE_SIZE = 512

export function qrCodePath (username: string, format: 'png' | 'svg') {
  return `${API_PREFIX}/users/${encodeURIComponent(username)}/qrcode?format=${format}&size=${QR_CODE_SIZE}`
}
