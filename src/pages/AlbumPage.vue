<template>
  <PageState
    data-testid="page-album"
    :error="album.error.value"
    :loading="album.loading.value"
    :not-found="album.notFound.value"
    :not-found-description="t('album.notFoundDescription')"
    :not-found-title="t('album.notFound')"
    :ready="Boolean(album.data.value)"
    @retry="album.reload()"
  >
    <article v-if="album.data.value" class="page item-page">
      <MxPageHero
        decoration="flower"
        :duotone="duotone"
        :eyebrow="labels.releaseType(album.data.value.primaryType, album.data.value.secondaryTypes)"
        layout="split"
        :title="album.data.value.title"
      >
        <template #media>
          <div v-tilt="{ max: 8, glare: true }" class="hero-cover hero-cover--float">
            <MxCover
              priority
              :seed="album.data.value.id"
              sizes="(max-width: 840px) 80vw, 420px"
              :sources="coverSources(album.data.value.cover)"
              :title="album.data.value.title"
              vinyl
            />
          </div>
        </template>

        <template #subtitle>
          <ArtistLinks :artists="album.data.value.artists" :fallback="album.data.value.artistCredit" />
        </template>

        <template #story>
          <p class="item-page__story">{{ story }}</p>

          <ul class="hero-facts">
            <li v-for="fact in heroFacts" :key="fact.key">
              <VIcon v-if="fact.icon" aria-hidden="true" :icon="fact.icon" size="16" />
              <MxFlag v-if="fact.region" :region="fact.region" :size="16" />
              {{ fact.label }}
            </li>
          </ul>
        </template>

        <template #stats>
          <MxStat format="rating" :hint="stats.data.value?.averageRating === null ? t('item.noRatingYet') : undefined" :label="t('item.communityRating')" :value="stats.data.value?.averageRating ?? null" />
          <MxStat :label="t('item.reviewsCount')" :value="stats.data.value?.reviewsCount ?? null" />
          <MxStat v-if="album.data.value.listenerCount" format="compact" :label="t('item.listeners')" :value="album.data.value.listenerCount" />
        </template>

        <template #actions>
          <RateButton :rating="stats.data.value?.viewerReview?.rating ?? null" size="lg" :target="target" variant="ink" />

          <MxButton
            data-testid="page-album-add-to-playlist"
            icon="mdi-playlist-plus"
            :label="t('item.addToPlaylist')"
            size="lg"
            variant="ink-outline"
            @click="addToPlaylist"
          />

          <FavoriteButton :id="props.id" kind="ALBUM" :title="album.data.value.title" />

          <MxIconButton
            data-testid="page-album-share"
            icon="mdi-share-variant"
            :label="t('item.share')"
            size="lg"
            variant="ink"
            @click="share"
          />
        </template>
      </MxPageHero>

      <ul :aria-label="t('item.highlights')" class="story-grid">
        <li v-reveal="{ variant: 'tilt', delay: 0 }">
          <MxStoryCard
            duotone="lime"
            icon="mdi-playlist-music"
            :label="t('album.cards.tracks')"
            :sentence="album.data.value.totalDurationMs ? t('album.cards.tracksSentence', { duration: formatLongDuration(album.data.value.totalDurationMs, locale) }) : undefined"
            :tilt="-2"
            :value="formatNumber(album.data.value.trackCount, locale)"
          />
        </li>

        <li v-reveal="{ variant: 'tilt', delay: 90 }">
          <MxStoryCard
            duotone="pink"
            icon="mdi-earth"
            :label="t('album.cards.editions')"
            :sentence="t('album.cards.editionsSentence', { count: album.data.value.editionsCount })"
            :tilt="1.5"
            :value="formatNumber(album.data.value.editionsCount, locale)"
          />
        </li>

        <li v-if="album.data.value.listenerCount" v-reveal="{ variant: 'tilt', delay: 180 }">
          <MxStoryCard
            duotone="blue"
            icon="mdi-headphones"
            :label="t('item.listeners')"
            :sentence="t('item.listenersSentence')"
            :tilt="-1"
            :value="formatCompactNumber(album.data.value.listenerCount, locale)"
          />
        </li>

        <li v-reveal="{ variant: 'tilt', delay: 270 }">
          <MxStoryCard
            duotone="orange"
            icon="mdi-album"
            :label="t('item.communityRating')"
            :sentence="ratingSentence"
            :tilt="2"
            :value="stats.data.value?.averageRating === null || stats.data.value?.averageRating === undefined ? '—' : formatRatingValue(stats.data.value.averageRating, locale)"
          />
        </li>
      </ul>

      <div class="page-columns">
        <div class="page-columns__main">
          <MxSection
            :description="t('album.tracklistDescription', { count: album.data.value.trackCount, duration: album.data.value.totalDurationMs ? formatLongDuration(album.data.value.totalDurationMs, locale) : '—' })"
            :title="t('album.tracklist')"
          >
            <MxTrackList v-if="tracks.length > 0" :album-artist="album.data.value.artistCredit" :label="t('album.tracklist')" :tracks="tracks" />
            <p v-else class="muted">{{ t('album.noTracks') }}</p>
          </MxSection>

          <ItemReviewsSection
            :id="album.data.value.id"
            :description="t('album.reviewsDescription', { title: album.data.value.title })"
            :highlight-id="stats.data.value?.viewerReview?.id ?? null"
            :target="target"
            type="ALBUM"
          />

          <AdSlot placement="ALBUM_BOTTOM" />

          <WhenVisible v-if="album.data.value.artists[0]" min-height="260px">
            <MoreFromArtist :artist-id="album.data.value.artists[0].id" :artist-name="album.data.value.artists[0].name" :exclude-id="album.data.value.id" />
          </WhenVisible>
        </div>

        <aside :aria-label="t('item.details')" class="page-columns__aside">
          <ItemStatsPanel :stats="stats.data.value" />
          <ListenPanel :links="album.data.value.links" />

          <MxGlass class="panel-stack" variant="panel">
            <h2 class="panel-title">{{ t('item.genres') }}</h2>

            <GenreChips
              :empty="t('item.noGenres')"
              :genres="album.data.value.genres"
              :label="t('item.genres')"
              :seed="album.data.value.id"
              size="sm"
            />
          </MxGlass>

          <MxGlass v-if="album.data.value.edition" class="panel-stack" variant="panel">
            <h2 class="panel-title">{{ t('album.edition.title') }}</h2>
            <p class="muted album__edition-lead">{{ t('album.edition.lead', { count: album.data.value.editionsCount }) }}</p>
            <MxDescriptionList :columns="1" :items="editionItems" />
          </MxGlass>

          <AdSlot placement="ALBUM_SIDEBAR" variant="rectangle" />
          <SourceNote :source="album.data.value.source" />
        </aside>
      </div>
    </article>
  </PageState>
</template>

<script lang="ts" setup>
  import type { ComposerTarget } from '@/stores/composer'
  import type { DescriptionItem, TrackListEntry } from '@pedrolucaslopes/mixtape-ui'
  import {
    duotoneFor,
    formatCompactNumber,
    formatLongDuration,
    formatNumber,
    formatPartialDate,
    formatRatingValue,
    MxButton,
    MxCover,
    MxDescriptionList,
    MxFlag,
    MxGlass,
    MxIconButton,
    MxPageHero,
    MxSection,
    MxStat,
    MxStoryCard,
    MxTrackList,
    vReveal,
    vTilt,
    yearOf,
  } from '@pedrolucaslopes/mixtape-ui'
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import AdSlot from '@/components/AdSlot.vue'
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
  import WhenVisible from '@/components/WhenVisible.vue'
  import { useAsyncData } from '@/composables/useAsyncData'
  import { useAuthAction } from '@/composables/useAuthAction'
  import { useItemStats } from '@/composables/useItemStats'
  import { useLabels } from '@/composables/useLabels'
  import { useQuickShare } from '@/composables/useQuickShare'
  import { useSeo } from '@/composables/useSeo'
  import { musicBrainzUrl } from '@/constants/sources'
  import { catalogApi } from '@/services/mixtape'
  import { usePlaylistPickerStore } from '@/stores/playlistPicker'
  import { coverSources, trackRoute } from '@/utils/items'

  const props = defineProps<{ id: string }>()

  const { t, locale } = useI18n()
  const labels = useLabels()
  const picker = usePlaylistPickerStore()
  const { requireAuth } = useAuthAction()
  const { share: quickShare } = useQuickShare()

  const album = useAsyncData(() => catalogApi.album(props.id), { watch: () => props.id })
  const stats = useItemStats('ALBUM', () => props.id)

  const duotone = computed(() => duotoneFor(props.id))

  const target = computed<ComposerTarget>(() => ({
    type: 'ALBUM',
    id: props.id,
    title: album.data.value?.title ?? '',
    artist: album.data.value?.artistCredit ?? null,
    cover: album.data.value?.cover?.medium ?? null,
    year: yearOf(album.data.value?.firstReleaseDate ?? null),
  }))

  const tracks = computed<TrackListEntry[]>(() => (album.data.value?.tracks ?? []).map(track => ({
    id: track.id,
    title: track.title,
    number: track.number,
    disc: track.disc,
    durationMs: track.durationMs ?? null,
    artistCredit: track.artistCredit,
    to: trackRoute(track.id) as TrackListEntry['to'],
  })))

  const story = computed(() => {
    const value = album.data.value
    if (!value) return ''
    const released = formatPartialDate(value.firstReleaseDate, locale.value)
    const parts = [
      released ? t('album.story.released', { date: released }) : t('album.story.undated'),
      t('album.story.tracks', { count: value.trackCount, formatted: formatNumber(value.trackCount, locale.value) }),
    ]
    if (value.totalDurationMs) parts.push(t('album.story.duration', { duration: formatLongDuration(value.totalDurationMs, locale.value) }))
    if (value.editionsCount > 1) parts.push(t('album.story.editions', { count: value.editionsCount, formatted: formatNumber(value.editionsCount, locale.value) }))
    const text = `${parts.join(' · ')}.`
    return value.disambiguation ? `${text} (${value.disambiguation})` : text
  })

  const heroFacts = computed(() => {
    const value = album.data.value
    if (!value) return []
    const facts: Array<{ key: string, label: string, icon?: string, region?: string }> = []
    const year = yearOf(value.firstReleaseDate)
    if (year) facts.push({ key: 'year', label: year, icon: 'mdi-calendar-blank' })
    const label = value.edition?.labels[0]?.name
    if (label) facts.push({ key: 'label', label, icon: 'mdi-record-circle-outline' })
    const country = value.edition?.country
    if (country) facts.push({ key: 'country', label: labels.region(country) ?? country, region: country })
    for (const format of value.edition?.formats ?? []) facts.push({ key: `format-${format}`, label: format, icon: 'mdi-disc' })
    return facts
  })

  const ratingSentence = computed(() => {
    const value = stats.data.value
    if (!value || value.reviewsCount === 0) return t('item.beFirst')
    return t('item.ratingSentence', { count: value.reviewsCount, formatted: formatNumber(value.reviewsCount, locale.value) })
  })

  const editionItems = computed<DescriptionItem[]>(() => {
    const edition = album.data.value?.edition
    if (!edition) return []
    return [
      { term: t('album.edition.name'), value: edition.title },
      { term: t('album.edition.status'), value: edition.status ? labels.releaseStatus(edition.status) : null },
      { term: t('album.edition.date'), value: formatPartialDate(edition.date, locale.value) },
      { term: t('album.edition.country'), value: labels.region(edition.country) },
      { term: t('album.edition.labels'), value: edition.labels.map(item => item.name).join(', ') || null },
      { term: t('album.edition.catalogNumber'), value: edition.labels.map(item => item.catalogNumber).filter(Boolean).join(', ') || null, mono: true },
      { term: t('album.edition.formats'), value: edition.formats.join(', ') || null },
      { term: t('album.edition.packaging'), value: edition.packaging },
      { term: t('album.edition.language'), value: labels.language(edition.language) },
      { term: t('album.edition.barcode'), value: edition.barcode, mono: true },
      { term: t('album.edition.source'), value: t('album.edition.openSource'), href: musicBrainzUrl('release', edition.id) },
    ].filter(item => item.value !== null && item.value !== undefined && item.value !== '')
  })

  function addToPlaylist (): void {
    if (!album.data.value || !requireAuth(t('playlists.signInToAdd'))) return
    void picker.start({ kind: 'ALBUM', refId: album.data.value.id, label: album.data.value.title })
  }

  function share (): void {
    const value = album.data.value
    if (!value) return
    void quickShare(t('album.shareTitle', { title: value.title, artist: value.artistCredit }), t('album.shareText', { title: value.title, artist: value.artistCredit }))
  }

  useSeo(() => {
    const value = album.data.value
    if (!value) return { title: album.notFound.value ? t('album.notFound') : t('album.loading'), noindex: album.notFound.value }
    const average = stats.data.value?.averageRating
    return {
      title: t('album.seoTitle', { title: value.title, artist: value.artistCredit }),
      description: average === null || average === undefined
        ? t('album.seoDescription', { title: value.title, artist: value.artistCredit, year: yearOf(value.firstReleaseDate) ?? '—', count: value.trackCount })
        : t('album.seoDescriptionRated', { title: value.title, artist: value.artistCredit, rating: formatRatingValue(average, locale.value), count: stats.data.value?.reviewsCount ?? 0 }),
      image: value.cover?.large ?? null,
      type: 'music.album',
    }
  })
</script>

<style scoped>
.item-page__story {
  margin: 0 0 12px;
}

.album__edition-lead {
  margin: -6px 0 0;
  font-size: 0.875rem;
}
</style>
