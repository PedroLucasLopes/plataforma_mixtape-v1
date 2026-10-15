<template>
  <PageState
    data-testid="page-library"
    :error="summary.error.value"
    :loading="summary.loading.value"
    :not-found="summary.notFound.value"
    :not-found-description="t('profile.notFoundDescription')"
    :not-found-title="t('profile.notFound')"
    :ready="Boolean(summary.data.value)"
    @retry="summary.reload()"
  >
    <div v-if="summary.data.value" class="page">
      <header class="library-header" :style="heroStyle">
        <RouterLink class="library-header__user" data-testid="page-library-user" :to="profileRoute(username)">
          <MxAvatar
            decorative
            :name="summary.data.value.user.fullName"
            :seed="username"
            :size="56"
            :src="summary.data.value.user.avatarUrl"
            :tier="summary.data.value.user.disc.tier"
          />

          <span>
            <strong>{{ summary.data.value.user.fullName }}</strong>
            <span>@{{ username }} · {{ labels.tierLabel(summary.data.value.user.disc.tier, summary.data.value.user.disc.label) }}</span>
          </span>
        </RouterLink>

        <h1 class="library-header__title mx-display">{{ isMe ? t('library.titleMine') : t('library.title', { name: firstName }) }}</h1>

        <div class="library-header__stats">
          <MxStat :label="t('library.stats.reviews')" :value="summary.data.value.reviewsCount" />
          <MxStat :label="t('library.stats.albums')" :value="summary.data.value.albumsCount" />
          <MxStat :label="t('library.stats.tracks')" :value="summary.data.value.tracksCount" />
          <MxStat format="rating" :label="t('library.stats.average')" :value="summary.data.value.averageRating ?? null" />
        </div>
      </header>

      <div class="page-columns">
        <div class="page-columns__main">
          <section aria-labelledby="library-filters-title" class="library-filters">
            <h2 id="library-filters-title" class="mx-sr-only">{{ t('library.filters') }}</h2>

            <div class="toolbar">
              <MxSegmented
                v-model="type"
                data-testid="page-library-type"
                :label="t('library.typeLabel')"
                :options="typeOptions"
                size="sm"
              />

              <MxSegmented
                v-model="view"
                data-testid="page-library-view"
                :label="t('library.viewLabel')"
                :options="viewOptions"
                size="sm"
              />

              <span class="toolbar__spacer" />

              <VSelect
                v-model="sort"
                class="library-filters__sort"
                data-testid="page-library-sort"
                :items="sortItems"
                :label="t('reviews.sortLabel')"
              />
            </div>

            <div class="library-filters__range">
              <span aria-hidden="true" class="library-filters__label">{{ t('library.ratingRange', { min: formatRatingValue(draftRange[0], locale), max: formatRatingValue(draftRange[1], locale) }) }}</span>

              <VRangeSlider
                v-model="draftRange"
                :aria-label="t('library.ratingRangeLabel')"
                color="primary"
                hide-details
                :max="5"
                :min="0"
                :step="0.5"
                strict
                thumb-label
              />
            </div>

            <ul v-if="summary.data.value.topGenres.length > 0" :aria-label="t('library.genreLabel')" class="chip-row">
              <li>
                <MxChip
                  data-testid="page-library-all-genres"
                  :label="t('library.allGenres')"
                  selectable
                  :selected="!genre"
                  size="sm"
                  @click="genre = null"
                />
              </li>

              <li v-for="entry in summary.data.value.topGenres" :key="entry.genre">
                <MxChip
                  data-testid="page-library-genre"
                  :label="t('library.genreCount', { genre: entry.genre, count: entry.count })"
                  selectable
                  :selected="genre === entry.genre"
                  size="sm"
                  @click="genre = genre === entry.genre ? null : entry.genre"
                />
              </li>
            </ul>

            <MxButton
              v-if="hasFilters"
              data-testid="page-library-clear-filters"
              icon="mdi-filter-remove"
              :label="t('library.clearFilters')"
              size="sm"
              variant="ghost"
              @click="clearFilters"
            />
          </section>

          <ReviewGrid
            v-if="view === 'grid'"
            :empty-description="emptyDescription"
            :empty-title="emptyTitle"
            :label="t('library.gridLabel')"
            :loader="loadLibraryStacks"
            :watch-key="[username, filters]"
          />

          <ReviewCrate
            v-else-if="view === 'crate'"
            :empty-description="emptyDescription"
            :empty-title="emptyTitle"
            :label="t('library.crateLabel')"
            :listen-later="!isMe"
            :loader="loadLibrary"
            :watch-key="[username, filters]"
          />

          <ReviewList
            v-else
            :empty-description="emptyDescription"
            :empty-title="emptyTitle"
            :limit="PAGE_SIZE"
            :loader="loadLibrary"
            :skeletons="4"
            variant="compact"
            :watch-key="[username, filters]"
          />
        </div>

        <aside class="page-columns__aside">
          <MxGlass class="panel-stack" variant="panel">
            <h2 class="panel-title">{{ t('library.distribution') }}</h2>

            <MxRatingHistogram
              :average="summary.data.value.averageRating ?? null"
              :distribution="summary.data.value.distribution"
              :title="t('library.distribution')"
              :total="summary.data.value.reviewsCount"
            />
          </MxGlass>

          <MxGlass class="panel-stack" variant="panel">
            <h2 class="panel-title">{{ t('library.topGenres') }}</h2>

            <MxBarList
              v-if="genreBars.length > 0"
              compact
              :items="genreBars"
              :label="t('library.topGenres')"
              numbered
            />

            <p v-else class="muted">{{ t('profile.noGenres') }}</p>
          </MxGlass>
        </aside>
      </div>
    </div>
  </PageState>
</template>

<script lang="ts" setup>
  import type { ItemType, ReviewSort } from '@/types/api'
  import type { BarListItem, SegmentedOption } from '@pedrolucaslopes/mixtape-ui'
  import {
    duotoneFor,
    duotones,
    formatRatingValue,
    MxAvatar,
    MxBarList,
    MxButton,
    MxChip,
    MxGlass,
    MxRatingHistogram,
    MxSegmented,
    MxStat,
  } from '@pedrolucaslopes/mixtape-ui'
  import { watchDebounced } from '@vueuse/core'
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import PageState from '@/components/PageState.vue'
  import ReviewCrate from '@/components/ReviewCrate.vue'
  import ReviewGrid from '@/components/ReviewGrid.vue'
  import ReviewList from '@/components/ReviewList.vue'
  import { useAsyncData } from '@/composables/useAsyncData'
  import { useLabels } from '@/composables/useLabels'
  import { useSeo } from '@/composables/useSeo'
  import { PAGE_SIZE, RANGE_DEBOUNCE_MS } from '@/constants/api'
  import { ITEM_TYPES, REVIEW_SORTS } from '@/constants/filters'
  import { ROUTE } from '@/router/routes'
  import { libraryApi, type LibraryFilters } from '@/services/mixtape'
  import { useComposerStore } from '@/stores/composer'
  import { useSessionStore } from '@/stores/session'
  import { profileRoute } from '@/utils/items'
  import { queryEnum, queryNumber, queryString } from '@/utils/navigation'

  const LIBRARY_VIEWS = ['grid', 'list', 'crate'] as const

  type TypeFilter = ItemType | 'ALL'
  type LibraryView = typeof LIBRARY_VIEWS[number]

  const props = defineProps<{ username: string }>()

  const { t, locale } = useI18n()
  const labels = useLabels()
  const route = useRoute()
  const router = useRouter()
  const session = useSessionStore()
  const composer = useComposerStore()

  const username = computed(() => props.username)
  const summary = useAsyncData(() => libraryApi.summary(props.username), { watch: () => [props.username, composer.version] })

  const isMe = computed(() => session.user?.username === props.username)
  const firstName = computed(() => summary.data.value?.user.fullName.split(' ', 1)[0] ?? props.username)
  const heroStyle = computed(() => {
    const colors = duotones[duotoneFor(`library-${props.username}`)]
    return { '--mx-hero-bg': colors.background, '--mx-hero-ink': colors.ink }
  })

  function update (patch: Record<string, string | undefined>): void {
    void router.replace({ query: { ...route.query, ...patch } })
  }

  const type = computed<TypeFilter>({
    get: () => queryEnum(route.query.type, [...ITEM_TYPES, 'ALL'] as const, 'ALL'),
    set: value => update({ type: value === 'ALL' ? undefined : value }),
  })

  const sort = computed<ReviewSort>({
    get: () => queryEnum(route.query.sort, REVIEW_SORTS, 'recent'),
    set: value => update({ sort: value === 'recent' ? undefined : value }),
  })

  const genre = computed<string | null>({
    get: () => queryString(route.query.genre),
    set: value => update({ genre: value ?? undefined }),
  })

  const clamp = (value: number | null, fallback: number) => (value === null ? fallback : Math.min(5, Math.max(0, Math.round(value * 2) / 2)))

  const range = computed<[number, number]>({
    get: (): [number, number] => [clamp(queryNumber(route.query.min), 0), clamp(queryNumber(route.query.max), 5)],
    set: ([min, max]) => update({ min: min > 0 ? String(min) : undefined, max: max < 5 ? String(max) : undefined }),
  })

  const draftRange = ref<[number, number]>([...range.value])

  watch(range, value => {
    if (value[0] !== draftRange.value[0] || value[1] !== draftRange.value[1]) draftRange.value = [...value]
  })

  watchDebounced(draftRange, value => {
    if (value[0] !== range.value[0] || value[1] !== range.value[1]) range.value = [value[0], value[1]]
  }, { debounce: RANGE_DEBOUNCE_MS })

  const filters = computed<LibraryFilters>(() => ({
    type: type.value === 'ALL' ? undefined : type.value,
    minRating: range.value[0] > 0 ? range.value[0] : undefined,
    maxRating: range.value[1] < 5 ? range.value[1] : undefined,
    genre: genre.value ?? undefined,
    sort: sort.value,
  }))

  const hasFilters = computed(() => type.value !== 'ALL' || range.value[0] > 0 || range.value[1] < 5 || genre.value !== null)

  const view = computed<LibraryView>({
    get: () => queryEnum(route.query.view, LIBRARY_VIEWS, 'grid'),
    set: value => update({ view: value === 'grid' ? undefined : value }),
  })

  const viewOptions = computed<SegmentedOption<LibraryView>[]>(() => [
    { value: 'grid', label: t('library.views.grid'), icon: 'mdi-view-grid-outline' },
    { value: 'list', label: t('library.views.list'), icon: 'mdi-view-agenda-outline' },
    { value: 'crate', label: t('library.views.crate'), icon: 'mdi-layers-outline' },
  ])

  const emptyTitle = computed(() => (hasFilters.value ? t('library.emptyFiltered') : t('library.empty')))
  const emptyDescription = computed(() => {
    if (hasFilters.value) return t('library.emptyFilteredDescription')
    return isMe.value ? t('library.emptyMineDescription') : t('library.emptyDescription')
  })

  const genreBars = computed<BarListItem[]>(() => (summary.data.value?.topGenres ?? []).map(entry => ({
    key: entry.genre,
    label: entry.genre,
    value: entry.count,
    to: { name: ROUTE.search, query: { q: entry.genre } },
  })))

  function loadLibrary (page: number, limit: number) {
    return libraryApi.ofUser(props.username, filters.value, { page, limit })
  }

  /** A grade empilha o álbum e as músicas dele que a pessoa também avaliou. */
  function loadLibraryStacks (page: number, limit: number) {
    return libraryApi.stacks(props.username, filters.value, { page, limit })
  }

  const typeOptions = computed<SegmentedOption<TypeFilter>[]>(() => [
    { value: 'ALL', label: t('library.types.all') },
    { value: 'ALBUM', label: t('library.types.albums'), icon: 'mdi-album' },
    { value: 'TRACK', label: t('library.types.tracks'), icon: 'mdi-music-note' },
  ])

  const sortItems = computed(() => REVIEW_SORTS.map(value => ({ value, title: t(`reviews.sorts.${value}`) })))

  function clearFilters (): void {
    update({ type: undefined, min: undefined, max: undefined, genre: undefined })
  }

  useSeo(() => {
    const value = summary.data.value
    if (!value) return { title: t('library.seoLoading'), noindex: summary.notFound.value }
    return {
      title: t('library.seoTitle', { name: value.user.fullName, username: value.user.username }),
      description: t('library.seoDescription', { name: value.user.fullName, count: value.reviewsCount }),
      image: value.user.avatarUrl,
      noindex: hasFilters.value,
    }
  })
</script>

<style scoped>
.library-header {
  display: grid;
  gap: 18px;
  padding: clamp(22px, 4vw, 44px);
  color: var(--mx-hero-ink);
  background: var(--mx-hero-bg);
  border-radius: var(--mx-radius-xl);
  animation: mx-rise var(--mx-duration-slow) var(--mx-ease-out) both;
}

.library-header__user {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  justify-self: start;
  padding: 6px 16px 6px 6px;
  color: inherit;
  text-decoration: none;
  background: color-mix(in srgb, var(--mx-hero-ink) 12%, transparent);
  border-radius: var(--mx-radius-pill);
}

.library-header__user > span {
  display: grid;
  line-height: 1.25;
}

.library-header__user > span > span {
  font-size: 0.875rem;
  opacity: 0.85;
}

.library-header__user:focus-visible {
  outline: 3px solid var(--mx-hero-ink);
  outline-offset: 2px;
}

.library-header__title {
  margin: 0;
  font-size: var(--mx-text-display-l);
}

.library-header__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 18px;
}

.library-filters {
  display: grid;
  gap: 14px;
  padding: 18px;
  background: var(--mx-surface);
  border-radius: var(--mx-radius-lg);
}

.library-filters__sort {
  min-width: 220px;
  max-width: 280px;
}

.library-filters__range {
  display: grid;
  gap: 4px;
}

.library-filters__label {
  font-size: 0.875rem;
  font-weight: 800;
}

@media (prefers-reduced-motion: reduce) {
  .library-header {
    animation: none;
  }
}
</style>
