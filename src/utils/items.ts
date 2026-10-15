import type { CoverArt, ItemSummary, ItemType, Review, UserSummary } from '@/types/api'
import type { ReviewAuthor, ReviewGroupTag, ReviewSubject, ReviewVisibility } from '@pedrolucaslopes/mixtape-ui'
import type { RouteLocationRaw } from 'vue-router'
import { yearOf } from '@pedrolucaslopes/mixtape-ui'
import { ROUTE } from '@/router/routes'

export type ItemSummaryType = ItemSummary['type']

export function itemRoute (type: ItemSummaryType | ItemType, id: string): RouteLocationRaw {
  if (type === 'TRACK') {
    return { name: ROUTE.track, params: { id } }
  }
  if (type === 'ARTIST') {
    return { name: ROUTE.artist, params: { id } }
  }
  return { name: ROUTE.album, params: { id } }
}

export const albumRoute = (id: string): RouteLocationRaw => ({ name: ROUTE.album, params: { id } })
export const trackRoute = (id: string): RouteLocationRaw => ({ name: ROUTE.track, params: { id } })
export const artistRoute = (id: string): RouteLocationRaw => ({ name: ROUTE.artist, params: { id } })
export const reviewRoute = (id: string): RouteLocationRaw => ({ name: ROUTE.review, params: { id } })
export const profileRoute = (username: string): RouteLocationRaw => ({ name: ROUTE.profile, params: { username } })
export const libraryRoute = (username: string): RouteLocationRaw => ({ name: ROUTE.library, params: { username } })
export const playlistRoute = (id: string): RouteLocationRaw => ({ name: ROUTE.playlist, params: { id } })
export const groupRoute = (id: string): RouteLocationRaw => ({ name: ROUTE.group, params: { id } })
export const groupReviewRoute = (id: string): RouteLocationRaw => ({ name: ROUTE.groupReview, params: { id } })

/** Selo da review da galera de que a avaliação faz parte (leva à página da review da galera). */
export function reviewGroupTag (review: Pick<Review, 'groupReview'>): ReviewGroupTag | null {
  const link = review.groupReview
  return link ? { name: link.group.name, to: groupReviewRoute(link.id) as ReviewGroupTag['to'] } : null
}

export function reviewVisibility (review: Pick<Review, 'visibility'>): ReviewVisibility {
  return review.visibility.toLowerCase() as ReviewVisibility
}

export function itemKind (type: ItemSummaryType): 'album' | 'track' | 'artist' {
  if (type === 'TRACK') {
    return 'track'
  }
  if (type === 'ARTIST') {
    return 'artist'
  }
  return 'album'
}

export function reviewSubject (item: ItemSummary): ReviewSubject {
  return {
    id: item.id,
    kind: itemKind(item.type),
    title: item.title,
    artist: item.artistName ?? null,
    cover: item.coverUrl ?? null,
    year: yearOf(item.releaseDate ?? null),
    to: itemRoute(item.type, item.id) as ReviewSubject['to'],
  }
}

export function reviewAuthor (user: UserSummary, tierLabel: string): ReviewAuthor {
  return {
    name: user.fullName,
    username: user.username,
    avatarUrl: user.avatarUrl ?? null,
    tier: user.disc.tier,
    tierLabel,
    to: profileRoute(user.username) as ReviewAuthor['to'],
  }
}

export function coverSources (cover: CoverArt | null | undefined) {
  return cover ? { small: cover.small, medium: cover.medium, large: cover.large } : null
}

export function isRateable (type: ItemSummaryType): type is ItemType {
  return type === 'ALBUM' || type === 'TRACK'
}
