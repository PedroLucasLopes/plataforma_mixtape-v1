import type { GroupReview, Review } from '@/types/api'
import type { GroupReviewEntry, ReviewGroupTag, ReviewSubject } from '@pedrolucaslopes/mixtape-ui'
import { yearOf } from '@pedrolucaslopes/mixtape-ui'
import { useComposerStore } from '@/stores/composer'
import { useSessionStore } from '@/stores/session'
import { groupReviewRoute, groupRoute, isRateable, reviewAuthor, reviewRoute, reviewSubject } from '@/utils/items'
import { useLabels } from './useLabels'
import { useLikes } from './useLikes'

export function withEntry (groupReview: GroupReview, entry: Review): GroupReview {
  return { ...groupReview, entries: groupReview.entries.map(candidate => (candidate.id === entry.id ? entry : candidate)) }
}

export function useGroupReviewCards () {
  const labels = useLabels()
  const session = useSessionStore()
  const composer = useComposerStore()
  const likes = useLikes<Review>()

  function entries (groupReview: GroupReview): GroupReviewEntry[] {
    return groupReview.entries.map(entry => ({
      id: entry.id,
      author: reviewAuthor(entry.author, labels.tierLabel(entry.author.disc.tier, entry.author.disc.label)),
      rating: entry.rating,
      body: entry.body,
      createdAt: entry.createdAt,
      likes: entry.likes,
      liked: entry.viewer?.liked ?? false,
      canLike: !(entry.viewer?.isAuthor ?? entry.author.id === session.user?.id),
      pending: likes.isPending(entry.id),
      to: reviewRoute(entry.id) as GroupReviewEntry['to'],
    }))
  }

  function cardProps (groupReview: GroupReview) {
    const isMember = groupReview.viewer?.isMember ?? false
    const group: ReviewGroupTag = {
      name: groupReview.group.name,
      to: isMember ? (groupRoute(groupReview.group.id) as ReviewGroupTag['to']) : undefined,
    }
    const item: ReviewSubject = reviewSubject(groupReview.item)
    return {
      group,
      item,
      rating: groupReview.averageRating,
      entries: entries(groupReview),
      members: groupReview.group.membersCount,
      proposer: groupReview.proposedBy?.username ?? null,
      visibility: groupReview.group.visibility === 'PUBLIC' ? 'public' as const : 'group' as const,
      to: groupReviewRoute(groupReview.id) as ReviewSubject['to'],
    }
  }

  function like (groupReview: GroupReview, entryId: string, liked: boolean, apply: (entry: Review) => void): void {
    const entry = groupReview.entries.find(candidate => candidate.id === entryId)
    if (entry) {
      void likes.toggle(entry, liked, apply)
    }
  }

  function contribute (groupReview: GroupReview): void {
    const item = groupReview.item
    if (!isRateable(item.type)) {
      return
    }
    void composer.start(
      { type: item.type, id: item.id, title: item.title, artist: item.artistName, cover: item.coverUrl, year: yearOf(item.releaseDate) },
      { id: groupReview.id, groupName: groupReview.group.name, isPublic: groupReview.group.visibility === 'PUBLIC' },
    )
  }

  return { cardProps, like, contribute }
}
