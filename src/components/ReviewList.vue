<template>
  <div class="review-list" data-testid="review-list">
    <div v-if="!paged.loaded.value && paged.loading.value" aria-hidden="true" class="review-list__skeletons">
      <MxSkeleton v-for="index in skeletons" :key="index" height="168px" />
    </div>

    <MxErrorState
      v-else-if="paged.error.value && paged.items.value.length === 0"
      compact
      :description="paged.error.value"
      @retry="paged.reset()"
    />

    <MxEmptyState
      v-else-if="paged.loaded.value && paged.items.value.length === 0"
      compact
      :description="emptyDescription"
      :heading-level="3"
      icon="mdi-message-text-outline"
      :title="emptyTitle ?? t('reviews.empty')"
    >
      <slot name="empty" />
    </MxEmptyState>

    <ul v-else class="review-list__items">
      <li v-for="(review, index) in paged.items.value" :key="review.id" v-reveal="{ delay: (index % 6) * 60 }">
        <ReviewItem
          :highlight="review.id === highlightId"
          :pending="likes.isPending(review.id)"
          :review="review"
          :variant="variant"
          @delete="pendingDelete = review"
          @like="like(review, $event)"
        />
      </li>
    </ul>

    <MxLoadMore
      v-if="paginate && paged.loaded.value && paged.items.value.length > 0"
      data-testid="review-list-load-more"
      :has-more="paged.hasMore.value"
      :loading="paged.loading.value"
      @load="paged.loadMore()"
    />

    <MxConfirmDialog
      :confirm-label="t('review.delete')"
      data-testid="review-list-delete-confirm"
      destructive
      :error="deleteError"
      :loading="deleting"
      :message="t('review.deleteMessage')"
      :model-value="pendingDelete !== null"
      :title="t('review.deleteTitle')"
      @confirm="confirmDelete"
      @update:model-value="value => { if (!value) pendingDelete = null }"
    />
  </div>
</template>

<script lang="ts" setup>
  import type { Page, Review } from '@/types/api'
  import { MxConfirmDialog, MxEmptyState, MxErrorState, MxLoadMore, MxSkeleton, toast, vReveal } from '@pedrolucaslopes/mixtape-ui'
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import ReviewItem from '@/components/ReviewItem.vue'
  import { useLikes } from '@/composables/useLikes'
  import { usePaged } from '@/composables/usePaged'
  import { errorMessage } from '@/services/http'
  import { reviewsApi } from '@/services/mixtape'
  import { useComposerStore } from '@/stores/composer'

  const props = withDefaults(defineProps<{
    loader: (page: number, limit: number) => Promise<Page<Review>>
    watchKey?: unknown
    variant?: 'feed' | 'item' | 'full' | 'compact'
    emptyTitle?: string
    emptyDescription?: string
    highlightId?: string | null
    skeletons?: number
    limit?: number
    paginate?: boolean
  }>(), { variant: 'feed', highlightId: null, skeletons: 3, limit: 10, paginate: true })

  const emit = defineEmits<{ changed: [] }>()

  const { t } = useI18n()
  const composer = useComposerStore()
  const paged = usePaged<Review>((page, limit) => props.loader(page, limit), { limit: props.limit, watch: () => props.watchKey })
  const likes = useLikes<Review>()

  const pendingDelete = ref<Review | null>(null)
  const deleting = ref(false)
  const deleteError = ref<string | null>(null)

  watch(() => composer.version, () => void paged.reset())

  function like (review: Review, liked: boolean): void {
    void likes.toggle(review, liked, next => paged.replace(item => item.id === review.id, next))
  }

  async function confirmDelete (): Promise<void> {
    const target = pendingDelete.value
    if (!target) return
    deleting.value = true
    deleteError.value = null
    try {
      await reviewsApi.remove(target.id)
      paged.replace(item => item.id === target.id, null)
      pendingDelete.value = null
      toast.success(t('review.deleted'))
      emit('changed')
    } catch (error) {
      deleteError.value = errorMessage(error)
    } finally {
      deleting.value = false
    }
  }

  defineExpose({ reset: paged.reset })
</script>

<style scoped>
.review-list {
  display: grid;
  gap: 16px;
}

.review-list__skeletons,
.review-list__items {
  display: grid;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
