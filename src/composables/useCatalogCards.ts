import type { AlbumSummary, ArtistSummary, ItemSummary, TrackSummary } from '@/types/api'
import type { CoverSources, CrateRecord, ItemKind, LinkTarget } from '@pedrolucaslopes/mixtape-ui'
import { formatDuration, yearOf } from '@pedrolucaslopes/mixtape-ui'
import { useI18n } from 'vue-i18n'
import { LISTENERS_SOURCE } from '@/constants/catalog'
import { albumRoute, artistRoute, coverSources, itemKind, itemRoute, trackRoute } from '@/utils/items'
import { useLabels } from './useLabels'

export interface CatalogCard {
  kind: ItemKind
  title: string
  subtitle: string | null
  meta: string | null
  cover: string | null
  sources: CoverSources | null
  seed: string
  to: LinkTarget
  listeners: number | null
  listenersSource: string
}

/** O mesmo cartão como disco da caixa (`MxCrate`). */
export function crateRecord (key: string, card: CatalogCard): CrateRecord {
  return { key, title: card.title, subtitle: card.subtitle, cover: card.cover, sources: card.sources, seed: card.seed }
}

export interface LifeSpanLike {
  begin: string | null
  end: string | null
  ended: boolean
}

function join (parts: ReadonlyArray<string | null | undefined>) {
  const text = parts.filter(part => typeof part === 'string' && part.length > 0).join(' · ')
  return text.length > 0 ? text : null
}

export function useCatalogCards () {
  const { t } = useI18n()
  const labels = useLabels()

  function lifeSpan (span: LifeSpanLike | null | undefined): string | null {
    const begin = yearOf(span?.begin ?? null)
    const end = yearOf(span?.end ?? null)
    if (begin && end) {
      return t('catalog.lifeSpan.range', { begin, end })
    }
    if (begin && span?.ended) {
      return t('catalog.lifeSpan.ended', { begin })
    }
    if (begin) {
      return t('catalog.lifeSpan.active', { begin })
    }
    if (end) {
      return t('catalog.lifeSpan.until', { end })
    }
    return null
  }

  function album (value: AlbumSummary): CatalogCard {
    return {
      kind: 'album',
      title: value.title,
      subtitle: value.artistCredit,
      meta: join([yearOf(value.firstReleaseDate), labels.releaseType(value.primaryType, value.secondaryTypes)]),
      cover: null,
      sources: coverSources(value.cover),
      seed: value.id,
      to: albumRoute(value.id) as LinkTarget,
      listeners: value.listenerCount ?? null,
      listenersSource: LISTENERS_SOURCE,
    }
  }

  function track (value: TrackSummary): CatalogCard {
    return {
      kind: 'track',
      title: value.title,
      subtitle: value.artistCredit,
      meta: join([value.album?.title, value.durationMs ? formatDuration(value.durationMs) : null, yearOf(value.firstReleaseDate)]),
      cover: null,
      sources: coverSources(value.cover),
      seed: value.album?.id ?? value.id,
      to: trackRoute(value.id) as LinkTarget,
      listeners: value.listenerCount ?? null,
      listenersSource: LISTENERS_SOURCE,
    }
  }

  function artist (value: ArtistSummary): CatalogCard {
    return {
      kind: 'artist',
      title: value.name,
      subtitle: join([labels.artistType(value.type), labels.region(value.country)]),
      meta: join([lifeSpan(value.lifeSpan), value.disambiguation]),
      cover: null,
      sources: coverSources(value.cover),
      seed: value.id,
      to: artistRoute(value.id) as LinkTarget,
      listeners: value.listenerCount ?? null,
      listenersSource: LISTENERS_SOURCE,
    }
  }

  function summary (value: ItemSummary): CatalogCard {
    return {
      kind: itemKind(value.type),
      title: value.title,
      subtitle: value.artistName ?? null,
      meta: join([value.type === 'TRACK' ? value.albumTitle : null, yearOf(value.releaseDate)]),
      cover: value.coverUrl ?? null,
      sources: null,
      seed: value.id,
      to: itemRoute(value.type, value.id) as LinkTarget,
      listeners: null,
      listenersSource: LISTENERS_SOURCE,
    }
  }

  return { album, track, artist, summary, lifeSpan, join }
}
