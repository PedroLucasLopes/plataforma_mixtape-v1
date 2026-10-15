<template>
  <div class="review-grid" data-testid="review-grid">
    <div v-if="!paged.loaded.value && paged.loading.value" aria-hidden="true" class="review-grid__skeleton">
      <MxSkeleton v-for="index in 8" :key="index" shape="square" />
    </div>

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
      <MxGrid :label="label" min="150px">
        <li v-for="(review, index) in paged.items.value" :key="review.id" v-reveal="{ variant: 'up', delay: index % 8 * 50 }">
          <article class="review-tile">
            <MxCover
              :priority="index < 4"
              :seed="review.item.id"
              sizes="(max-width: 600px) 45vw, 200px"
              :src="review.item.coverUrl"
              :title="review.item.title"
              :vinyl="review.item.type === 'ALBUM'"
            />

            <MxRating show-value size="sm" :value="review.rating" />

            <h3 class="review-tile__title">
              <RouterLink :aria-label="t('library.openReview', { title: review.item.title })" class="review-tile__link" data-testid="review-grid-link" :to="reviewRoute(review.id)">
                {{ review.item.title }}
              </RouterLink>
            </h3>

            <p v-if="review.item.artistName" class="review-tile__artist">{{ review.item.artistName }}</p>

            <span v-if="review.body" class="review-tile__written">
              <VIcon aria-hidden="true" icon="mdi-text" size="14" />
              {{ t('library.withReview') }}
            </span>

            <span v-if="review.groupReview" class="review-tile__galera">
              <VIcon aria-hidden="true" icon="mdi-account-group" size="14" />
              {{ t('library.galera', { group: review.groupReview.group.name }) }}
            </span>

            <span v-if="review.visibility !== 'PUBLIC'" class="review-tile__lock">
              <VIcon aria-hidden="true" icon="mdi-lock-outline" size="14" />
              {{ review.visibility === 'GROUP' ? t('library.visibility.group') : t('library.visibility.private') }}
            </span>
          </article>
        </li>
      </MxGrid>

      <MxLoadMore data-testid="review-grid-load-more" :has-more="paged.hasMore.value" :loading="paged.loading.value" @load="paged.loadMore()" />
    </template>
  </div>
</template>

<script lang="ts" setup>
  import type { Page, Review } from '@/types/api'
  import { MxCover, MxEmptyState, MxErrorState, MxGrid, MxLoadMore, MxRating, MxSkeleton, vReveal } from '@pedrolucaslopes/mixtape-ui'
  import { watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { usePaged } from '@/composables/usePaged'
  import { LIBRARY_GRID_PAGE_SIZE } from '@/constants/api'
  import { useComposerStore } from '@/stores/composer'
  import { reviewRoute } from '@/utils/items'

  const props = defineProps<{
    loader: (page: number, limit: number) => Promise<Page<Review>>
    watchKey?: unknown
    label: string
    emptyTitle: string
    emptyDescription?: string
  }>()

  const { t } = useI18n()
  const composer = useComposerStore()
  const paged = usePaged<Review>((page, limit) => props.loader(page, limit), { limit: LIBRARY_GRID_PAGE_SIZE, watch: () => props.watchKey })

  watch(() => composer.version, () => void paged.reset())

  defineExpose({ reset: paged.reset })
</script>

<style scoped>
.review-grid {
  display: grid;
  gap: 16px;
}

.review-grid__skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.review-tile {
  position: relative;
  display: grid;
  gap: 8px;
  min-width: 0;
}

.review-tile__galera,
.review-tile__lock {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  gap: 4px;
  max-width: 100%;
  padding: 2px 8px;
  overflow: hidden;
  font-size: 0.75rem;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: var(--mx-radius-pill);
}

.review-tile__galera {
  color: var(--mx-on-cta);
  background: var(--mx-cta);
}

.review-tile__lock {
  color: var(--mx-on-surface-muted);
  background: var(--mx-surface-variant);
}

.review-tile :deep(.mx-cover) {
  width: 100%;
}

.review-tile__title {
  display: -webkit-box;
  margin: 2px 0 0;
  overflow: hidden;
  font-size: 0.9375rem;
  font-weight: 800;
  line-height: 1.25;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.review-tile__link {
  color: inherit;
  text-decoration: none;
}

.review-tile__link::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: var(--mx-radius-md);
}

.review-tile__link:focus-visible {
  outline: none;
}

.review-tile__link:focus-visible::after {
  outline: 3px solid var(--mx-focus);
  outline-offset: 4px;
}

.review-tile:hover .review-tile__link {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

.review-tile__artist {
  margin: -4px 0 0;
  overflow: hidden;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--mx-on-surface-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-tile__written {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  justify-self: start;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--mx-link);
}
</style>
