<template>
  <MxSection data-testid="item-reviews-section" :description="description" :eyebrow="t('item.reviewsEyebrow')" :title="t('item.reviewsTitle')">
    <template #actions>
      <MxSegmented
        v-model="sort"
        data-testid="item-reviews-section-sort"
        :label="t('reviews.sortLabel')"
        :options="sortOptions"
        size="sm"
      />
    </template>

    <ReviewList
      :empty-description="t('item.noReviewsDescription')"
      :empty-title="t('item.noReviews')"
      :highlight-id="highlightId"
      :limit="ITEM_REVIEWS_PAGE"
      :loader="loadReviews"
      variant="item"
      :watch-key="[type, id, sort]"
      @changed="emit('changed')"
    >
      <template #empty>
        <RateButton :target="target" />
      </template>
    </ReviewList>
  </MxSection>
</template>

<script lang="ts" setup>
  import type { ComposerTarget } from '@/stores/composer'
  import type { ItemType, ReviewSort } from '@/types/api'
  import type { SegmentedOption } from '@pedrolucaslopes/mixtape-ui'
  import { MxSection, MxSegmented } from '@pedrolucaslopes/mixtape-ui'
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import RateButton from '@/components/RateButton.vue'
  import ReviewList from '@/components/ReviewList.vue'
  import { ITEM_REVIEWS_PAGE } from '@/constants/api'
  import { REVIEW_SORTS } from '@/constants/filters'
  import { reviewsApi } from '@/services/mixtape'

  const props = defineProps<{
    type: ItemType
    id: string
    target: ComposerTarget
    description?: string
    highlightId?: string | null
  }>()

  const emit = defineEmits<{ changed: [] }>()

  const { t } = useI18n()
  const sort = ref<ReviewSort>('popular')

  function loadReviews (page: number, limit: number) {
    return reviewsApi.forItem(props.type, props.id, sort.value, { page, limit })
  }

  const sortOptions = computed<SegmentedOption<ReviewSort>[]>(() => REVIEW_SORTS.map(value => ({
    value,
    label: t(`reviews.sorts.${value}`),
  })))
</script>
