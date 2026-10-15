<template>
  <div class="page search" data-testid="page-search">
    <header class="page-header">
      <p class="page-header__eyebrow">{{ rateMode ? t('search.rateEyebrow') : t('search.eyebrow') }}</p>
      <h1 class="page-header__title">{{ rateMode ? t('search.rateTitle') : t('search.title') }}</h1>
      <p class="page-header__lead">{{ rateMode ? t('search.rateLead') : t('search.lead') }}</p>
    </header>

    <div class="search__controls">
      <MxSearchField
        v-model="draft"
        autofocus
        data-testid="page-search-field"
        :label="isPeople ? t('search.people.label') : t('search.label')"
        :loading="(isPeople ? people.loading.value : paged.loading.value) && searchable"
        :maxlength="SEARCH_TEXT_LENGTH.max"
        :placeholder="placeholder"
        size="lg"
        @clear="clearSearch"
        @submit="submit"
      />

      <MxSegmented v-model="kind" data-testid="page-search-kind" :label="t('search.kindLabel')" :options="kindOptions" />
    </div>

    <MxGlass v-if="rateMode" class="search__rate-banner" tint="cta" variant="pill">
      <VIcon aria-hidden="true" icon="mdi-album" />
      <span>{{ kind === 'artists' ? t('search.rateArtistsHint') : t('search.rateHint') }}</span>

      <MxButton
        data-testid="page-search-exit-rate"
        icon="mdi-close"
        :label="t('search.exitRate')"
        size="sm"
        variant="ghost"
        @click="exitRate"
      />
    </MxGlass>

    <p aria-live="polite" class="mx-sr-only">{{ liveMessage }}</p>

    <section v-if="!searchable" aria-labelledby="search-idle-title" class="search__idle">
      <h2 id="search-idle-title" class="mx-sr-only">{{ t('search.suggestions') }}</h2>
      <p v-if="query.length > 0" class="muted">{{ t('search.tooShort', { min: SEARCH_TEXT_LENGTH.min }) }}</p>
      <p v-if="isPeople" class="muted" data-testid="page-search-people-idle">{{ t('search.people.idle') }}</p>

      <div v-if="recent.searches.value.length > 0" class="search__recent">
        <div class="toolbar">
          <h3 class="panel-title">{{ t('search.recent') }}</h3>
          <span class="toolbar__spacer" />

          <MxButton
            data-testid="page-search-clear-recent"
            :label="t('search.clearRecent')"
            size="sm"
            variant="ghost"
            @click="recent.clear()"
          />
        </div>

        <ul class="chip-row">
          <li v-for="item in recent.searches.value" :key="item" class="search__recent-item">
            <MxChip
              data-testid="page-search-recent"
              icon="mdi-history"
              :label="item"
              :to="{ name: ROUTE.search, query: { ...route.query, q: item } }"
              variant="glass"
            />

            <MxIconButton
              data-testid="page-search-forget"
              icon="mdi-close"
              :label="t('search.forget', { query: item })"
              size="sm"
              variant="ghost"
              @click="recent.forget(item)"
            />
          </li>
        </ul>
      </div>

      <MxSection
        v-if="session.isAuthenticated && !isPeople"
        :description="t('search.forYou.description')"
        :heading-level="3"
        :title="t('search.forYou.title')"
      >
        <template v-if="favoriteGenres.length > 0">
          <HomeRail
            ref="forYouRail"
            :empty="t('search.forYou.empty')"
            :error="forYou.error.value"
            :items="forYou.loaded.value ? forYou.items.value : null"
            :label="t('search.forYou.title')"
            :loading="forYou.loading.value"
            @retry="forYou.reset()"
          >
            <template #default="{ item }">
              <MxItemCard v-bind="cardFor(item)" :heading-level="4">
                <template v-if="item.kind !== 'artists'" #actions>
                  <MxIconButton
                    data-testid="page-search-for-you-rate"
                    icon="mdi-album"
                    :label="t('composer.rate')"
                    size="sm"
                    variant="cta"
                    @click="rate(item)"
                  />
                </template>
              </MxItemCard>
            </template>
          </HomeRail>

          <MxButton
            v-if="forYou.loaded.value && forYou.hasMore.value"
            class="search__more"
            data-testid="page-search-more"
            icon="mdi-plus"
            :label="t('search.forYou.more')"
            :loading="forYou.loading.value"
            size="sm"
            variant="ghost"
            @click="moreSuggestions"
          />
        </template>

        <div v-else class="search__cta">
          <p class="muted">{{ t('search.forYou.noGenres') }}</p>

          <MxButton
            data-testid="page-search-pick-genres"
            icon="mdi-tune"
            :label="t('search.forYou.pickGenres')"
            size="sm"
            :to="{ name: ROUTE.settings }"
            variant="glass"
          />
        </div>
      </MxSection>

      <MxSection v-if="!isPeople" :description="t(`search.world.description.${catalogKind}`)" :heading-level="3" :title="t('search.world.title')">
        <HomeRail
          :empty="t('search.world.empty')"
          :error="world.error.value"
          :items="world.data.value"
          :label="t('search.world.title')"
          :loading="world.loading.value"
          @retry="world.reload()"
        >
          <template #default="{ item }">
            <MxItemCard v-bind="cardFor(item)" :heading-level="4">
              <template v-if="item.kind !== 'artists'" #actions>
                <MxIconButton
                  data-testid="page-search-world-rate"
                  icon="mdi-album"
                  :label="t('composer.rate')"
                  size="sm"
                  variant="cta"
                  @click="rate(item)"
                />
              </template>
            </MxItemCard>
          </template>
        </HomeRail>
      </MxSection>

      <MxSection
        v-if="!isPeople && kind !== 'artists' && (trending.loading.value || (trending.data.value?.length ?? 0) > 0)"
        :description="t('search.trendingDescription')"
        :heading-level="3"
        :title="t('search.trendingTitle')"
      >
        <HomeRail
          :empty="t('home.trending.empty')"
          :error="trending.error.value"
          :items="trending.data.value"
          :label="t('search.trendingTitle')"
          :loading="trending.loading.value"
          @retry="trending.reload()"
        >
          <template #default="{ item }">
            <MxItemCard v-bind="cards.summary(item.item)" :heading-level="4" :rating="item.averageRating ?? null">
              <template v-if="isRateable(item.item.type)" #actions>
                <MxIconButton
                  data-testid="page-search-trending-rate"
                  icon="mdi-album"
                  :label="t('composer.rate')"
                  size="sm"
                  variant="cta"
                  @click="rateSummary(item.item)"
                />
              </template>
            </MxItemCard>
          </template>
        </HomeRail>
      </MxSection>

      <div v-if="!isPeople && genres.genres.length > 0" class="search__genres">
        <h3 class="panel-title">{{ t('search.genresTitle') }}</h3>
        <p class="muted">{{ t('search.genresHint') }}</p>

        <ul class="chip-row">
          <li v-for="(genre, index) in genres.genres.slice(0, HOME_GENRES)" :key="genre">
            <MxChip
              data-testid="page-search-genre"
              :duotone="DUOTONE_NAMES[index % DUOTONE_NAMES.length]"
              :label="genre"
              :to="{ name: ROUTE.search, query: { ...route.query, q: genre } }"
              variant="duotone"
            />
          </li>
        </ul>
      </div>
    </section>

    <section v-else-if="isPeople" :aria-busy="people.loading.value" aria-labelledby="search-people-title" class="search__results">
      <div class="toolbar">
        <h2 id="search-people-title" class="panel-title">
          {{ people.loaded.value ? t('search.results', { count: people.total.value, formatted: formatNumber(people.total.value, locale), query }) : t('search.searching', { query }) }}
        </h2>
      </div>

      <div v-if="!people.loaded.value && people.loading.value" aria-hidden="true" class="search__skeleton search__skeleton--people">
        <MxSkeleton v-for="index in 6" :key="index" height="84px" shape="rect" />
      </div>

      <MxErrorState v-else-if="people.error.value && people.items.value.length === 0" :description="people.error.value" :retrying="people.loading.value" @retry="people.reset()" />

      <MxEmptyState
        v-else-if="people.loaded.value && people.items.value.length === 0"
        :description="t('search.people.emptyDescription')"
        duotone="orange"
        :heading-level="3"
        icon="mdi-account-search"
        :title="t('search.empty', { query })"
      />

      <template v-else>
        <ul :aria-label="t('search.people.resultsLabel')" class="search__people">
          <li v-for="(user, index) in people.items.value" :key="user.id" v-reveal="{ variant: 'up', delay: index % 8 * 40 }">
            <MxPersonCard
              :avatar-url="user.avatarUrl"
              data-testid="page-search-person"
              :name="user.fullName"
              :tier="user.disc.tier"
              :tier-label="labels.tierLabel(user.disc.tier, user.disc.label)"
              :to="profileRoute(user.username)"
              :username="user.username"
            />
          </li>
        </ul>

        <MxLoadMore data-testid="page-search-people-more" :has-more="people.hasMore.value" :loading="people.loading.value" @load="people.loadMore()" />
      </template>
    </section>

    <section v-else :aria-busy="paged.loading.value" aria-labelledby="search-results-title" class="search__results">
      <div class="toolbar">
        <h2 id="search-results-title" class="panel-title">
          {{ paged.loaded.value ? t('search.results', { count: paged.total.value, formatted: formatNumber(paged.total.value, locale), query }) : t('search.searching', { query }) }}
        </h2>

        <span class="toolbar__spacer" />

        <MxSegmented
          v-if="!rateMode"
          v-model="view"
          data-testid="page-search-view"
          :label="t('search.viewLabel')"
          :options="viewOptions"
          size="sm"
        />
      </div>

      <div v-if="!paged.loaded.value && paged.loading.value" aria-hidden="true" class="search__skeleton">
        <MxSkeleton v-for="index in 8" :key="index" :height="rateMode ? '80px' : undefined" :shape="rateMode ? 'rect' : 'square'" />
      </div>

      <MxErrorState v-else-if="paged.error.value && paged.items.value.length === 0" :description="paged.error.value" :retrying="paged.loading.value" @retry="paged.reset()" />

      <MxEmptyState
        v-else-if="paged.loaded.value && paged.items.value.length === 0"
        :description="t('search.emptyDescription')"
        duotone="orange"
        :heading-level="3"
        icon="mdi-magnify-close"
        :title="t('search.empty', { query })"
      />

      <template v-else>
        <MxCrate
          v-if="!rateMode && view === 'crate'"
          v-model:pulled="pulled"
          data-testid="page-search-crate"
          :label="t('search.crateLabel', { query })"
          :records="crateRecords"
        >
          <template #pulled="{ record }">
            <CratePulledCard v-bind="pulledCard(record.key, record.title, record.subtitle ?? null)" />
          </template>
        </MxCrate>

        <MxGrid v-else-if="!rateMode" :label="t('search.resultsLabel')" :min="kind === 'artists' ? '150px' : '170px'">
          <li v-for="(entry, index) in paged.items.value" :key="entry.value.id" v-reveal="{ variant: 'up', delay: index % 8 * 50 }">
            <MxItemCard v-bind="cardFor(entry)" :heading-level="3" :priority="index < 4">
              <template v-if="entry.kind !== 'artists'" #actions>
                <MxIconButton
                  data-testid="page-search-result-rate"
                  icon="mdi-album"
                  :label="t('composer.rate')"
                  size="sm"
                  variant="cta"
                  @click="rate(entry)"
                />

                <MxIconButton
                  v-if="session.isAuthenticated"
                  data-testid="page-search-add-to-playlist"
                  icon="mdi-playlist-plus"
                  :label="t('review.addToPlaylist')"
                  size="sm"
                  variant="glass"
                  @click="addToPlaylist(entry)"
                />
              </template>
            </MxItemCard>
          </li>
        </MxGrid>

        <ul v-else class="search__rows">
          <li v-for="(entry, index) in paged.items.value" :key="entry.value.id" v-reveal="{ variant: 'left', delay: index % 8 * 40 }">
            <MxItemCard v-bind="cardFor(entry)" :heading-level="3" layout="row">
              <template #actions>
                <RateButton v-if="entry.kind !== 'artists'" size="sm" :target="composerTarget(entry)!" />

                <MxButton
                  v-else
                  append-icon="mdi-arrow-right"
                  data-testid="page-search-see-discography"
                  :label="t('search.seeDiscography')"
                  size="sm"
                  :to="artistRoute(entry.value.id)"
                  variant="glass"
                />
              </template>
            </MxItemCard>
          </li>
        </ul>

        <AdSlot placement="SEARCH_RESULTS" />
        <MxLoadMore data-testid="page-search-load-more" :has-more="paged.hasMore.value" :loading="paged.loading.value" @load="paged.loadMore()" />
      </template>
    </section>
  </div>
</template>

<script lang="ts" setup>
  import type { ComposerTarget } from '@/stores/composer'
  import type { AlbumSummary, ArtistSummary, CatalogKind, ItemSummary, ListenLaterKind, Page, SearchKind, TrackSummary, UserSummary } from '@/types/api'
  import type { SegmentedOption } from '@pedrolucaslopes/mixtape-ui'
  import {
    DUOTONE_NAMES,
    formatNumber,
    MxButton,
    MxChip,
    MxCrate,
    MxEmptyState,
    MxErrorState,
    MxGlass,
    MxGrid,
    MxIconButton,
    MxItemCard,
    MxLoadMore,
    MxPersonCard,
    MxSearchField,
    MxSection,
    MxSegmented,
    MxSkeleton,
    vReveal,
    yearOf,
  } from '@pedrolucaslopes/mixtape-ui'
  import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import AdSlot from '@/components/AdSlot.vue'
  import CratePulledCard from '@/components/CratePulledCard.vue'
  import HomeRail from '@/components/HomeRail.vue'
  import RateButton from '@/components/RateButton.vue'
  import { useAsyncData } from '@/composables/useAsyncData'
  import { useAuthAction } from '@/composables/useAuthAction'
  import { type CatalogCard, crateRecord, useCatalogCards } from '@/composables/useCatalogCards'
  import { useLabels } from '@/composables/useLabels'
  import { usePaged } from '@/composables/usePaged'
  import { useRecentSearches } from '@/composables/useRecentSearches'
  import { useSeo } from '@/composables/useSeo'
  import { HOME_GENRES, RAIL_SIZE, SEARCH_PAGE_SIZE, WORLD_CHART_RANGE } from '@/constants/api'
  import { CATALOG_KINDS, SEARCH_KIND_ICONS, SEARCH_KINDS } from '@/constants/filters'
  import { SEARCH_TEXT_LENGTH } from '@/constants/validation'
  import { ROUTE } from '@/router/routes'
  import { catalogApi, type PageQuery, profilesApi, reviewsApi } from '@/services/mixtape'
  import { useComposerStore } from '@/stores/composer'
  import { useGenresStore } from '@/stores/genres'
  import { usePlaylistPickerStore } from '@/stores/playlistPicker'
  import { useSessionStore } from '@/stores/session'
  import { artistRoute, isRateable, profileRoute } from '@/utils/items'
  import { queryEnum, queryString } from '@/utils/navigation'
  import { rotateDaily } from '@/utils/periods'

  type SearchEntry
    = | { kind: 'albums', value: AlbumSummary }
      | { kind: 'tracks', value: TrackSummary }
      | { kind: 'artists', value: ArtistSummary }

  const SEARCH_VIEWS = ['grid', 'crate'] as const
  type SearchView = typeof SEARCH_VIEWS[number]

  const KIND_TYPES: Readonly<Record<CatalogKind, ListenLaterKind>> = { albums: 'ALBUM', tracks: 'TRACK', artists: 'ARTIST' }

  const { t, locale } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const session = useSessionStore()
  const composer = useComposerStore()
  const picker = usePlaylistPickerStore()
  const genres = useGenresStore()
  const cards = useCatalogCards()
  const labels = useLabels()
  const recent = useRecentSearches()
  const { requireAuth } = useAuthAction()

  const query = computed(() => (queryString(route.query.q) ?? '').trim().slice(0, SEARCH_TEXT_LENGTH.max))
  const rateMode = computed(() => route.query.rate === '1')
  const kind = computed<SearchKind>({
    get: () => queryEnum(route.query.type, rateMode.value ? CATALOG_KINDS : SEARCH_KINDS, 'albums'),
    set: value => {
      void router.replace({ query: { ...route.query, type: value === 'albums' ? undefined : value } })
    },
  })
  const isPeople = computed(() => kind.value === 'people')
  /** O tipo do catálogo para as seções que só existem para discos, músicas e artistas. */
  const catalogKind = computed<CatalogKind>(() => (kind.value === 'people' ? 'albums' : kind.value))

  const draft = ref(query.value)
  watch(query, value => {
    draft.value = value
  })

  const searchable = computed(() => query.value.length >= SEARCH_TEXT_LENGTH.min)

  const kindOptions = computed<SegmentedOption<SearchKind>[]>(() => (rateMode.value ? CATALOG_KINDS : SEARCH_KINDS).map(value => ({
    value,
    label: t(`search.kinds.${value}`),
    icon: SEARCH_KIND_ICONS[value],
  })))

  const placeholder = computed(() => t(`search.placeholders.${kind.value}`))

  async function load (page: number, limit: number): Promise<Page<SearchEntry>> {
    const text = query.value
    const current = kind.value
    if (current === 'people' || text.length < SEARCH_TEXT_LENGTH.min) return { items: [], page: 1, limit, total: 0, totalPages: 0 }
    if (current === 'tracks') {
      const result = await catalogApi.searchTracks(text, { page, limit })
      return { ...result, items: result.items.map(value => ({ kind: 'tracks' as const, value })) }
    }
    if (current === 'artists') {
      const result = await catalogApi.searchArtists(text, { page, limit })
      return { ...result, items: result.items.map(value => ({ kind: 'artists' as const, value })) }
    }
    const result = await catalogApi.searchAlbums(text, { page, limit })
    return { ...result, items: result.items.map(value => ({ kind: 'albums' as const, value })) }
  }

  const paged = usePaged<SearchEntry>(load, { limit: SEARCH_PAGE_SIZE, watch: () => [query.value, kind.value] })

  async function loadPeople (page: number, limit: number): Promise<Page<UserSummary>> {
    const text = query.value
    if (!isPeople.value || text.length < SEARCH_TEXT_LENGTH.min) return { items: [], page: 1, limit, total: 0, totalPages: 0 }
    return profilesApi.search(text, { page, limit })
  }

  const people = usePaged<UserSummary>(loadPeople, { limit: SEARCH_PAGE_SIZE, watch: () => [query.value, kind.value] })

  const favoriteGenres = computed(() => rotateDaily(session.user?.favoriteGenres ?? []))

  async function suggestionsPage (current: CatalogKind, genres: readonly string[], page: PageQuery): Promise<Page<SearchEntry>> {
    if (current === 'tracks') {
      const result = await catalogApi.suggestedTracks(genres, page)
      return { ...result, items: result.items.map(value => ({ kind: 'tracks' as const, value })) }
    }
    if (current === 'artists') {
      const result = await catalogApi.suggestedArtists(genres, page)
      return { ...result, items: result.items.map(value => ({ kind: 'artists' as const, value })) }
    }
    const result = await catalogApi.suggestedAlbums(genres, page)
    return { ...result, items: result.items.map(value => ({ kind: 'albums' as const, value })) }
  }

  /**
   * As sugestões já na tela. A mistura dos estilos pode mudar de uma página para a outra (estilo que atrasou na API
   * entra na seguinte), e o mesmo disco viria duas vezes no trilho.
   */
  let forYouShown = new Set<string>()

  async function loadForYou (page: number, limit: number): Promise<Page<SearchEntry>> {
    const genres = favoriteGenres.value
    const current = kind.value
    if (genres.length === 0 || searchable.value || current === 'people') return { items: [], page: 1, limit, total: 0, totalPages: 0 }
    const shown = page === 1 ? (forYouShown = new Set()) : forYouShown
    const result = await suggestionsPage(current, genres, { page, limit })
    const items = result.items.filter(entry => !shown.has(entry.value.id))
    for (const entry of items) shown.add(entry.value.id)
    return { ...result, items }
  }

  const forYou = usePaged<SearchEntry>(loadForYou, { limit: RAIL_SIZE, watch: () => [kind.value, favoriteGenres.value.join('|'), searchable.value] })
  const forYouRail = useTemplateRef<{ reveal: (index: number) => void }>('forYouRail')

  /** As sugestões novas entram no fim do trilho: ele rola até a primeira delas, que recebe o foco. */
  async function moreSuggestions (): Promise<void> {
    const shown = forYou.items.value.length
    await forYou.loadMore()
    if (forYou.items.value.length <= shown) return
    await nextTick()
    forYouRail.value?.reveal(shown)
  }

  const world = useAsyncData<SearchEntry[]>(async () => {
    const current = kind.value
    if (current === 'people') return []
    if (current === 'tracks') return (await catalogApi.trackChart(WORLD_CHART_RANGE, RAIL_SIZE)).map(entry => ({ kind: 'tracks' as const, value: entry.item }))
    if (current === 'artists') return (await catalogApi.artistChart(WORLD_CHART_RANGE, RAIL_SIZE)).map(entry => ({ kind: 'artists' as const, value: entry.item }))
    return (await catalogApi.albumChart(WORLD_CHART_RANGE, RAIL_SIZE)).map(entry => ({ kind: 'albums' as const, value: entry.item }))
  }, { watch: () => kind.value })

  const trending = useAsyncData(
    () => (isPeople.value ? Promise.resolve([]) : reviewsApi.trending(kind.value === 'tracks' ? 'TRACK' : 'ALBUM', 'month', RAIL_SIZE)),
    { watch: () => kind.value },
  )

  onMounted(() => {
    void genres.load().catch(() => undefined)
  })

  const shownLoaded = computed(() => (isPeople.value ? people.loaded.value : paged.loaded.value))
  const shownTotal = computed(() => (isPeople.value ? people.total.value : paged.total.value))

  watch(() => [shownLoaded.value, query.value] as const, ([loaded, text]) => {
    if (loaded && text.length >= SEARCH_TEXT_LENGTH.min && shownTotal.value > 0) recent.remember(text)
  })

  const liveMessage = computed(() => {
    if (!searchable.value || !shownLoaded.value) return ''
    return t('search.results', { count: shownTotal.value, formatted: formatNumber(shownTotal.value, locale.value), query: query.value })
  })

  function submit (value: string): void {
    const text = value.trim()
    void router.push({ query: { ...route.query, q: text || undefined } })
  }

  /** Limpar, Esc ou Enter com o campo vazio desfaz a busca: volta às sugestões, às buscas recentes e aos estilos. */
  function clearSearch (): void {
    if (route.query.q === undefined) return
    void router.push({ query: { ...route.query, q: undefined } })
  }

  function exitRate (): void {
    void router.replace({ query: { ...route.query, rate: undefined } })
  }

  function cardFor (entry: SearchEntry): CatalogCard {
    if (entry.kind === 'albums') return cards.album(entry.value)
    if (entry.kind === 'tracks') return cards.track(entry.value)
    return cards.artist(entry.value)
  }

  const view = computed<SearchView>({
    get: () => queryEnum(route.query.view, SEARCH_VIEWS, 'grid'),
    set: value => {
      void router.replace({ query: { ...route.query, view: value === 'grid' ? undefined : value } })
    },
  })

  const viewOptions = computed<SegmentedOption<SearchView>[]>(() => [
    { value: 'grid', label: t('search.views.grid'), icon: 'mdi-view-grid-outline' },
    { value: 'crate', label: t('search.views.crate'), icon: 'mdi-layers-outline' },
  ])

  const pulled = ref<string | null>(null)
  const crateRecords = computed(() => paged.items.value.map(entry => crateRecord(entry.value.id, cardFor(entry))))
  const entryById = computed(() => new Map(paged.items.value.map(entry => [entry.value.id, entry])))

  watch(() => [query.value, kind.value], () => {
    pulled.value = null
  })

  function pulledCard (key: string, title: string, subtitle: string | null) {
    const entry = entryById.value.get(key)
    const base = { id: key, title, subtitle, kind: entry ? KIND_TYPES[entry.kind] : KIND_TYPES[catalogKind.value] }
    if (!entry) return base
    const target = composerTarget(entry)
    return {
      ...base,
      meta: labels.listeners(entry.value.listenerCount),
      cover: target?.cover ?? null,
      year: target?.year ?? null,
    }
  }

  function composerTarget (entry: SearchEntry): ComposerTarget | null {
    if (entry.kind === 'albums') {
      const album = entry.value
      return { type: 'ALBUM', id: album.id, title: album.title, artist: album.artistCredit, cover: album.cover?.medium ?? null, year: yearOf(album.firstReleaseDate) }
    }
    if (entry.kind === 'tracks') {
      const track = entry.value
      return { type: 'TRACK', id: track.id, title: track.title, artist: track.artistCredit, cover: track.cover?.medium ?? null, year: yearOf(track.firstReleaseDate) }
    }
    return null
  }

  function rate (entry: SearchEntry): void {
    const target = composerTarget(entry)
    if (target && requireAuth(t('composer.signInToRate'))) void composer.start(target)
  }

  function rateSummary (item: ItemSummary): void {
    if (!isRateable(item.type) || !requireAuth(t('composer.signInToRate'))) return
    void composer.start({ type: item.type, id: item.id, title: item.title, artist: item.artistName, cover: item.coverUrl, year: yearOf(item.releaseDate) })
  }

  function addToPlaylist (entry: SearchEntry): void {
    const kindName = entry.kind === 'albums' ? 'ALBUM' : (entry.kind === 'tracks' ? 'TRACK' : 'ARTIST')
    const label = entry.kind === 'artists' ? entry.value.name : entry.value.title
    void picker.start({ kind: kindName, refId: entry.value.id, label })
  }

  useSeo(() => ({
    title: searchable.value ? t('search.seoQuery', { query: query.value }) : t('search.seoTitle'),
    description: t('search.lead'),
    noindex: searchable.value,
  }))
</script>

<style scoped>
.search__controls {
  display: grid;
  gap: 14px;
}

.search__rate-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  animation: mx-pop-in var(--mx-spring-bouncy-duration) var(--mx-spring-bouncy) both;
}

.search__rate-banner > span {
  flex: 1;
  min-width: 200px;
}

.search__idle,
.search__results,
.search__recent,
.search__genres {
  display: grid;
  gap: 16px;
}

.search__genres p {
  margin: -8px 0 0;
}

.search__more {
  justify-self: start;
}

.search__cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 18px;
  background: var(--mx-surface);
  border-radius: var(--mx-radius-lg);
}

.search__cta p {
  flex: 1;
  min-width: 220px;
  margin: 0;
}

.search__recent-item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.search__skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 20px;
}

.search__rows {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.search__people {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.search__skeleton--people {
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
}

@media (prefers-reduced-motion: reduce) {
  .search__rate-banner {
    animation: none;
  }
}
</style>
