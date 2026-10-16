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

export const DISCOGRAPHY_GRID = { rows: 2, minItemWidth: 160 } as const

export const CHART_PODIUM = ['lime', 'violet', 'pink'] as const

export const PODIUM_BURST = { points: 26, size: '132%' } as const

export const PODIUM_REVEAL_DELAY = [420, 210, 0] as const

export const LIBRARY_STACK_STAGGER = { stepMs: 45, maxSteps: 6 } as const

export const MILLISECONDS_PER_HOUR = 3_600_000

export const LISTENERS_SOURCE = 'ListenBrainz'

export const DISCOVER_ALBUMS = 10

export const DISCOVER_DUOTONE: DuotoneName = 'violet'

export const DISCOVER_STACK_DEPTH = 6
