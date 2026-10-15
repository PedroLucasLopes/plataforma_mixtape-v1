<template>
  <MxGlass class="stats-panel" data-testid="item-stats-panel" variant="panel">
    <template v-if="stats">
      <MxRatingHistogram
        :average="stats.averageRating ?? null"
        :distribution="stats.distribution"
        :highlight="stats.viewerReview?.rating ?? null"
        :title="t('item.distribution')"
        :total="stats.reviewsCount"
      />

      <p v-if="stats.reviewsCount === 0" class="stats-panel__empty">{{ t('item.noReviews') }}</p>

      <p v-else-if="stats.viewerReview" class="stats-panel__mine">
        <MxRating size="sm" :value="stats.viewerReview.rating" />
        {{ t('item.yourRating', { rating: formatRatingValue(stats.viewerReview.rating, locale) }) }}
      </p>
    </template>

    <MxSkeleton v-else height="180px" />
  </MxGlass>
</template>

<script lang="ts" setup>
  import type { ItemStats } from '@/types/api'
  import { formatRatingValue, MxGlass, MxRating, MxRatingHistogram, MxSkeleton } from '@pedrolucaslopes/mixtape-ui'
  import { useI18n } from 'vue-i18n'

  defineProps<{ stats: ItemStats | null }>()

  const { t, locale } = useI18n()
</script>

<style scoped>
.stats-panel {
  display: grid;
  gap: 14px;
}

.stats-panel__empty,
.stats-panel__mine {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-weight: 700;
  color: var(--mx-on-surface-muted);
}
</style>
