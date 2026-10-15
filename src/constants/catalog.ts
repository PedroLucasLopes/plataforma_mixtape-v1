import type { DuotoneName } from '@pedrolucaslopes/mixtape-ui'

export const CREDIT_ROLE_ICONS: Readonly<Record<string, string>> = {
  'composer': 'mdi-music-clef-treble',
  'lyricist': 'mdi-feather',
  'writer': 'mdi-pencil',
  'producer': 'mdi-tune-variant',
  'engineer': 'mdi-knob',
  'audio engineer': 'mdi-knob',
  'recording engineer': 'mdi-microphone-variant',
  'mix': 'mdi-equalizer',
  'mastering': 'mdi-waveform',
  'vocal': 'mdi-microphone',
  'instrument': 'mdi-guitar-electric',
  'performer': 'mdi-account-music',
  'arranger': 'mdi-sitemap',
  'conductor': 'mdi-hand-wave',
  'orchestrator': 'mdi-violin',
  'programming': 'mdi-laptop',
  'remixer': 'mdi-rotate-3d-variant',
}

export const DEFAULT_CREDIT_ICON = 'mdi-account-star'

export const ARTIST_SOCIAL_BRANDS = ['official', 'instagram', 'x', 'twitter', 'facebook', 'tiktok', 'youtube', 'wikipedia', 'wikidata', 'lastfm', 'discogs'] as const

export const ARTIST_STREAMING_BRANDS = ['spotify', 'appleMusic', 'youtubeMusic', 'deezer', 'tidal', 'amazonMusic', 'soundcloud', 'bandcamp', 'qobuz'] as const

export const DISCOGRAPHY_TYPE_ORDER: readonly string[] = ['album', 'ep', 'single', 'broadcast', 'other']

/** Discografia do artista: duas fileiras por página; as colunas acompanham a largura (cartão de 160 px no mínimo). */
export const DISCOGRAPHY_GRID = { rows: 2, minItemWidth: 160 } as const

/**
 * Pódio das paradas (1º, 2º e 3º): o duotone do cartão. O 1º é lima, a cor de destaque da marca.
 */
export const CHART_PODIUM = ['lime', 'violet', 'pink'] as const

/**
 * Sol de espinhos que gira atrás do 1º lugar (na cor de destaque do duotone dele). O tamanho é relativo à
 * largura do cartão: maior que ele, para os espinhos aparecerem dos lados e por cima.
 */
export const PODIUM_BURST = { points: 26, size: '132%' } as const

/** O pódio entra do 3º para o 1º, como numa premiação (atraso de entrada em ms, na ordem 1º, 2º, 3º). */
export const PODIUM_REVEAL_DELAY = [420, 210, 0] as const

/**
 * De onde vem todo número de ouvintes da tela. O ListenBrainz conta só a comunidade dele, bem menor que a de um
 * Spotify: número sem a fonte parece audiência do mundo inteiro.
 */
export const LISTENERS_SOURCE = 'ListenBrainz'

/** Descubra (no meu perfil): quantos álbuns sorteados aparecem de cada vez, todos na mesma pilha. */
export const DISCOVER_ALBUMS = 10

/** O cartão do Descubra fica entre os destaques do perfil, com um duotone que os outros cartões não usam. */
export const DISCOVER_DUOTONE: DuotoneName = 'violet'

/** Bordas à mostra atrás do disco da frente, no cartão: o resto aparece ao folhear, e o cartão não cresce. */
export const DISCOVER_STACK_DEPTH = 6
