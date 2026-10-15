<template>
  <div class="galera-list" data-testid="group-review-list">
    <div v-if="!paged.loaded.value && paged.loading.value" aria-hidden="true" class="galera-list__skeletons">
      <MxSkeleton v-for="index in skeletons" :key="index" height="260px" />
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
      duotone="lime"
      :heading-level="3"
      icon="mdi-account-group"
      :title="emptyTitle"
    >
      <slot name="empty" />
    </MxEmptyState>

    <ul v-else class="galera-list__items">
      <li v-for="(groupReview, index) in paged.items.value" :key="groupReview.id" v-reveal="{ delay: (index % 4) * 70 }">
        <MxGroupReviewCard v-bind="galera.cardProps(groupReview)" @like="(entryId, liked) => like(groupReview, entryId, liked)">
          <template v-if="groupReview.viewer?.isMember" #actions>
            <MxButton
              v-if="!groupReview.viewer.existingReview?.inOtherGroupReview"
              data-testid="group-review-list-edit-mine"
              :icon="groupReview.viewer.entryId ? 'mdi-pencil' : 'mdi-album'"
              :label="groupReview.viewer.entryId ? t('galera.editMine') : t('galera.rateMine')"
              size="sm"
              @click="galera.contribute(groupReview)"
            />

            <span v-else class="galera-list__blocked">{{ t('galera.inOtherGroup') }}</span>

            <MxButton
              v-if="groupReview.viewer.canCancel"
              data-testid="group-review-list-cancel"
              icon="mdi-close"
              :label="t('galera.cancel')"
              size="sm"
              variant="ghost"
              @click="pendingCancel = groupReview"
            />
          </template>
        </MxGroupReviewCard>
      </li>
    </ul>

    <MxLoadMore
      v-if="paged.loaded.value && paged.items.value.length > 0"
      data-testid="group-review-list-load-more"
      :has-more="paged.hasMore.value"
      :loading="paged.loading.value"
      @load="paged.loadMore()"
    />

    <MxConfirmDialog
      :confirm-label="t('galera.cancel')"
      data-testid="group-review-list-cancel-confirm"
      destructive
      :error="cancelError"
      :loading="cancelling"
      :message="t('galera.cancelMessage', { title: pendingCancel?.item.title ?? '' })"
      :model-value="pendingCancel !== null"
      :title="t('galera.cancelTitle')"
      @confirm="cancel"
      @update:model-value="value => { if (!value) pendingCancel = null }"
    />
  </div>
</template>

<script lang="ts" setup>
  import type { GroupReview, Page, Review } from '@/types/api'
  import { MxButton, MxConfirmDialog, MxEmptyState, MxErrorState, MxGroupReviewCard, MxLoadMore, MxSkeleton, toast, vReveal } from '@pedrolucaslopes/mixtape-ui'
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useGroupReviewCards, withEntry } from '@/composables/useGroupReviewCards'
  import { usePaged } from '@/composables/usePaged'
  import { GALERA_PAGE_SIZE } from '@/constants/api'
  import { errorMessage } from '@/services/http'
  import { groupReviewsApi } from '@/services/mixtape'
  import { useComposerStore } from '@/stores/composer'

  const props = withDefaults(defineProps<{
    loader: (page: number, limit: number) => Promise<Page<GroupReview>>
    watchKey?: unknown
    emptyTitle: string
    emptyDescription?: string
    limit?: number
    skeletons?: number
  }>(), { limit: GALERA_PAGE_SIZE, skeletons: 2 })

  const { t } = useI18n()
  const composer = useComposerStore()
  const galera = useGroupReviewCards()
  const paged = usePaged<GroupReview>((page, limit) => props.loader(page, limit), { limit: props.limit, watch: () => props.watchKey })

  const pendingCancel = ref<GroupReview | null>(null)
  const cancelling = ref(false)
  const cancelError = ref<string | null>(null)

  watch(() => composer.version, () => {
    const saved = composer.savedGroupReview
    if (saved && paged.items.value.some(item => item.id === saved.id)) {
      paged.replace(item => item.id === saved.id, saved)
      return
    }
    void paged.reset()
  })

  function like (groupReview: GroupReview, entryId: string, liked: boolean): void {
    galera.like(groupReview, entryId, liked, (entry: Review) => {
      const current = paged.items.value.find(item => item.id === groupReview.id)
      if (current) paged.replace(item => item.id === groupReview.id, withEntry(current, entry))
    })
  }

  async function cancel (): Promise<void> {
    const target = pendingCancel.value
    if (!target) return
    cancelling.value = true
    cancelError.value = null
    try {
      await groupReviewsApi.cancel(target.id)
      paged.replace(item => item.id === target.id, null)
      pendingCancel.value = null
      toast.success(t('galera.cancelled'))
    } catch (error) {
      cancelError.value = errorMessage(error)
    } finally {
      cancelling.value = false
    }
  }

  defineExpose({ reset: paged.reset })
</script>

<style scoped>
.galera-list {
  display: grid;
  gap: 16px;
}

.galera-list__skeletons,
.galera-list__items {
  display: grid;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.galera-list__blocked {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--mx-on-surface-muted);
}
</style>
