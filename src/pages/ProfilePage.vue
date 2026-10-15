<template>
  <PageState
    data-testid="page-profile"
    :error="profile.error.value"
    :loading="profile.loading.value"
    :not-found="profile.notFound.value"
    :not-found-description="t('profile.notFoundDescription')"
    :not-found-title="t('profile.notFound')"
    :ready="Boolean(profile.data.value)"
    @retry="profile.reload()"
  >
    <article v-if="profile.data.value" class="page profile">
      <section aria-labelledby="profile-name" class="profile-hero" :style="heroStyle">
        <MxStarburst
          class="profile-hero__burst"
          :color="colors.accent"
          :ink="colors.ink"
          :points="12"
          shape="flower"
          size="min(60vw, 380px)"
          spin
        />

        <div class="profile-hero__identity">
          <div class="profile-hero__avatar">
            <MxAvatar
              :name="profile.data.value.fullName"
              :seed="profile.data.value.username"
              :size="168"
              :src="profile.data.value.avatarUrl"
              :tier="profile.data.value.disc.tier"
            />

            <MxDiscTier
              class="profile-hero__disc"
              :label="labels.tierLabel(profile.data.value.disc.tier, profile.data.value.disc.label)"
              :show-label="false"
              :size="72"
              spinning
              :tier="profile.data.value.disc.tier"
            />
          </div>

          <div class="profile-hero__copy">
            <p class="profile-hero__eyebrow">
              @{{ profile.data.value.username }} · {{ t('profile.memberSince', { date: formatDate(profile.data.value.memberSince, locale, { month: 'long', year: 'numeric' }) }) }}
            </p>

            <h1 id="profile-name" class="profile-hero__name mx-display">{{ profile.data.value.fullName }}</h1>

            <p class="profile-hero__tier">
              <VIcon aria-hidden="true" icon="mdi-album" size="20" />
              {{ labels.tierLabel(profile.data.value.disc.tier, profile.data.value.disc.label) }}
            </p>

            <p v-if="profile.data.value.bio" class="profile-hero__bio">{{ profile.data.value.bio }}</p>
            <p v-else-if="isMe" class="profile-hero__bio profile-hero__bio--empty">{{ t('profile.noBioMine') }}</p>

            <ul v-if="profile.data.value.favoriteGenres.length > 0" :aria-label="t('profile.favoriteGenres')" class="hero-facts">
              <li v-for="genre in profile.data.value.favoriteGenres" :key="genre">
                <VIcon aria-hidden="true" icon="mdi-heart" size="14" />
                {{ genre }}
              </li>
            </ul>

            <div class="profile-hero__actions">
              <MxButton
                v-if="isMe"
                data-testid="page-profile-edit"
                icon="mdi-account-edit"
                :label="t('profile.edit')"
                :to="{ name: ROUTE.settings }"
                variant="ink"
              />

              <MxButton
                data-testid="page-profile-share"
                icon="mdi-qrcode"
                :label="t('profile.share')"
                :variant="isMe ? 'ink-outline' : 'ink'"
                @click="shareProfile"
              />
            </div>
          </div>
        </div>

        <div class="profile-hero__stats">
          <MxStat :label="t('profile.stats.reviews')" :value="profile.data.value.stats.reviews" />
          <MxStat :label="t('profile.stats.albums')" :value="profile.data.value.stats.albums" />
          <MxStat :label="t('profile.stats.tracks')" :value="profile.data.value.stats.tracks" />
          <MxStat format="rating" :label="t('profile.stats.average')" :value="profile.data.value.stats.averageRating ?? null" />
          <MxStat :label="t('profile.stats.playlists')" :value="profile.data.value.stats.publicPlaylists" />
        </div>
      </section>

      <div class="profile__body" :class="{ 'profile__body--aside': discoverAside }">
        <div class="profile__favorites">
          <FavoritesShelf :is-me="isMe" :name="profile.data.value.fullName" :username="profile.data.value.username" />
        </div>

        <ul :aria-label="t('profile.highlights')" class="story-grid profile__beside">
          <li v-reveal="{ variant: 'tilt', delay: 0 }">
            <MxStoryCard
              duotone="lime"
              icon="mdi-album"
              :label="t('profile.cards.disc')"
              :sentence="discSentence"
              :tilt="-2"
              :value="labels.tierLabel(profile.data.value.disc.tier, profile.data.value.disc.label)"
            />
          </li>

          <li v-reveal="{ variant: 'tilt', delay: 90 }">
            <MxStoryCard
              duotone="pink"
              icon="mdi-star-circle"
              :label="t('profile.cards.average')"
              :sentence="t('profile.cards.averageSentence', { count: profile.data.value.stats.reviews })"
              :tilt="1.5"
              :value="profile.data.value.stats.averageRating === null ? '—' : formatRatingValue(profile.data.value.stats.averageRating, locale)"
            />
          </li>

          <li v-if="profile.data.value.topGenres[0]" v-reveal="{ variant: 'tilt', delay: 180 }">
            <MxStoryCard
              duotone="blue"
              icon="mdi-tag-heart"
              :label="t('profile.cards.topGenre')"
              :sentence="t('profile.cards.topGenreSentence', { count: profile.data.value.topGenres[0].count })"
              :tilt="-1"
              :value="profile.data.value.topGenres[0].genre"
            />
          </li>

          <li v-reveal="{ variant: 'tilt', delay: 270 }">
            <MxStoryCard
              duotone="orange"
              icon="mdi-podium"
              :label="t('profile.cards.ranking')"
              :sentence="profile.data.value.ranking.thisMonth ? t('profile.cards.rankingMonth', { position: t('common.position', { position: profile.data.value.ranking.thisMonth }) }) : t('profile.cards.rankingNoMonth')"
              :tilt="2"
              :value="profile.data.value.ranking.allTime ? t('common.position', { position: profile.data.value.ranking.allTime }) : '—'"
            />
          </li>

        </ul>

        <aside v-if="discoverAside" :aria-label="t('discover.title')" class="profile__aside">
          <DiscoverCard />
        </aside>

        <MxSection
          :description="isMe ? t('profile.progressDescription') : t('profile.scoresDescription')"
          :title="isMe ? t('profile.progress') : t('profile.scores')"
        >
          <ProgressPanel :disc="mine.data.value?.disc ?? null" :points="profile.data.value.points" :ranking="profile.data.value.ranking" />
        </MxSection>

        <MxSection
          :description="t('profile.recentDescription')"
          :more-label="t('profile.seeLibrary', { count: profile.data.value.stats.reviews })"
          :more-to="libraryRoute(profile.data.value.username)"
          :title="t('profile.recent')"
        >
          <div v-if="profile.data.value.recentAlbumReviews.length > 0" class="profile__recent">
            <MxSegmented
              v-model="recentView"
              class="profile__recent-view"
              data-testid="page-profile-recent-view"
              :label="t('profile.recentViewLabel')"
              :options="recentViewOptions"
              size="sm"
            />

            <MxRail v-if="recentView === 'rail'" :label="t('profile.recent')">
              <li v-for="(review, index) in profile.data.value.recentAlbumReviews" :key="review.id" v-reveal="{ variant: 'up', delay: Math.min(index, 6) * 60 }">
                <MxItemCard
                  :cover="review.item.coverUrl"
                  data-testid="page-profile-recent-review"
                  :kind="itemKind(review.item.type)"
                  :meta="relativeTime(review.createdAt, locale)"
                  :rating="review.rating"
                  :seed="review.item.id"
                  :subtitle="review.item.artistName"
                  :title="review.item.title"
                  :to="reviewRoute(review.id)"
                />
              </li>
            </MxRail>

            <MxCrate
              v-else
              v-model:pulled="recentPulled"
              data-testid="page-profile-recent-crate"
              :label="t('profile.recentCrate', { name: profile.data.value.fullName })"
              :records="recentRecords"
            >
              <template #pulled="{ record }">
                <CratePulledCard v-bind="recentPulledCard(record.key, record.title)" />
              </template>
            </MxCrate>
          </div>

          <MxEmptyState
            v-else
            compact
            duotone="green"
            :heading-level="3"
            icon="mdi-album"
            :title="isMe ? t('profile.noReviewsMine') : t('profile.noReviews')"
          >
            <MxButton
              v-if="isMe"
              data-testid="page-profile-rate"
              icon="mdi-album"
              :label="t('home.hero.rate')"
              :to="{ name: ROUTE.search, query: { rate: '1' } }"
            />
          </MxEmptyState>
        </MxSection>

        <MxSection v-if="isMe && !discoverAside" :description="t('discover.sentence')" :title="t('discover.title')">
          <DiscoverCard inline />
        </MxSection>

        <MxSection v-if="isMe" :description="t('listenLater.description')" :title="t('listenLater.title')">
          <ListenLaterCrate />
        </MxSection>

        <MxSection :description="isMe ? t('profile.galeraDescriptionMine') : t('profile.galeraDescription')" :title="t('profile.galera')">
          <WhenVisible min-height="200px">
            <GroupReviewList
              :empty-description="isMe ? t('profile.noGaleraMineHint') : undefined"
              :empty-title="isMe ? t('profile.noGaleraMine') : t('profile.noGalera')"
              :limit="PROFILE_GALERA"
              :loader="loadGalera"
              :skeletons="1"
              :watch-key="username"
            />
          </WhenVisible>
        </MxSection>

        <div class="profile__split">
          <MxGlass class="panel-stack" variant="panel">
            <h2 class="panel-title">{{ t('profile.distribution') }}</h2>

            <MxRatingHistogram
              :average="profile.data.value.stats.averageRating ?? null"
              :distribution="profile.data.value.ratingDistribution"
              :title="t('profile.distribution')"
              :total="profile.data.value.stats.reviews"
            />

            <p class="muted profile__hint">{{ ratingPersona }}</p>
          </MxGlass>

          <MxGlass class="panel-stack" variant="panel">
            <h2 class="panel-title">{{ t('profile.topGenres') }}</h2>

            <MxBarList
              v-if="genreBars.length > 0"
              :items="genreBars"
              :label="t('profile.topGenres')"
              numbered
            />

            <p v-else class="muted">{{ t('profile.noGenres') }}</p>
          </MxGlass>
        </div>

        <MxSection :description="t('profile.badgesDescription')" :title="t('profile.badges', { count: earnedBadges.length })">
          <BadgeGrid :badges="earnedBadges" :empty="isMe ? t('profile.noBadgesMine') : t('profile.noBadges')" :label="t('profile.badgesEarned')" />

          <template v-if="lockedBadges.length > 0">
            <h3 class="profile__subtitle">{{ t('profile.nextBadges') }}</h3>
            <BadgeGrid :badges="lockedBadges" :empty="''" :label="t('profile.nextBadges')" size="sm" />
          </template>
        </MxSection>

        <MxSection :description="t('profile.awardsDescription')" :more-to="{ name: ROUTE.awards }" :title="t('profile.awards')">
          <AwardHistory :awards="profile.data.value.awards" :empty="t('profile.noAwards')" :label="t('profile.awards')" />
        </MxSection>

        <div class="profile__split">
          <MxGlass class="profile__links" variant="panel">
            <h2 class="panel-title">{{ t('profile.collections') }}</h2>

            <RouterLink class="profile__link" data-testid="page-profile-library" :to="libraryRoute(profile.data.value.username)">
              <VIcon aria-hidden="true" icon="mdi-bookshelf" />

              <span>
                <strong>{{ t('profile.library') }}</strong>
                <span>{{ t('profile.libraryCount', { count: profile.data.value.stats.reviews }) }}</span>
              </span>

              <VIcon aria-hidden="true" icon="mdi-chevron-right" />
            </RouterLink>

            <RouterLink class="profile__link" data-testid="page-profile-playlists" :to="{ name: ROUTE.userPlaylists, params: { username: profile.data.value.username } }">
              <VIcon aria-hidden="true" icon="mdi-playlist-music" />

              <span>
                <strong>{{ t('profile.playlists') }}</strong>
                <span>{{ t('profile.playlistsCount', { count: profile.data.value.publicPlaylists }) }}</span>
              </span>

              <VIcon aria-hidden="true" icon="mdi-chevron-right" />
            </RouterLink>
          </MxGlass>

          <MxGlass class="profile__qr" variant="panel">
            <h2 class="panel-title">{{ t('profile.qrTitle') }}</h2>
            <p class="muted">{{ t('profile.qrText') }}</p>

            <MxQrCode
              :alt="t('share.qrAlt', { username: profile.data.value.username })"
              :download-name="`mixtape-${profile.data.value.username}`"
              :png="qrCodePath(profile.data.value.username, 'png')"
              :size="180"
              :svg="qrCodePath(profile.data.value.username, 'svg')"
            />

            <p class="profile__url">{{ profile.data.value.share.profileUrl }}</p>
          </MxGlass>
        </div>
      </div>

      <AdSlot placement="PROFILE_BOTTOM" />
    </article>
  </PageState>
</template>

<script lang="ts" setup>
  import type { BadgeProgress, EarnedBadge } from '@/types/api'
  import type { BarListItem, CrateRecord, SegmentedOption } from '@pedrolucaslopes/mixtape-ui'
  import {
    duotoneFor,
    duotones,
    formatDate,
    formatRatingValue,
    MxAvatar,
    MxBarList,
    MxButton,
    MxCrate,
    MxDiscTier,
    MxEmptyState,
    MxGlass,
    MxItemCard,
    MxQrCode,
    MxRail,
    MxRatingHistogram,
    MxSection,
    MxSegmented,
    MxStarburst,
    MxStat,
    MxStoryCard,
    relativeTime,
    vReveal,
    yearOf,
  } from '@pedrolucaslopes/mixtape-ui'
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import { useDisplay } from 'vuetify'
  import AdSlot from '@/components/AdSlot.vue'
  import AwardHistory from '@/components/AwardHistory.vue'
  import BadgeGrid from '@/components/BadgeGrid.vue'
  import CratePulledCard from '@/components/CratePulledCard.vue'
  import DiscoverCard from '@/components/DiscoverCard.vue'
  import FavoritesShelf from '@/components/FavoritesShelf.vue'
  import GroupReviewList from '@/components/GroupReviewList.vue'
  import ListenLaterCrate from '@/components/ListenLaterCrate.vue'
  import PageState from '@/components/PageState.vue'
  import ProgressPanel from '@/components/ProgressPanel.vue'
  import WhenVisible from '@/components/WhenVisible.vue'
  import { useAsyncData } from '@/composables/useAsyncData'
  import { useLabels } from '@/composables/useLabels'
  import { useSeo } from '@/composables/useSeo'
  import { PROFILE_GALERA, qrCodePath } from '@/constants/api'
  import { ROUTE } from '@/router/routes'
  import { gamificationApi, groupReviewsApi, profilesApi } from '@/services/mixtape'
  import { useComposerStore } from '@/stores/composer'
  import { useSessionStore } from '@/stores/session'
  import { useShareStore } from '@/stores/share'
  import { itemKind, libraryRoute, reviewRoute } from '@/utils/items'
  import { queryEnum } from '@/utils/navigation'

  const RECENT_VIEWS = ['rail', 'crate'] as const
  type RecentView = typeof RECENT_VIEWS[number]

  const props = defineProps<{ username: string }>()

  const { t, locale } = useI18n()
  const labels = useLabels()
  const session = useSessionStore()
  const composer = useComposerStore()
  const share = useShareStore()

  const isMe = computed(() => session.user?.username === props.username)

  const profile = useAsyncData(() => profilesApi.get(props.username), { watch: () => [props.username, composer.version] })
  /** O progresso (disco e badges, até as que faltam) é só do dono; dos outros, o perfil traz só o conquistado. */
  const mine = useAsyncData(
    () => (isMe.value ? gamificationApi.myProgress().catch(() => null) : Promise.resolve(null)),
    { watch: () => [props.username, isMe.value, composer.version] },
  )

  const { lgAndUp } = useDisplay()
  /** Descubra é só do dono: ao lado dos destaques em tela larga; nas outras, uma seção depois das avaliações recentes. */
  const discoverAside = computed(() => isMe.value && lgAndUp.value)

  const route = useRoute()
  const router = useRouter()

  const recentView = computed<RecentView>({
    get: () => queryEnum(route.query.view, RECENT_VIEWS, 'rail'),
    set: value => {
      void router.replace({ query: { ...route.query, view: value === 'rail' ? undefined : value } })
    },
  })

  const recentViewOptions = computed<SegmentedOption<RecentView>[]>(() => [
    { value: 'rail', label: t('profile.recentViews.rail'), icon: 'mdi-view-carousel-outline' },
    { value: 'crate', label: t('profile.recentViews.crate'), icon: 'mdi-layers-outline' },
  ])

  const recentPulled = ref<string | null>(null)

  const recentRecords = computed<CrateRecord[]>(() => (profile.data.value?.recentAlbumReviews ?? []).map(review => ({
    key: review.id,
    title: review.item.title,
    subtitle: review.item.artistName ?? null,
    cover: review.item.coverUrl ?? null,
    seed: review.item.id,
  })))

  function recentPulledCard (key: string, title: string) {
    const review = profile.data.value?.recentAlbumReviews.find(entry => entry.id === key)
    if (!review) return { id: key, kind: 'ALBUM' as const, title, listenLater: false }
    return {
      id: review.item.id,
      kind: review.item.type,
      title: review.item.title,
      subtitle: review.item.artistName ?? null,
      meta: relativeTime(review.createdAt, locale.value),
      metaIcon: 'mdi-clock-outline',
      rating: review.rating,
      reviewTo: reviewRoute(review.id),
      cover: review.item.coverUrl ?? null,
      year: yearOf(review.item.releaseDate ?? null),
      listenLater: !isMe.value,
    }
  }

  watch(() => props.username, () => {
    recentPulled.value = null
  })

  function loadGalera (page: number, limit: number) {
    return groupReviewsApi.ofUser(props.username, { page, limit })
  }
  const colors = computed(() => duotones[duotoneFor(props.username)])
  const heroStyle = computed(() => ({ '--mx-hero-bg': colors.value.background, '--mx-hero-ink': colors.value.ink }))

  const earnedBadges = computed<readonly (BadgeProgress | EarnedBadge)[]>(() => {
    const all = mine.data.value?.badges
    return all ? all.filter(badge => badge.tier > 0) : (profile.data.value?.badges ?? [])
  })

  const lockedBadges = computed(() => (mine.data.value?.badges ?? []).filter(badge => badge.tier === 0))

  const genreBars = computed<BarListItem[]>(() => (profile.data.value?.topGenres ?? []).map(entry => ({
    key: entry.genre,
    label: entry.genre,
    value: entry.count,
    to: { name: ROUTE.search, query: { q: entry.genre } },
  })))

  const discSentence = computed(() => {
    const disc = mine.data.value?.disc
    if (!disc) return undefined
    return disc.next
      ? t('profile.cards.discNext', { count: disc.next.remaining, next: labels.tierLabel(disc.next.tier, disc.next.label) })
      : t('profile.cards.discTop')
  })

  const ratingPersona = computed(() => {
    const average = profile.data.value?.stats.averageRating
    if (average === null || average === undefined) return t('profile.persona.none')
    if (average >= 4) return t('profile.persona.generous')
    if (average >= 3) return t('profile.persona.balanced')
    return t('profile.persona.tough')
  })

  function shareProfile (): void {
    void share.start({ kind: 'profile', username: props.username }, t('profile.shareTitle'))
  }

  useSeo(() => {
    const value = profile.data.value
    if (!value) return { title: profile.notFound.value ? t('profile.notFound') : t('profile.loading'), noindex: profile.notFound.value }
    return {
      title: t('profile.seoTitle', { name: value.fullName, username: value.username }),
      description: value.bio ?? t('profile.seoDescription', { name: value.fullName, count: value.stats.reviews, tier: labels.tierLabel(value.disc.tier, value.disc.label) }),
      image: value.avatarUrl,
      type: 'profile',
    }
  })
</script>

<style scoped>
.profile-hero {
  position: relative;
  isolation: isolate;
  display: grid;
  gap: clamp(24px, 4vw, 40px);
  padding: clamp(24px, 5vw, 56px);
  overflow: hidden;
  color: var(--mx-hero-ink);
  background: var(--mx-hero-bg);
  border-radius: var(--mx-radius-xl);
  animation: profile-in var(--mx-spring-smooth-duration) var(--mx-spring-smooth) both;
}

.profile-hero__burst {
  position: absolute;
  top: -16%;
  right: -10%;
  z-index: -1;
  opacity: 0.9;
}

.profile-hero__identity {
  display: grid;
  gap: 24px;
  align-items: center;
}

@media (min-width: 840px) {
  .profile-hero__identity {
    grid-template-columns: auto minmax(0, 1fr);
  }
}

.profile-hero__avatar {
  position: relative;
  justify-self: start;
  animation: mx-pop-in var(--mx-spring-pop-duration) var(--mx-spring-pop) 120ms both;
}

.profile-hero__disc {
  position: absolute;
  right: -14px;
  bottom: -6px;
}

.profile-hero__copy {
  display: grid;
  justify-items: start;
  gap: 10px;
  min-width: 0;
}

.profile-hero__eyebrow {
  margin: 0;
  font-size: var(--mx-text-overline);
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.profile-hero__name {
  margin: 0;
  font-size: var(--mx-text-display-xl);
  overflow-wrap: anywhere;
}

.profile-hero__tier {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-weight: 800;
}

.profile-hero__bio {
  max-width: 60ch;
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 600;
  line-height: 1.55;
  white-space: pre-line;
}

.profile-hero__bio--empty {
  opacity: 0.8;
}

.profile-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
}

.profile-hero__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  padding-top: 20px;
  border-top: 2px solid color-mix(in srgb, var(--mx-hero-ink) 22%, transparent);
}

.profile__split {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr));
  gap: clamp(20px, 3vw, 32px);
  align-items: start;
}

.profile__body {
  display: grid;
  gap: clamp(36px, 6vw, 72px);
  min-width: 0;
}

.profile__body--aside {
  grid-template-columns: minmax(0, 3fr) minmax(300px, 2fr);
  column-gap: clamp(20px, 2.4vw, 32px);
}

.profile__body--aside > * {
  grid-column: 1 / -1;
}

.profile__body--aside > .profile__beside {
  grid-column: 1;
}

.profile__body--aside > .story-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.profile__body--aside > .profile__aside {
  display: grid;
  grid-column: 2;
  min-width: 0;
}

.profile__favorites {
  min-width: 0;
}

.profile__recent {
  display: grid;
  gap: 16px;
  min-width: 0;
}

.profile__recent-view {
  justify-self: start;
}

.profile__hint {
  margin: 0;
  font-size: 0.9375rem;
}

.profile__subtitle {
  margin: 12px 0 0;
  font-family: var(--mx-font-display);
  font-size: var(--mx-text-h3);
  font-weight: 800;
}

.profile__links,
.profile__qr {
  display: grid;
  gap: 12px;
}

.profile__qr {
  justify-items: start;
}

.profile__qr p {
  margin: 0;
}

.profile__url {
  font-family: var(--mx-font-mono);
  font-size: 0.8125rem;
  word-break: break-all;
  color: var(--mx-on-surface-muted);
}

.profile__link {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  color: inherit;
  text-decoration: none;
  background: var(--mx-surface);
  border-radius: var(--mx-radius-md);
  transition: transform var(--mx-spring-bouncy-duration) var(--mx-spring-bouncy);
}

.profile__link:hover {
  transform: translateX(4px);
}

.profile__link:focus-visible {
  outline: 3px solid var(--mx-focus);
  outline-offset: 2px;
}

.profile__link > span {
  display: grid;
}

.profile__link > span > span {
  font-size: 0.875rem;
  color: var(--mx-on-surface-muted);
}

@keyframes profile-in {
  from { transform: translate3d(0, 24px, 0) scale(0.98); }
  to { transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .profile-hero,
  .profile-hero__avatar {
    animation: none;
  }

  .profile__link,
  .profile__link:hover {
    transition: none;
    transform: none;
  }
}
</style>
