<template>
  <div class="page charts" data-testid="page-charts">
    <header class="page-header">
      <p class="page-header__eyebrow">{{ t('charts.eyebrow') }}</p>
      <h1 class="page-header__title">{{ t('charts.title') }}</h1>
      <p class="page-header__lead">{{ source === 'world' ? t('charts.leadWorld') : t('charts.leadMixtape') }}</p>
    </header>

    <div class="charts__controls">
      <MxSegmented
        v-model="source"
        block
        data-testid="page-charts-source"
        :label="t('charts.sourceLabel')"
        :options="sourceOptions"
      />

      <div class="toolbar">
        <MxSegmented
          v-model="kind"
          data-testid="page-charts-kind"
          :label="t('charts.kindLabel')"
          :options="kindOptions"
          size="sm"
        />

        <MxSegmented
          v-model="range"
          data-testid="page-charts-period"
          :label="t('filters.period')"
          :options="periodOptions"
          size="sm"
        />
      </div>
    </div>

    <p aria-live="polite" class="mx-sr-only">{{ liveMessage }}</p>

    <div v-if="chart.loading.value && !chart.data.value" aria-hidden="true" class="charts__skeleton">
      <MxSkeleton v-for="index in 3" :key="index" shape="square" />
    </div>

    <MxEmptyState
      v-else-if="chart.errorCode.value === 'CHARTS_DISABLED'"
      :description="t('charts.disabledDescription')"
      duotone="navy"
      icon="mdi-chart-box-outline"
      :title="t('charts.disabled')"
    />

    <MxErrorState v-else-if="chart.error.value" :description="chart.error.value" :retrying="chart.loading.value" @retry="chart.reload()" />

    <MxEmptyState
      v-else-if="entries.length === 0"
      :description="source === 'mixtape' ? t('charts.emptyMixtapeDescription') : t('charts.emptyDescription')"
      duotone="orange"
      icon="mdi-chart-bell-curve"
      :title="t('charts.empty')"
    >
      <MxButton
        v-if="source === 'mixtape'"
        data-testid="page-charts-rate"
        icon="mdi-album"
        :label="t('home.hero.rate')"
        :to="{ name: ROUTE.search, query: { rate: '1' } }"
      />
    </MxEmptyState>

    <template v-else>
      <ol :aria-label="t('charts.top3')" class="charts__podium" data-testid="page-charts-podium">
        <li
          v-for="(entry, index) in entries.slice(0, 3)"
          :key="entry.key"
          v-reveal="{ variant: 'up', delay: PODIUM_REVEAL_DELAY[index] }"
          class="charts__place"
          :class="`charts__place--${index + 1}`"
          :data-testid="`page-charts-place-${index + 1}`"
          :style="placeStyle(index)"
        >
          <div class="charts__float">
            <MxStarburst
              v-if="index === 0"
              aria-hidden="true"
              class="charts__burst"
              color="var(--top-ink)"
              ink="var(--top-bg)"
              outline
              :points="PODIUM_BURST.points"
              shape="sun"
              :size="PODIUM_BURST.size"
              spin
            />

            <div class="charts__place-card" data-testid="page-charts-place-card">
              <MxItemCard
                v-bind="entry.card"
                :heading-level="2"
                :listeners="entry.listeners"
                :meta="entry.meta ?? entry.card.meta"
                :position="entry.position"
                :priority="index === 0"
                :rating="entry.rating"
              />

              <p v-if="entry.stat" class="charts__top-stat">{{ entry.stat }}</p>
            </div>
          </div>
        </li>
      </ol>

      <ol :aria-label="t('charts.rest')" class="charts__rows" data-testid="page-charts-rows" :start="4">
        <li
          v-for="(entry, index) in entries.slice(3)"
          :key="entry.key"
          v-reveal="{ variant: 'left', delay: index % 10 * 35 }"
          data-testid="page-charts-row"
        >
          <MxItemCard
            v-bind="entry.card"
            :heading-level="3"
            layout="row"
            :listeners="entry.listeners"
            :meta="entry.meta ?? entry.card.meta"
            :position="entry.position"
            :rating="entry.rating"
          >
            <template #actions>
              <span v-if="entry.stat" class="charts__row-stat">{{ entry.stat }}</span>
            </template>
          </MxItemCard>
        </li>
      </ol>
    </template>

    <p class="charts__source muted">
      <VIcon aria-hidden="true" :icon="source === 'world' ? 'mdi-earth' : 'mdi-album'" size="18" />

      <span v-if="source === 'world'">
        {{ t('charts.sourceWorld') }}
        <a
          class="link-strong"
          data-testid="page-charts-listenbrainz"
          :href="LISTENBRAINZ_URL"
          rel="noopener noreferrer"
          target="_blank"
        >ListenBrainz</a>
      </span>

      <span v-else>{{ t('charts.sourceMixtape') }}</span>
    </p>
  </div>
</template>

<script lang="ts" setup>
  import type { CatalogKind, Period } from '@/types/api'
  import type { SegmentedOption } from '@pedrolucaslopes/mixtape-ui'
  import {
    duotones,
    formatNumber,
    formatRatingValue,
    MxButton,
    MxEmptyState,
    MxErrorState,
    MxItemCard,
    MxSegmented,
    MxSkeleton,
    MxStarburst,
    vReveal,
  } from '@pedrolucaslopes/mixtape-ui'
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import { useAsyncData } from '@/composables/useAsyncData'
  import { type CatalogCard, useCatalogCards } from '@/composables/useCatalogCards'
  import { useLabels } from '@/composables/useLabels'
  import { usePeriod } from '@/composables/usePeriod'
  import { useSeo } from '@/composables/useSeo'
  import { CHART_SIZE } from '@/constants/api'
  import { CHART_PODIUM, PODIUM_BURST, PODIUM_REVEAL_DELAY } from '@/constants/catalog'
  import { CATALOG_KIND_ICONS, CATALOG_KINDS, CHART_SOURCES, type ChartSource, PERIODS } from '@/constants/filters'
  import { LISTENBRAINZ_URL } from '@/constants/sources'
  import { ROUTE } from '@/router/routes'
  import { catalogApi, reviewsApi } from '@/services/mixtape'
  import { queryEnum } from '@/utils/navigation'

  interface ChartRow {
    key: string
    position: number
    card: CatalogCard
    listeners: number | null
    rating: number | null
    meta: string | null
    stat: string | null
  }

  const { t, locale } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const cards = useCatalogCards()
  const labels = useLabels()
  const { periodOptions } = usePeriod()

  function queryModel<T extends string> (key: string, allowed: readonly T[], fallback: T) {
    return computed<T>({
      get: () => queryEnum(route.query[key], allowed, fallback),
      set: value => {
        void router.replace({ query: { ...route.query, [key]: value === fallback ? undefined : value } })
      },
    })
  }

  const source = queryModel<ChartSource>('source', CHART_SOURCES, 'world')
  const rawKind = queryModel<CatalogKind>('kind', CATALOG_KINDS, 'albums')
  const range = queryModel<Period>('range', PERIODS, 'week')

  const kind = computed<CatalogKind>({
    get: () => (source.value === 'mixtape' && rawKind.value === 'artists' ? 'albums' : rawKind.value),
    set: value => {
      rawKind.value = value
    },
  })

  const selection = computed<string>(previous => route.name === ROUTE.charts
    ? [source.value, kind.value, range.value].join('|')
    : previous ?? '')

  const sourceOptions = computed<SegmentedOption<ChartSource>[]>(() => [
    { value: 'world', label: t('charts.sources.world'), icon: 'mdi-earth' },
    { value: 'mixtape', label: t('charts.sources.mixtape'), icon: 'mdi-album' },
  ])

  const kindOptions = computed<SegmentedOption<CatalogKind>[]>(() => CATALOG_KINDS
    .filter(value => source.value === 'world' || value !== 'artists')
    .map(value => ({ value, label: t(`search.kinds.${value}`), icon: CATALOG_KIND_ICONS[value] })))

  const chart = useAsyncData<ChartRow[]>(async signal => {
    if (source.value === 'mixtape') {
      const type = kind.value === 'tracks' ? 'TRACK' : 'ALBUM'
      const items = await reviewsApi.trending(type, range.value, CHART_SIZE, signal)
      return items.map((entry, index) => ({
        key: entry.item.id,
        position: index + 1,
        card: cards.summary(entry.item),
        listeners: null,
        rating: entry.averageRating ?? null,
        meta: null,
        stat: entry.averageRating === null
          ? t('home.trending.meta', { count: entry.reviewsCount, formatted: formatNumber(entry.reviewsCount, locale.value) })
          : t('charts.ratingStat', { rating: formatRatingValue(entry.averageRating, locale.value), count: entry.reviewsCount, formatted: formatNumber(entry.reviewsCount, locale.value) }),
      }))
    }
    if (kind.value === 'tracks') {
      const items = await catalogApi.trackChart(range.value, CHART_SIZE, signal)
      return items.map(entry => ({ key: entry.item.id, position: entry.position, card: cards.track(entry.item), listeners: null, rating: null, meta: null, stat: labels.chartListeners(entry) }))
    }
    if (kind.value === 'artists') {
      const items = await catalogApi.artistChart(range.value, CHART_SIZE, signal)
      return items.map(entry => ({ key: entry.item.id, position: entry.position, card: cards.artist(entry.item), listeners: null, rating: null, meta: null, stat: labels.chartListeners(entry) }))
    }
    const items = await catalogApi.albumChart(range.value, CHART_SIZE, signal)
    return items.map(entry => ({ key: entry.item.id, position: entry.position, card: cards.album(entry.item), listeners: null, rating: null, meta: null, stat: labels.chartListeners(entry) }))
  }, { watch: selection, resetOnChange: true })

  const entries = computed(() => chart.data.value ?? [])

  const liveMessage = computed(() => (chart.loading.value ? t('common.loading') : t('charts.loaded', { count: entries.value.length })))

  function placeStyle (index: number) {
    const colors = duotones[CHART_PODIUM[index] ?? CHART_PODIUM.at(-1)!]
    return {
      '--top-bg': colors.background,
      '--top-ink': colors.ink,
      '--top-accent': colors.accent,
    }
  }

  useSeo(() => ({
    title: t('charts.seoTitle'),
    description: source.value === 'world' ? t('charts.leadWorld') : t('charts.leadMixtape'),
  }))
</script>

<style scoped>
.charts__controls {
  display: grid;
  gap: 12px;
  max-width: 760px;
}

.charts__skeleton,
.charts__podium {
  --lift-first: clamp(44px, 7vw, 96px);
  --lift-second: clamp(20px, 3.4vw, 46px);
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr) minmax(0, 1fr);
  align-items: end;
  gap: clamp(10px, 2.4vw, 28px);
  width: min(100%, 920px);
  margin: 0 auto;
  padding: clamp(28px, 6vw, 72px) 0 0;
  list-style: none;
}

.charts__skeleton > :nth-child(1) {
  margin-bottom: var(--lift-second);
}

.charts__skeleton > :nth-child(2) {
  margin-bottom: var(--lift-first);
}

.charts__place {
  display: grid;
  grid-row: 1;
  justify-items: center;
  min-width: 0;
  padding-bottom: var(--lift);
}

.charts__place--1 {
  --lift: var(--lift-first);
  --float-duration: 6s;
  --float-delay: 0s;
  grid-column: 2;
}

.charts__place--2 {
  --lift: var(--lift-second);
  --float-duration: 6.8s;
  --float-delay: -2.3s;
  grid-column: 1;
}

.charts__place--3 {
  --lift: 0px;
  --float-duration: 6.4s;
  --float-delay: -4.1s;
  grid-column: 3;
}

.charts__float {
  position: relative;
  width: 100%;
  animation: charts-float var(--float-duration) ease-in-out var(--float-delay) infinite;
}

.charts__float > .charts__burst {
  position: absolute;
  top: 0;
  left: 50%;
  z-index: 0;
  height: auto !important;
  aspect-ratio: 1;
  translate: -50% -14%;
  pointer-events: none;
}

.charts__place-card {
  position: relative;
  z-index: 1;
  display: grid;
  align-content: start;
  gap: 10px;
  padding: clamp(10px, 2vw, 22px);
  color: var(--top-ink);
  background: var(--top-bg);
  border-radius: var(--mx-radius-xl);
}

.charts__place-card :deep(.mx-item-card) {
  color: inherit;
}

.charts__place-card :deep(.mx-item-card__subtitle),
.charts__place-card :deep(.mx-item-card__meta) {
  color: inherit;
  opacity: 0.85;
}

.charts__place--1 .charts__place-card :deep(.mx-item-card__position) {
  -webkit-text-stroke-color: var(--top-ink);
}

.charts__place--3 .charts__place-card :deep(.mx-item-card__position) {
  right: -0.08em;
  left: auto;
}

.charts__top-stat {
  margin: 0;
  font-family: var(--mx-font-display);
  font-size: clamp(0.875rem, 2.4vw, 1.25rem);
  font-weight: 800;
  letter-spacing: var(--mx-tracking-title);
  overflow-wrap: anywhere;
}

@keyframes charts-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-14px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .charts__float {
    animation: none;
  }
}

.charts__rows {
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.charts__row-stat {
  font-size: 0.875rem;
  font-weight: 800;
  white-space: nowrap;
  color: var(--mx-on-surface-muted);
}

.charts__source {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 0.875rem;
}
</style>
