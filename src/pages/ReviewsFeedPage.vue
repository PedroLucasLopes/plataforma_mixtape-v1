<template>
  <div class="page" data-testid="page-reviews-feed">
    <header class="page-header">
      <p class="page-header__eyebrow">{{ t('feed.eyebrow') }}</p>
      <h1 class="page-header__title">{{ t('feed.title') }}</h1>
      <p class="page-header__lead">{{ t('feed.lead') }}</p>
    </header>

    <div class="page-columns">
      <div class="page-columns__main">
        <div class="toolbar">
          <MxSegmented
            v-model="sort"
            data-testid="page-reviews-feed-sort"
            :label="t('reviews.sortLabel')"
            :options="sortOptions"
            size="sm"
          />

          <MxSegmented
            v-if="sort === 'popular'"
            v-model="period"
            data-testid="page-reviews-feed-period"
            :label="t('filters.period')"
            :options="periodOptions"
            size="sm"
          />

          <MxChip
            data-testid="page-reviews-feed-with-text"
            icon="mdi-text-long"
            :label="t('feed.withText')"
            selectable
            :selected="withText"
            @click="withText = !withText"
          />
        </div>

        <ReviewList
          :empty-description="t('feed.emptyDescription')"
          :empty-title="t('feed.empty')"
          :loader="loadFeed"
          :watch-key="[sort, period, withText]"
        />
      </div>

      <aside class="page-columns__aside">
        <MxGlass class="panel-stack" tint="violet" variant="panel">
          <h2 class="panel-title">{{ t('feed.writeTitle') }}</h2>
          <p class="feed__write-text">{{ t('feed.writeText') }}</p>

          <ul v-if="writingRules.length > 0" class="feed__rules">
            <li v-for="rule in writingRules" :key="rule.reason">
              <VIcon aria-hidden="true" :icon="SCORE_REASON_ICONS[rule.reason] ?? 'mdi-star'" size="18" />
              <span>{{ labels.reasonLabel(rule.reason, rule.description) }}</span>
              <strong>{{ t('feed.points', { points: rule.points }) }}</strong>
            </li>
          </ul>

          <p v-if="rules.writtenReviewMinLength" class="feed__write-text">
            {{ t('feed.minLength', { count: rules.writtenReviewMinLength }) }}
          </p>

          <MxButton data-testid="page-reviews-feed-rate" icon="mdi-album" :label="t('home.hero.rate')" :to="{ name: ROUTE.search, query: { rate: '1' } }" />
        </MxGlass>

        <AdSlot placement="HOME_FEED" variant="rectangle" />
      </aside>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { FeedSort, Period } from '@/types/api'
  import type { SegmentedOption } from '@pedrolucaslopes/mixtape-ui'
  import { MxButton, MxChip, MxGlass, MxSegmented } from '@pedrolucaslopes/mixtape-ui'
  import { computed, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import AdSlot from '@/components/AdSlot.vue'
  import ReviewList from '@/components/ReviewList.vue'
  import { useLabels } from '@/composables/useLabels'
  import { usePeriod } from '@/composables/usePeriod'
  import { useSeo } from '@/composables/useSeo'
  import { FEED_SORTS, PERIODS } from '@/constants/filters'
  import { SCORE_REASON_ICONS } from '@/constants/gamification'
  import { ROUTE } from '@/router/routes'
  import { reviewsApi } from '@/services/mixtape'
  import { useRulesStore } from '@/stores/rules'
  import { queryEnum } from '@/utils/navigation'

  const WRITING_REASONS = new Set(['REVIEW_CREATED', 'REVIEW_WRITTEN', 'PIONEER_REVIEW', 'LIKE_RECEIVED'])

  const { t } = useI18n()
  const labels = useLabels()
  const route = useRoute()
  const router = useRouter()
  const rules = useRulesStore()
  const { periodOptions } = usePeriod()

  onMounted(() => void rules.load())

  function update (patch: Record<string, string | undefined>): void {
    void router.replace({ query: { ...route.query, ...patch } })
  }

  const sort = computed<FeedSort>({
    get: () => queryEnum(route.query.sort, FEED_SORTS, 'recent'),
    set: value => update({ sort: value === 'recent' ? undefined : value }),
  })

  const period = computed<Period>({
    get: () => queryEnum(route.query.period, PERIODS, 'month'),
    set: value => update({ period: value === 'month' ? undefined : value }),
  })

  const withText = computed<boolean>({
    get: () => route.query.text === '1',
    set: value => update({ text: value ? '1' : undefined }),
  })

  const sortOptions = computed<SegmentedOption<FeedSort>[]>(() => FEED_SORTS.map(value => ({
    value,
    label: t(`feed.sorts.${value}`),
    icon: value === 'recent' ? 'mdi-clock-outline' : 'mdi-fire',
  })))

  const writingRules = computed(() => (rules.rules?.scoring ?? []).filter(rule => WRITING_REASONS.has(rule.reason)))

  function loadFeed (page: number, limit: number) {
    return reviewsApi.feed(sort.value, sort.value === 'popular' ? period.value : null, withText.value, { page, limit })
  }

  useSeo(() => ({ title: t('feed.title'), description: t('feed.lead') }))
</script>

<style scoped>
.feed__write-text {
  margin: 0;
  line-height: 1.5;
}

.feed__rules {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.feed__rules li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  font-size: 0.9375rem;
}
</style>
