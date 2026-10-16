import type { GroupReview, ItemType, Review } from '@/types/api'
import { toast } from '@pedrolucaslopes/mixtape-ui'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { t } from '@/plugins/i18n'
import { ApiError, errorMessage } from '@/services/http'
import { gamificationApi, groupReviewsApi, reviewsApi } from '@/services/mixtape'

export interface ComposerTarget {
  type: ItemType
  id: string
  title: string
  artist?: string | null
  cover?: string | null
  year?: string | null
}

export interface ComposerGroupReview {
  id: string
  groupName: string
  isPublic: boolean
}

export interface Celebration {
  tier: string
  reviews: number
}

export const useComposerStore = defineStore('composer', () => {
  const open = ref(false)
  const target = ref<ComposerTarget | null>(null)
  const groupReview = ref<ComposerGroupReview | null>(null)
  const existing = ref<Review | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const version = ref(0)
  const changed = ref<{ type: ItemType, id: string } | null>(null)
  const celebration = ref<Celebration | null>(null)
  const savedGroupReview = ref<GroupReview | null>(null)

  const blockedByOtherGroup = computed(() => Boolean(
    groupReview.value && existing.value?.groupReview && existing.value.groupReview.id !== groupReview.value.id,
  ))

  async function start (next: ComposerTarget, context: ComposerGroupReview | null = null): Promise<void> {
    target.value = next
    groupReview.value = context
    existing.value = null
    error.value = null
    open.value = true
    loading.value = true
    try {
      existing.value = (await reviewsApi.stats(next.type, next.id)).viewerReview ?? null
    } catch {
      existing.value = null
    } finally {
      loading.value = false
    }
  }

  function notifyChange (): void {
    if (target.value) {
      changed.value = { type: target.value.type, id: target.value.id }
    }
    version.value += 1
  }

  async function write (current: ComposerTarget, rating: number, body: string | null): Promise<Review> {
    const context = groupReview.value
    if (context) {
      const saved = await groupReviewsApi.saveMine(context.id, rating, body)
      savedGroupReview.value = saved
      const mine = saved.entries.find(entry => entry.id === saved.viewer?.entryId)
      if (!mine) {
        throw new Error(t('composer.groupSaveFailed'))
      }
      return mine
    }
    return existing.value === null
      ? reviewsApi.create(current.type, current.id, rating, body)
      : reviewsApi.update(existing.value.id, rating, body)
  }

  async function save (rating: number, body: string | null): Promise<Review | null> {
    const current = target.value
    if (!current || saving.value || blockedByOtherGroup.value) {
      return null
    }
    saving.value = true
    error.value = null
    const creating = existing.value === null
    const before = creating ? await gamificationApi.myProgress().catch(() => null) : null
    try {
      const review = await write(current, rating, body)
      existing.value = review
      open.value = false
      notifyChange()
      toast.success(groupReview.value ? t('composer.groupSaved', { group: groupReview.value.groupName }) : (creating ? t('composer.created') : t('composer.updated')))
      if (before) {
        const after = await gamificationApi.myProgress().catch(() => null)
        if (after && after.disc.tier !== before.disc.tier) {
          celebration.value = { tier: after.disc.tier, reviews: after.disc.reviews }
        }
      }
      return review
    } catch (error_) {
      if (error_ instanceof ApiError && (error_.code === 'REVIEW_ALREADY_EXISTS' || error_.code === 'REVIEW_IN_OTHER_GROUP_REVIEW')) {
        existing.value = (await reviewsApi.stats(current.type, current.id).catch(() => null))?.viewerReview ?? null
      }
      error.value = errorMessage(error_)
      return null
    } finally {
      saving.value = false
    }
  }

  async function remove (): Promise<boolean> {
    if (!existing.value || saving.value) {
      return false
    }
    saving.value = true
    error.value = null
    try {
      await reviewsApi.remove(existing.value.id)
      existing.value = null
      open.value = false
      notifyChange()
      toast.success(t('composer.deleted'))
      return true
    } catch (error_) {
      error.value = errorMessage(error_)
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    open,
    target,
    groupReview,
    existing,
    loading,
    saving,
    error,
    version,
    changed,
    celebration,
    savedGroupReview,
    blockedByOtherGroup,
    start,
    save,
    remove,
  }
})
