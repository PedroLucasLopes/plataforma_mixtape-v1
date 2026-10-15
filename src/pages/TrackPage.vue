<template>
  <PageState
    data-testid="page-track"
    :error="track.error.value"
    :loading="track.loading.value"
    :not-found="track.notFound.value"
    :not-found-description="t('track.notFoundDescription')"
    :not-found-title="t('track.notFound')"
    :ready="Boolean(track.data.value)"
    @retry="track.reload()"
  >
    <article v-if="track.data.value" class="page item-page">
      <MxPageHero
        decoration="sun"
        :duotone="duotone"
        :eyebrow="t('track.eyebrow')"
        layout="split"
        :title="track.data.value.title"
      >
        <template #media>
          <div v-tilt="{ max: 8, glare: true }" class="hero-cover hero-cover--float track__media">
            <MxCover
              priority
              :seed="track.data.value.album?.id ?? track.data.value.id"
              sizes="(max-width: 840px) 80vw, 420px"
              :sources="coverSources(track.data.value.cover)"
              :title="track.data.value.album?.title ?? track.data.value.title"
            />

            <MxVinyl class="track__vinyl" :image="track.data.value.cover?.small ?? null" :size="132" spinning />
          </div>
        </template>

        <template #subtitle>
          <ArtistLinks :artists="track.data.value.artists" :fallback="track.data.value.artistCredit" />
        </template>

        <template #story>
          <p class="item-page__story">
            <template v-if="track.data.value.album">
              <template v-if="track.data.value.album.id">
                {{ t('track.fromAlbum') }}
                <RouterLink class="hero-link" data-testid="page-track-album" :to="albumRoute(track.data.value.album.id)">{{ track.data.value.album.title }}</RouterLink>.
              </template>

              <template v-else>{{ t('track.fromAlbum') }} {{ track.data.value.album.title }}.</template>
            </template>
            {{ story }}
          </p>

          <ul class="hero-facts">
            <li v-for="fact in heroFacts" :key="fact.key">
              <VIcon aria-hidden="true" :icon="fact.icon" size="16" />
              {{ fact.label }}
            </li>
          </ul>
        </template>

        <template #stats>
          <MxStat format="rating" :label="t('item.communityRating')" :value="stats.data.value?.averageRating ?? null" />
          <MxStat :label="t('item.reviewsCount')" :value="stats.data.value?.reviewsCount ?? null" />
          <MxStat v-if="track.data.value.listenerCount" format="compact" :label="t('item.listeners')" :value="track.data.value.listenerCount" />
        </template>

        <template #actions>
          <RateButton :rating="stats.data.value?.viewerReview?.rating ?? null" size="lg" :target="target" variant="ink" />

          <MxButton
            data-testid="page-track-add-to-playlist"
            icon="mdi-playlist-plus"
            :label="t('item.addToPlaylist')"
            size="lg"
            variant="ink-outline"
            @click="addToPlaylist"
          />

          <FavoriteButton :id="props.id" kind="TRACK" :title="track.data.value.title" />

          <MxIconButton
            data-testid="page-track-share"
            icon="mdi-share-variant"
            :label="t('item.share')"
            size="lg"
            variant="ink"
            @click="share"
          />
        </template>
      </MxPageHero>

      <ul :aria-label="t('item.highlights')" class="story-grid">
        <li v-if="track.data.value.durationMs" v-reveal="{ variant: 'tilt', delay: 0 }">
          <MxStoryCard
            duotone="violet"
            icon="mdi-timer-outline"
            :label="t('track.cards.duration')"
            :sentence="durationSentence"
            :tilt="-2"
            :value="formatDuration(track.data.value.durationMs)"
          />
        </li>

        <li v-if="track.data.value.listenerCount" v-reveal="{ variant: 'tilt', delay: 90 }">
          <MxStoryCard
            duotone="green"
            icon="mdi-headphones"
            :label="t('item.listeners')"
            :sentence="t('item.listenersSentence')"
            :tilt="1.5"
            :value="formatCompactNumber(track.data.value.listenerCount, locale)"
          />
        </li>

        <li v-reveal="{ variant: 'tilt', delay: 180 }">
          <MxStoryCard
            duotone="burgundy"
            icon="mdi-account-group"
            :label="t('track.cards.people')"
            :sentence="t('track.cards.peopleSentence', { count: peopleCount })"
            :tilt="-1"
            :value="formatNumber(peopleCount, locale)"
          />
        </li>

        <li v-reveal="{ variant: 'tilt', delay: 270 }">
          <MxStoryCard
            duotone="navy"
            icon="mdi-album"
            :label="t('track.cards.appearsOn')"
            :sentence="t('track.cards.appearsOnSentence', { count: track.data.value.appearsOn.length })"
            :tilt="2"
            :value="formatNumber(track.data.value.appearsOn.length, locale)"
          />
        </li>
      </ul>

      <div class="page-columns">
        <div class="page-columns__main">
          <MxSection :description="track.data.value.work ? t('track.creditsDescriptionWork', { work: track.data.value.work.title }) : t('track.creditsDescription')" :title="t('track.credits')">
            <TrackCredits :credits="track.data.value.credits" :work="track.data.value.work" />
          </MxSection>

          <MxSection v-if="track.data.value.appearsOn.length > 0" :description="t('track.appearsOnDescription')" :title="t('track.appearsOn')">
            <ul class="track__appears">
              <li v-for="(release, index) in track.data.value.appearsOn" :key="release.id" v-reveal="{ variant: 'left', delay: Math.min(index, 10) * 40 }">
                <RouterLink class="track__release" data-testid="page-track-release" :to="albumRoute(release.id)">
                  <MxCover :seed="release.id" size="56px" sizes="56px" :title="release.title" />

                  <span class="track__release-text">
                    <strong>{{ release.title }}</strong>
                    <span>{{ cards.join([labels.releaseType(release.primaryType), formatPartialDate(release.firstReleaseDate, locale)]) }}</span>
                  </span>

                  <VIcon aria-hidden="true" icon="mdi-chevron-right" />
                </RouterLink>
              </li>
            </ul>
          </MxSection>

          <ItemReviewsSection
            :id="track.data.value.id"
            :description="t('track.reviewsDescription', { title: track.data.value.title })"
            :highlight-id="stats.data.value?.viewerReview?.id ?? null"
            :target="target"
            type="TRACK"
          />

          <WhenVisible v-if="track.data.value.artists[0]" min-height="260px">
            <MoreFromArtist :artist-id="track.data.value.artists[0].id" :artist-name="track.data.value.artists[0].name" :exclude-id="track.data.value.album?.id ?? undefined" />
          </WhenVisible>
        </div>

        <aside :aria-label="t('item.details')" class="page-columns__aside">
          <ItemStatsPanel :stats="stats.data.value" />
          <ListenPanel :links="track.data.value.links" />

          <MxGlass class="panel-stack" variant="panel">
            <h2 class="panel-title">{{ t('item.genres') }}</h2>

            <GenreChips
              :empty="t('item.noGenres')"
              :genres="track.data.value.genres"
              :label="t('item.genres')"
              :seed="track.data.value.id"
              size="sm"
            />
          </MxGlass>

          <MxGlass class="panel-stack" variant="panel">
            <h2 class="panel-title">{{ t('track.details') }}</h2>
            <MxDescriptionList :columns="1" :items="detailItems" />

            <div v-if="track.data.value.isrcs.length > 0" class="track__isrcs">
              <h3 class="track__isrc-title">{{ t('track.isrc', { count: track.data.value.isrcs.length }) }}</h3>

              <ul class="chip-row">
                <li v-for="isrc in track.data.value.isrcs" :key="isrc">
                  <MxChip
                    data-testid="page-track-isrc"
                    :href="isrcUrl(isrc)"
                    :label="isrc"
                    size="sm"
                    variant="filled"
                  />
                </li>
              </ul>

              <p class="muted track__isrc-hint">{{ t('track.isrcHint') }}</p>
            </div>
          </MxGlass>

          <SourceNote :source="track.data.value.source" />
        </aside>
      </div>
    </article>
  </PageState>
</template>

<script lang="ts" setup>
  import type { ComposerTarget } from '@/stores/composer'
  import type { DescriptionItem } from '@pedrolucaslopes/mixtape-ui'
  import {
    duotoneFor,
    formatCompactNumber,
    formatDuration,
    formatNumber,
    formatPartialDate,
    formatRatingValue,
    MxButton,
    MxChip,
    MxCover,
    MxDescriptionList,
    MxGlass,
    MxIconButton,
    MxPageHero,
    MxSection,
    MxStat,
    MxStoryCard,
    MxVinyl,
    vReveal,
    vTilt,
    yearOf,
  } from '@pedrolucaslopes/mixtape-ui'
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import ArtistLinks from '@/components/ArtistLinks.vue'
  import FavoriteButton from '@/components/FavoriteButton.vue'
  import GenreChips from '@/components/GenreChips.vue'
  import ItemReviewsSection from '@/components/ItemReviewsSection.vue'
  import ItemStatsPanel from '@/components/ItemStatsPanel.vue'
  import ListenPanel from '@/components/ListenPanel.vue'
  import MoreFromArtist from '@/components/MoreFromArtist.vue'
  import PageState from '@/components/PageState.vue'
  import RateButton from '@/components/RateButton.vue'
  import SourceNote from '@/components/SourceNote.vue'
  import TrackCredits from '@/components/TrackCredits.vue'
  import WhenVisible from '@/components/WhenVisible.vue'
  import { useAsyncData } from '@/composables/useAsyncData'
  import { useAuthAction } from '@/composables/useAuthAction'
  import { useCatalogCards } from '@/composables/useCatalogCards'
  import { useItemStats } from '@/composables/useItemStats'
  import { useLabels } from '@/composables/useLabels'
  import { useQuickShare } from '@/composables/useQuickShare'
  import { useSeo } from '@/composables/useSeo'
  import { isrcUrl, musicBrainzUrl } from '@/constants/sources'
  import { catalogApi } from '@/services/mixtape'
  import { usePlaylistPickerStore } from '@/stores/playlistPicker'
  import { albumRoute, coverSources } from '@/utils/items'

  const props = defineProps<{ id: string }>()

  const { t, locale } = useI18n()
  const labels = useLabels()
  const cards = useCatalogCards()
  const picker = usePlaylistPickerStore()
  const { requireAuth } = useAuthAction()
  const { share: quickShare } = useQuickShare()

  const track = useAsyncData(() => catalogApi.track(props.id), { watch: () => props.id })
  const stats = useItemStats('TRACK', () => props.id)

  const duotone = computed(() => duotoneFor(props.id))

  const target = computed<ComposerTarget>(() => ({
    type: 'TRACK',
    id: props.id,
    title: track.data.value?.title ?? '',
    artist: track.data.value?.artistCredit ?? null,
    cover: track.data.value?.cover?.medium ?? null,
    year: yearOf(track.data.value?.firstReleaseDate ?? null),
  }))

  const peopleCount = computed(() => {
    const value = track.data.value
    if (!value) return 0
    const ids = new Set([
      ...value.credits.map(credit => credit.artist.id),
      ...(value.work?.composers ?? []).map(artist => artist.id),
      ...(value.work?.lyricists ?? []).map(artist => artist.id),
      ...(value.work?.writers ?? []).map(artist => artist.id),
    ])
    return ids.size
  })

  const story = computed(() => {
    const value = track.data.value
    if (!value) return ''
    const released = formatPartialDate(value.firstReleaseDate, locale.value)
    const parts = [released ? t('track.story.released', { date: released }) : t('track.story.undated')]
    if (value.durationMs) parts.push(t('track.story.duration', { duration: formatDuration(value.durationMs) }))
    const text = `${parts.join(' · ')}.`
    return value.disambiguation ? `${text} (${value.disambiguation})` : text
  })

  const heroFacts = computed(() => {
    const value = track.data.value
    if (!value) return []
    const facts: Array<{ key: string, label: string, icon: string }> = []
    if (value.durationMs) facts.push({ key: 'duration', label: formatDuration(value.durationMs), icon: 'mdi-timer-outline' })
    const year = yearOf(value.firstReleaseDate)
    if (year) facts.push({ key: 'year', label: year, icon: 'mdi-calendar-blank' })
    if (value.work) facts.push({ key: 'work', label: t('track.workFact'), icon: 'mdi-music-clef-treble' })
    for (const genre of value.genres.slice(0, 2)) facts.push({ key: `genre-${genre}`, label: genre, icon: 'mdi-tag-outline' })
    return facts
  })

  const durationSentence = computed(() => {
    const ms = track.data.value?.durationMs
    if (!ms) return undefined
    return t('track.cards.durationSentence', { plays: formatNumber(Math.max(1, Math.floor(3_600_000 / ms)), locale.value) })
  })

  const detailItems = computed<DescriptionItem[]>(() => {
    const value = track.data.value
    if (!value) return []
    return [
      { term: t('track.detailsItems.album'), value: value.album?.title ?? null },
      { term: t('track.detailsItems.released'), value: formatPartialDate(value.firstReleaseDate, locale.value) },
      { term: t('track.detailsItems.duration'), value: value.durationMs ? formatDuration(value.durationMs) : null },
      { term: t('track.detailsItems.work'), value: value.work?.title ?? null, href: value.work ? musicBrainzUrl('work', value.work.id) : undefined },
      { term: t('track.detailsItems.version'), value: value.disambiguation },
      { term: t('track.detailsItems.source'), value: t('album.edition.openSource'), href: value.source.url },
    ].filter(item => item.value !== null && item.value !== undefined && item.value !== '')
  })

  function addToPlaylist (): void {
    if (!track.data.value || !requireAuth(t('playlists.signInToAdd'))) return
    void picker.start({ kind: 'TRACK', refId: track.data.value.id, label: track.data.value.title })
  }

  function share (): void {
    const value = track.data.value
    if (!value) return
    void quickShare(t('track.shareTitle', { title: value.title, artist: value.artistCredit }), t('track.shareText', { title: value.title, artist: value.artistCredit }))
  }

  useSeo(() => {
    const value = track.data.value
    if (!value) return { title: track.notFound.value ? t('track.notFound') : t('track.loading'), noindex: track.notFound.value }
    const average = stats.data.value?.averageRating
    return {
      title: t('track.seoTitle', { title: value.title, artist: value.artistCredit }),
      description: average === null || average === undefined
        ? t('track.seoDescription', { title: value.title, artist: value.artistCredit, album: value.album?.title ?? '—' })
        : t('track.seoDescriptionRated', { title: value.title, artist: value.artistCredit, rating: formatRatingValue(average, locale.value), count: stats.data.value?.reviewsCount ?? 0 }),
      image: value.cover?.large ?? null,
      type: 'music.song',
    }
  })
</script>

<style scoped>
.item-page__story {
  margin: 0 0 12px;
}

.track__media {
  position: relative;
}

.track__vinyl {
  position: absolute;
  right: -10%;
  bottom: -8%;
  z-index: 2;
}

.track__appears {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.track__release {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px 8px 8px;
  color: inherit;
  text-decoration: none;
  background: var(--mx-surface);
  border-radius: var(--mx-radius-md);
  transition:
    transform var(--mx-spring-bouncy-duration) var(--mx-spring-bouncy),
    background-color var(--mx-duration-fast) var(--mx-ease-out);
}

.track__release:hover {
  background: var(--mx-surface-variant);
  transform: translateX(4px);
}

.track__release:focus-visible {
  outline: 3px solid var(--mx-focus);
  outline-offset: 2px;
}

.track__release-text {
  display: grid;
  flex: 1;
  min-width: 0;
  gap: 2px;
}

.track__release-text strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track__release-text span {
  font-size: 0.8125rem;
  color: var(--mx-on-surface-muted);
}

.track__isrcs {
  display: grid;
  gap: 8px;
}

.track__isrc-title {
  margin: 0;
  font-size: var(--mx-text-overline);
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--mx-on-surface-muted);
}

.track__isrc-hint {
  margin: 0;
  font-size: 0.8125rem;
}

@media (prefers-reduced-motion: reduce) {
  .track__release,
  .track__release:hover {
    transition: none;
    transform: none;
  }
}
</style>
