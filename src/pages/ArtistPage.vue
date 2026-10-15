<template>
  <PageState
    data-testid="page-artist"
    :error="artist.error.value"
    :loading="artist.loading.value"
    :not-found="artist.notFound.value"
    :not-found-description="t('artist.notFoundDescription')"
    :not-found-title="t('artist.notFound')"
    :ready="Boolean(artist.data.value)"
    @retry="artist.reload()"
  >
    <article v-if="artist.data.value" class="page item-page">
      <MxPageHero
        decoration="star"
        :duotone="duotone"
        :eyebrow="eyebrow"
        layout="split"
        :title="artist.data.value.name"
      >
        <template #media>
          <div class="artist__photo">
            <MxCover
              priority
              radius="none"
              :seed="artist.data.value.id"
              shape="circle"
              sizes="(max-width: 840px) 70vw, 380px"
              :sources="photoSources"
              :title="artist.data.value.name"
            />

            <MxImageCredit
              v-if="artist.data.value.image"
              :author="artist.data.value.image.author"
              class="artist__credit"
              data-testid="page-artist-credit"
              :license="artist.data.value.image.license"
              :license-url="artist.data.value.image.licenseUrl"
              :source-url="artist.data.value.image.sourceUrl"
            />
          </div>
        </template>

        <template v-if="artist.data.value.disambiguation || (artist.data.value.sortName && artist.data.value.sortName !== artist.data.value.name)" #subtitle>
          {{ artist.data.value.disambiguation ?? artist.data.value.sortName }}
        </template>

        <template #story>
          <p class="item-page__story">{{ story }}</p>

          <ul class="hero-facts">
            <li v-if="artist.data.value.country">
              <MxFlag :region="artist.data.value.country" :size="16" />
              {{ labels.region(artist.data.value.country) }}
            </li>

            <li v-if="lifeSpan">
              <VIcon aria-hidden="true" icon="mdi-calendar-range" size="16" />
              {{ lifeSpan }}
            </li>

            <li v-for="genre in artist.data.value.genres.slice(0, 3)" :key="genre">
              <VIcon aria-hidden="true" icon="mdi-tag-outline" size="16" />
              {{ genre }}
            </li>
          </ul>
        </template>

        <template #stats>
          <MxStat v-if="listeners" format="compact" :label="listeners.label" :value="listeners.value" />
          <MxStat :label="t('artist.releases')" :value="artist.data.value.discography.length" />
          <MxStat v-if="activeYears !== null" :label="t('artist.years')" :value="activeYears" />
        </template>

        <template #actions>
          <MxButton
            data-testid="page-artist-rate-album"
            icon="mdi-album"
            :label="t('artist.rateAlbum')"
            size="lg"
            variant="ink"
            @click="scrollToDiscography"
          />

          <MxButton
            data-testid="page-artist-add-to-playlist"
            icon="mdi-playlist-plus"
            :label="t('item.addToPlaylist')"
            size="lg"
            variant="ink-outline"
            @click="addToPlaylist"
          />

          <MxIconButton
            data-testid="page-artist-share"
            icon="mdi-share-variant"
            :label="t('item.share')"
            size="lg"
            variant="ink"
            @click="share"
          />
        </template>
      </MxPageHero>

      <ul :aria-label="t('item.highlights')" class="story-grid">
        <li v-if="beginYear" v-reveal="{ variant: 'tilt', delay: 0 }">
          <MxStoryCard
            duotone="orange"
            icon="mdi-rocket-launch"
            :label="t('artist.cards.since')"
            :sentence="sinceSentence"
            :tilt="-2"
            :value="beginYear"
          />
        </li>

        <li v-reveal="{ variant: 'tilt', delay: 90 }">
          <MxStoryCard
            duotone="violet"
            icon="mdi-album"
            :label="t('artist.cards.discography')"
            :sentence="discographySentence"
            :tilt="1.5"
            :value="formatNumber(artist.data.value.discography.length, locale)"
          />
        </li>

        <li v-if="topTrack" v-reveal="{ variant: 'tilt', delay: 180 }">
          <MxStoryCard
            duotone="green"
            icon="mdi-fire"
            :label="t('artist.cards.topTrack')"
            :sentence="t('artist.cards.topTrackSentence', { listeners: formatCompactNumber(topTrack.listenerCount, locale) })"
            :tilt="-1"
            :value="topTrack.title"
          />
        </li>

        <li v-if="listeners" v-reveal="{ variant: 'tilt', delay: 270 }">
          <MxStoryCard
            duotone="blush"
            icon="mdi-headphones"
            :label="listeners.label"
            :sentence="listeners.sentence"
            :tilt="2"
            :value="formatCompactNumber(listeners.value, locale)"
          />
        </li>
      </ul>

      <div class="page-columns">
        <div class="page-columns__main">
          <MxSection v-if="artist.data.value.topTracks.length > 0" :description="t('artist.topTracksDescription')" :eyebrow="t('artist.topTracksEyebrow')" :title="t('artist.topTracks')">
            <ol class="artist__tracks">
              <li
                v-for="(track, index) in visibleTopTracks"
                :key="track.id"
                v-reveal="{ variant: 'left', delay: Math.min(index, 10) * 50 }"
                class="artist__track"
                :style="{ '--track-share': `${(track.listenerCount / maxListeners) * 100}%`, '--track-color': blobColors[index % blobColors.length] }"
              >
                <span aria-hidden="true" class="artist__track-rank">{{ index + 1 }}</span>

                <MxCover
                  :seed="track.id"
                  size="52px"
                  sizes="52px"
                  :sources="coverSources(track.cover)"
                  :title="track.album?.title ?? track.title"
                />

                <span class="artist__track-body">
                  <RouterLink class="artist__track-title" data-testid="page-artist-track" :to="trackRoute(track.id)">{{ track.title }}</RouterLink>
                  <span class="artist__track-meta">{{ cards.join([track.album?.title, track.durationMs ? formatDuration(track.durationMs) : null]) }}</span>
                  <span aria-hidden="true" class="artist__track-bar" />
                </span>

                <span class="artist__track-listeners">
                  {{ formatCompactNumber(track.listenerCount, locale) }}
                  <span class="mx-sr-only">{{ t('item.listeners') }}</span>
                </span>
              </li>
            </ol>

            <MxButton
              v-if="artist.data.value.topTracks.length > TOP_TRACKS_PREVIEW"
              data-testid="page-artist-show-all-tracks"
              :icon="showAllTracks ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              :label="showAllTracks ? t('common.showLess') : t('artist.showAllTracks', { count: artist.data.value.topTracks.length })"
              variant="glass"
              @click="showAllTracks = !showAllTracks"
            />
          </MxSection>

          <section
            id="discography"
            ref="discographyRef"
            aria-labelledby="discography-title"
            class="artist__discography"
            tabindex="-1"
          >
            <div class="toolbar">
              <div>
                <p class="page-header__eyebrow">{{ t('artist.discographyEyebrow', { count: artist.data.value.discography.length }) }}</p>
                <h2 id="discography-title" class="artist__section-title">{{ t('artist.discography') }}</h2>
              </div>

              <span class="toolbar__spacer" />

              <MxSegmented
                v-if="typeOptions.length > 2"
                v-model="releaseFilter"
                data-testid="page-artist-filter"
                :label="t('artist.filterLabel')"
                :options="typeOptions"
                size="sm"
              />
            </div>

            <MxPagedGrid
              v-if="filteredDiscography.length > 0"
              :items="filteredDiscography"
              :label="t('artist.discography')"
              :min-item-width="DISCOGRAPHY_GRID.minItemWidth"
              :rows="DISCOGRAPHY_GRID.rows"
            >
              <template #default="{ item: album }">
                <MxItemCard v-bind="cards.album(album)">
                  <template #actions>
                    <MxIconButton
                      data-testid="page-artist-rate-release"
                      icon="mdi-album"
                      :label="t('composer.rate')"
                      size="sm"
                      variant="cta"
                      @click="rate(album)"
                    />
                  </template>
                </MxItemCard>
              </template>
            </MxPagedGrid>

            <p v-else class="muted">{{ t('artist.noDiscography') }}</p>
          </section>
        </div>

        <aside :aria-label="t('item.details')" class="page-columns__aside">
          <ListenPanel :links="artist.data.value.links" :only="ARTIST_STREAMING_BRANDS" />
          <ListenPanel :links="artist.data.value.links" :only="ARTIST_SOCIAL_BRANDS" :title="t('artist.elsewhere')" />

          <MxGlass class="panel-stack" variant="panel">
            <h2 class="panel-title">{{ t('item.genres') }}</h2>

            <GenreChips
              :empty="t('item.noGenres')"
              :genres="artist.data.value.genres"
              :label="t('item.genres')"
              :seed="artist.data.value.id"
              size="sm"
            />
          </MxGlass>

          <MxGlass class="panel-stack" variant="panel">
            <h2 class="panel-title">{{ t('artist.about') }}</h2>
            <MxDescriptionList :columns="1" :items="detailItems" />

            <p v-if="artist.data.value.image" class="muted artist__photo-credit">
              {{ photoCredit }}
              <a data-testid="page-artist-photo-source" :href="artist.data.value.image.sourceUrl" rel="noopener noreferrer" target="_blank">{{ t('artist.photoSource') }}</a>
            </p>
          </MxGlass>

          <SourceNote :source="artist.data.value.source" />
        </aside>
      </div>
    </article>
  </PageState>
</template>

<script lang="ts" setup>
  import type { AlbumSummary } from '@/types/api'
  import type { CoverSources, DescriptionItem, SegmentedOption } from '@pedrolucaslopes/mixtape-ui'
  import {
    blobColors,
    duotoneFor,
    formatCompactNumber,
    formatDate,
    formatDuration,
    formatNumber,
    formatPartialDate,
    MxButton,
    MxCover,
    MxDescriptionList,
    MxFlag,
    MxGlass,
    MxIconButton,
    MxImageCredit,
    MxItemCard,
    MxPagedGrid,
    MxPageHero,
    MxSection,
    MxSegmented,
    MxStat,
    MxStoryCard,
    prefersReducedMotion,
    vReveal,
    yearOf,
  } from '@pedrolucaslopes/mixtape-ui'
  import { computed, nextTick, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import GenreChips from '@/components/GenreChips.vue'
  import ListenPanel from '@/components/ListenPanel.vue'
  import PageState from '@/components/PageState.vue'
  import SourceNote from '@/components/SourceNote.vue'
  import { useAsyncData } from '@/composables/useAsyncData'
  import { useAuthAction } from '@/composables/useAuthAction'
  import { useCatalogCards } from '@/composables/useCatalogCards'
  import { useLabels } from '@/composables/useLabels'
  import { useQuickShare } from '@/composables/useQuickShare'
  import { useSeo } from '@/composables/useSeo'
  import { TOP_TRACKS_PREVIEW } from '@/constants/api'
  import { ARTIST_SOCIAL_BRANDS, ARTIST_STREAMING_BRANDS, DISCOGRAPHY_GRID, DISCOGRAPHY_TYPE_ORDER } from '@/constants/catalog'
  import { musicBrainzUrl } from '@/constants/sources'
  import { catalogApi } from '@/services/mixtape'
  import { useComposerStore } from '@/stores/composer'
  import { usePlaylistPickerStore } from '@/stores/playlistPicker'
  import { coverSources, trackRoute } from '@/utils/items'

  const props = defineProps<{ id: string }>()

  const { t, locale } = useI18n()
  const labels = useLabels()
  const cards = useCatalogCards()
  const picker = usePlaylistPickerStore()
  const composer = useComposerStore()
  const { requireAuth } = useAuthAction()
  const { share: quickShare } = useQuickShare()

  const artist = useAsyncData(() => catalogApi.artist(props.id), { watch: () => props.id })

  const duotone = computed(() => duotoneFor(props.id))
  const showAllTracks = ref(false)
  const releaseFilter = ref('all')
  const discographyRef = ref<HTMLElement | null>(null)

  watch(() => props.id, () => {
    showAllTracks.value = false
    releaseFilter.value = 'all'
  })

  const photoSources = computed<CoverSources | null>(() => {
    const image = artist.data.value?.image
    return image ? { small: image.thumbnails.small, medium: image.thumbnails.medium, large: image.thumbnails.large } : null
  })

  const eyebrow = computed(() => {
    const value = artist.data.value
    if (!value) return undefined
    return cards.join([labels.artistType(value.type), labels.gender(value.gender)]) ?? t('artist.eyebrow')
  })

  const lifeSpan = computed(() => cards.lifeSpan(artist.data.value?.lifeSpan))

  const beginYear = computed(() => yearOf(artist.data.value?.lifeSpan.begin ?? null))

  const activeYears = computed(() => {
    const span = artist.data.value?.lifeSpan
    const begin = Number(yearOf(span?.begin ?? null))
    if (!begin) return null
    const end = Number(yearOf(span?.end ?? null)) || (span?.ended ? null : new Date().getFullYear())
    return end ? Math.max(0, end - begin) : null
  })

  const story = computed(() => {
    const value = artist.data.value
    if (!value) return ''
    const place = cards.join([value.beginArea, value.area && value.area !== value.beginArea ? value.area : null])
    const kind = labels.artistType(value.type) ?? t('artist.genericType')
    const parts = [place ? t('artist.story.from', { kind, place }) : kind]
    if (lifeSpan.value) parts.push(lifeSpan.value)
    if (value.genres.length > 0) parts.push(t('artist.story.genres', { genres: value.genres.slice(0, 3).join(', ') }))
    return `${parts.join(' · ')}.`
  })

  const sinceSentence = computed(() => {
    const span = artist.data.value?.lifeSpan
    if (!span) return undefined
    const end = yearOf(span.end)
    if (end) return t('artist.cards.sinceEnded', { end })
    return span.ended ? t('artist.cards.sinceEndedUnknown') : t('artist.cards.sinceActive', { years: activeYears.value ?? 0 })
  })

  const typeCounts = computed(() => {
    const counts = new Map<string, number>()
    for (const album of artist.data.value?.discography ?? []) {
      const key = (album.primaryType ?? 'other').toLowerCase()
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  })

  const discographySentence = computed(() => {
    const parts = [...typeCounts.value.entries()]
      .toSorted(([a], [b]) => DISCOGRAPHY_TYPE_ORDER.indexOf(a) - DISCOGRAPHY_TYPE_ORDER.indexOf(b))
      .map(([type, count]) => labels.releaseTypeCount(type, count))
    return parts.length > 0 ? parts.join(' · ') : undefined
  })

  const typeOptions = computed<SegmentedOption<string>[]>(() => [
    { value: 'all', label: t('artist.filterAll') },
    ...[...typeCounts.value.keys()]
      .toSorted((a, b) => DISCOGRAPHY_TYPE_ORDER.indexOf(a) - DISCOGRAPHY_TYPE_ORDER.indexOf(b))
      .map(type => ({ value: type, label: labels.releaseType(type) })),
  ])

  const filteredDiscography = computed(() => (artist.data.value?.discography ?? [])
    .filter(album => releaseFilter.value === 'all' || (album.primaryType ?? 'other').toLowerCase() === releaseFilter.value)
    .toSorted((a, b) => (b.firstReleaseDate ?? '').localeCompare(a.firstReleaseDate ?? '')))

  const topTracks = computed(() => (artist.data.value?.topTracks ?? []).toSorted((a, b) => b.listenerCount - a.listenerCount))

  /**
   * Ouvintes mensais (último mês fechado no ListenBrainz) por padrão; sem esse dado, o total desde sempre,
   * com o rótulo dele.
   */
  const listeners = computed(() => {
    const value = artist.data.value
    if (!value) return null
    const monthly = value.monthlyListeners
    if (monthly) {
      const [year, month] = monthly.month.split('-').map(Number)
      const period = formatDate(new Date(Date.UTC(year!, month! - 1, 15)), locale.value, { month: 'long', year: 'numeric', timeZone: 'UTC' })
      return { value: monthly.count, label: t('artist.monthlyListeners'), sentence: t('artist.monthlyListenersSentence', { period }) }
    }
    if (value.listenerCount) return { value: value.listenerCount, label: t('item.listeners'), sentence: t('item.listenersSentence') }
    return null
  })
  const topTrack = computed(() => topTracks.value[0] ?? null)
  const maxListeners = computed(() => Math.max(1, ...topTracks.value.map(track => track.listenerCount)))
  const visibleTopTracks = computed(() => topTracks.value.slice(0, showAllTracks.value ? undefined : TOP_TRACKS_PREVIEW))

  const photoCredit = computed(() => {
    const image = artist.data.value?.image
    if (!image) return ''
    return cards.join([image.author ? t('artist.photoBy', { author: image.author }) : null, image.license]) ?? ''
  })

  const detailItems = computed<DescriptionItem[]>(() => {
    const value = artist.data.value
    if (!value) return []
    return [
      { term: t('artist.details.type'), value: labels.artistType(value.type) },
      { term: t('artist.details.gender'), value: labels.gender(value.gender) },
      { term: t('artist.details.country'), value: labels.region(value.country) },
      { term: t('artist.details.area'), value: value.area },
      { term: t('artist.details.beginArea'), value: value.beginArea },
      { term: t('artist.details.begin'), value: formatPartialDate(value.lifeSpan.begin, locale.value) },
      { term: t('artist.details.end'), value: formatPartialDate(value.lifeSpan.end, locale.value) ?? (value.lifeSpan.ended ? t('artist.details.endedUnknown') : null) },
      { term: t('artist.details.sortName'), value: value.sortName },
      { term: t('artist.details.disambiguation'), value: value.disambiguation },
      { term: t('artist.details.source'), value: t('album.edition.openSource'), href: musicBrainzUrl('artist', value.id) },
    ].filter(item => item.value !== null && item.value !== undefined && item.value !== '')
  })

  async function scrollToDiscography (): Promise<void> {
    await nextTick()
    discographyRef.value?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
    discographyRef.value?.focus({ preventScroll: true })
  }

  function rate (album: AlbumSummary): void {
    if (!requireAuth(t('composer.signInToRate'))) return
    void composer.start({ type: 'ALBUM', id: album.id, title: album.title, artist: album.artistCredit, cover: album.cover?.medium ?? null, year: yearOf(album.firstReleaseDate) })
  }

  function addToPlaylist (): void {
    if (!artist.data.value || !requireAuth(t('playlists.signInToAdd'))) return
    void picker.start({ kind: 'ARTIST', refId: artist.data.value.id, label: artist.data.value.name })
  }

  function share (): void {
    const value = artist.data.value
    if (!value) return
    void quickShare(t('artist.shareTitle', { name: value.name }), t('artist.shareText', { name: value.name }))
  }

  useSeo(() => {
    const value = artist.data.value
    if (!value) return { title: artist.notFound.value ? t('artist.notFound') : t('artist.loading'), noindex: artist.notFound.value }
    return {
      title: value.name,
      description: t('artist.seoDescription', { name: value.name, story: story.value, count: value.discography.length }),
      image: value.image?.thumbnailUrl ?? null,
      type: 'profile',
    }
  })
</script>

<style scoped>
.item-page__story {
  margin: 0 0 12px;
}

.artist__photo {
  position: relative;
  width: min(100%, 380px);
  margin-inline: auto;
  padding: 10px;
  background: var(--mx-hero-ink);
  border-radius: 50%;
  animation: artist-photo 900ms var(--mx-spring-pop) both;
}

.artist__photo :deep(.artist__credit) {
  position: absolute;
  right: 12%;
  bottom: 8%;
}

.artist__tracks {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.artist__track {
  display: grid;
  grid-template-columns: 2.2ch 52px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 8px 12px 8px 8px;
  border-radius: var(--mx-radius-md);
  transition: background-color var(--mx-duration-fast) var(--mx-ease-out);
}

.artist__track:hover {
  background: var(--mx-surface);
}

.artist__track-rank {
  font-family: var(--mx-font-display);
  font-size: 1.5rem;
  font-weight: 800;
  text-align: end;
  color: var(--track-color);
}

.artist__track-body {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.artist__track-title {
  overflow: hidden;
  font-weight: 800;
  color: inherit;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.artist__track-title:hover {
  text-decoration: underline;
}

.artist__track-title:focus-visible {
  outline: 3px solid var(--mx-focus);
  outline-offset: 2px;
  border-radius: 4px;
}

.artist__track-meta {
  overflow: hidden;
  font-size: 0.8125rem;
  color: var(--mx-on-surface-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.artist__track-bar {
  position: relative;
  height: 6px;
  overflow: hidden;
  background: color-mix(in srgb, var(--mx-on-surface) 8%, transparent);
  border-radius: var(--mx-radius-pill);
}

.artist__track-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  width: var(--track-share);
  background: var(--track-color);
  border-radius: inherit;
  transform-origin: left;
  animation: artist-bar 900ms var(--mx-spring-smooth) 200ms both;
}

.artist__track-listeners {
  font-family: var(--mx-font-display);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.artist__discography {
  display: grid;
  gap: 20px;
  outline: none;
  scroll-margin-top: calc(var(--mx-top-bar-height) + 16px);
}

.artist__section-title {
  margin: 0;
  font-family: var(--mx-font-display);
  font-size: var(--mx-text-h2);
  font-weight: 800;
  font-stretch: 88%;
  letter-spacing: var(--mx-tracking-title);
}

.artist__photo-credit {
  margin: 0;
  font-size: 0.8125rem;
}

.artist__photo-credit a {
  font-weight: 700;
  color: var(--mx-link);
}

@keyframes artist-photo {
  from { transform: scale(0.6) rotate(-12deg); }
  to { transform: none; }
}

@keyframes artist-bar {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@media (prefers-reduced-motion: reduce) {
  .artist__photo,
  .artist__track-bar::after {
    animation: none;
  }
}
</style>
