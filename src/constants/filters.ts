import type { CatalogKind, FeedSort, ItemType, Period, RankingCategory, ReviewSort, SearchKind } from '@/types/api'

export const PERIODS: readonly Period[] = ['week', 'month', 'year', 'all_time']

export const FEED_SORTS: readonly FeedSort[] = ['recent', 'popular']

export const REVIEW_SORTS: readonly ReviewSort[] = ['recent', 'popular', 'rating_desc', 'rating_asc']

export const RANKING_CATEGORIES: readonly RankingCategory[] = ['overall', 'participation', 'notoriety']

export const CATALOG_KINDS: readonly CatalogKind[] = ['albums', 'tracks', 'artists']

/** A busca acha também pessoas (pelo nome ou @usuário); no modo avaliar, só o catálogo. */
export const SEARCH_KINDS: readonly SearchKind[] = [...CATALOG_KINDS, 'people']

export const ITEM_TYPES: readonly ItemType[] = ['ALBUM', 'TRACK']

export const CHART_SOURCES = ['world', 'mixtape'] as const

export type ChartSource = typeof CHART_SOURCES[number]

export const RATING_STEPS: readonly number[] = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

export const CATALOG_KIND_ICONS: Readonly<Record<CatalogKind, string>> = {
  albums: 'mdi-album',
  tracks: 'mdi-music-note',
  artists: 'mdi-account-music',
}

export const SEARCH_KIND_ICONS: Readonly<Record<SearchKind, string>> = {
  ...CATALOG_KIND_ICONS,
  people: 'mdi-account-search',
}
