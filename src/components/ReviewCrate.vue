<template>
  <div class="review-crate" data-testid="review-crate">
    <MxSkeleton v-if="!paged.loaded.value && paged.loading.value" aria-hidden="true" height="360px" shape="rect" />

    <MxErrorState v-else-if="paged.error.value && paged.items.value.length === 0" compact :description="paged.error.value" @retry="paged.reset()" />

    <MxEmptyState
      v-else-if="paged.loaded.value && paged.items.value.length === 0"
      compact
      :description="emptyDescription"
      :heading-level="3"
      icon="mdi-album"
      :title="emptyTitle"
    />

    <template v-else>
      <MxCrate
        data-testid="review-crate-crate"
        :label="label"
        open
        :records="records"
      >
        <template #pulled="{ record }">
          <CratePulledCard v-bind="pulledCard(record.key, record.title)" />
        </template>
      </MxCrate>

      <MxLoadMore
        :auto="false"
        data-testid="review-crate-load-more"
        :has-more="paged.hasMore.value"
        :loading="paged.loading.value"
        @load="paged.loadMore()"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
  import type { Page, Review } from '@/types/api'
  import type { CrateRecord } from '@pedrolucaslopes/mixtape-ui'
  import { MxCrate, MxEmptyState, MxErrorState, MxLoadMore, MxSkeleton, yearOf } from '@pedrolucaslopes/mixtape-ui'
  import { computed, watch } from 'vue'
  import CratePulledCard from '@/components/CratePulledCard.vue'
  import { usePaged } from '@/composables/usePaged'
  import { LIBRARY_GRID_PAGE_SIZE } from '@/constants/api'
  import { useComposerStore } from '@/stores/composer'
  import { reviewRoute } from '@/utils/items'

  const props = withDefaults(defineProps<{
    loader: (page: number, limit: number) => Promise<Page<Review>>
    watchKey?: unknown
    label: string
    emptyTitle: string
    emptyDescription?: string
    listenLater?: boolean
  }>(), { watchKey: undefined, emptyDescription: undefined, listenLater: false })

  const composer = useComposerStore()
  const paged = usePaged<Review>((page, limit) => props.loader(page, limit), { limit: LIBRARY_GRID_PAGE_SIZE, watch: () => props.watchKey })

  const records = computed<CrateRecord[]>(() => paged.items.value.map(review => ({
    key: review.id,
    title: review.item.title,
    subtitle: review.item.artistName ?? null,
    cover: review.item.coverUrl ?? null,
    seed: review.item.id,
  })))

  function pulledCard (key: string, title: string) {
    const review = paged.items.value.find(entry => entry.id === key)
    if (!review) return { id: key, kind: 'ALBUM' as const, title, listenLater: false }
    return {
      id: review.item.id,
      kind: review.item.type,
      title: review.item.title,
      subtitle: review.item.artistName ?? null,
      rating: review.rating,
      reviewTo: reviewRoute(review.id),
      cover: review.item.coverUrl ?? null,
      year: yearOf(review.item.releaseDate ?? null),
      listenLater: props.listenLater,
    }
  }

  watch(() => composer.version, () => void paged.reset())
</script>

<style scoped>
.review-crate {
  display: grid;
  gap: 16px;
  min-width: 0;
}
</style>
