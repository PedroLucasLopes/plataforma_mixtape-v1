<template>
  <div class="page home" data-testid="page-home">
    <section aria-labelledby="home-title" class="home-hero">
      <div class="home-hero__copy">
        <p class="home-hero__eyebrow">{{ greeting }}</p>

        <h1 id="home-title" class="home-hero__title">
          <span v-for="(word, index) in heroWords" :key="index" class="home-hero__word" :style="{ animationDelay: `${120 + index * 70}ms` }">{{ word }}</span>
        </h1>

        <p class="home-hero__lead">{{ t('home.hero.lead') }}</p>

        <div class="home-hero__actions">
          <MxButton
            data-testid="page-home-rate"
            icon="mdi-album"
            :label="t('home.hero.rate')"
            size="lg"
            :to="session.isAuthenticated ? { name: ROUTE.search, query: { rate: '1' } } : { name: ROUTE.register }"
          />

          <MxButton
            data-testid="page-home-charts"
            icon="mdi-chart-box-outline"
            :label="t('home.hero.charts')"
            size="lg"
            :to="{ name: ROUTE.charts }"
            variant="glass"
          />
        </div>
      </div>

      <div aria-hidden="true" class="home-hero__stage">
        <MxStarburst
          class="home-hero__burst"
          color="var(--mx-cta)"
          ink="var(--mx-on-cta)"
          :points="16"
          shape="sun"
          size="min(80vw, 440px)"
          spin
        />

        <MxVinyl
          class="home-hero__vinyl"
          finish="black"
          label-color="var(--mx-secondary)"
          :size="260"
          spinning
        />

        <div
          v-for="(cover, index) in heroCovers"
          :key="cover.id"
          v-tilt="{ max: 10, glare: true }"
          class="home-hero__cover"
          :class="`home-hero__cover--${index + 1}`"
        >
          <MxCover
            :priority="index === 0"
            :seed="cover.id"
            sizes="220px"
            :src="cover.coverUrl"
            :title="cover.title"
          />
        </div>
      </div>
    </section>

    <MxMarquee
      v-if="genreMarquee.length > 0"
      class="home__marquee"
      duotone="lime"
      :items="genreMarquee"
      :label="t('home.genresLabel')"
      size="lg"
      :tilt="-2"
    />

    <AdSlot placement="HOME_TOP" />

    <section v-if="session.isAuthenticated && progress.data.value" aria-labelledby="home-progress-title" class="home__progress">
      <div class="toolbar">
        <h2 id="home-progress-title" class="panel-title">{{ t('home.progressTitle') }}</h2>
        <span class="toolbar__spacer" />
        <RouterLink class="link-strong" data-testid="page-home-my-profile-link" :to="{ name: ROUTE.myProfile }">{{ t('home.seeProfile') }}</RouterLink>
      </div>

      <ProgressPanel :disc="progress.data.value.disc" :points="progress.data.value.points" :ranking="progress.data.value.ranking" />
    </section>

    <MxSection
      :description="t('home.trending.description')"
      :eyebrow="labels.period(period)"
      :more-label="t('home.trending.more')"
      :more-to="{ name: ROUTE.charts, query: { source: 'mixtape' } }"
      :title="t('home.trending.title')"
    >
      <template #actions>
        <MxSegmented
          v-model="period"
          data-testid="page-home-period"
          :label="t('filters.period')"
          :options="periodOptions"
          size="sm"
        />
      </template>

      <HomeRail
        :empty="t('home.trending.empty')"
        :error="trendingAlbums.error.value"
        :items="trendingAlbums.data.value"
        :label="t('home.trending.albums')"
        :loading="trendingAlbums.loading.value"
        @retry="trendingAlbums.reload()"
      >
        <template #default="{ item, index }">
          <MxItemCard
            v-bind="cards.summary(item.item)"
            :badge="index === 0 ? t('home.trending.top') : null"
            :meta="t('home.trending.meta', { count: item.reviewsCount, formatted: formatNumber(item.reviewsCount, locale) })"
            :position="index + 1"
            :rating="item.averageRating ?? null"
          />
        </template>
      </HomeRail>
    </MxSection>

    <MxSection :description="t('home.tracks.description')" :more-to="{ name: ROUTE.charts, query: { source: 'mixtape', kind: 'tracks' } }" :title="t('home.tracks.title')">
      <HomeRail
        :empty="t('home.trending.empty')"
        :error="trendingTracks.error.value"
        :items="trendingTracks.data.value"
        :label="t('home.tracks.title')"
        :loading="trendingTracks.loading.value"
        @retry="trendingTracks.reload()"
      >
        <template #default="{ item, index }">
          <MxItemCard
            v-bind="cards.summary(item.item)"
            :meta="t('home.trending.meta', { count: item.reviewsCount, formatted: formatNumber(item.reviewsCount, locale) })"
            :position="index + 1"
            :rating="item.averageRating ?? null"
          />
        </template>
      </HomeRail>
    </MxSection>

    <MxSection :description="t('home.world.description')" :eyebrow="t('home.world.eyebrow')" :more-to="{ name: ROUTE.charts }" :title="t('home.world.title')">
      <HomeRail
        :empty="t('home.world.empty')"
        :error="worldChart.error.value"
        :items="worldChart.data.value"
        :label="t('home.world.title')"
        :loading="worldChart.loading.value"
        @retry="worldChart.reload()"
      >
        <template #default="{ item }">
          <MxItemCard
            v-bind="cards.album(item.item)"
            :listeners="null"
            :meta="labels.chartListeners(item)"
            :position="item.position"
          />
        </template>
      </HomeRail>
    </MxSection>

    <div class="home__split">
      <MxSection :description="t('home.reviews.description')" :more-to="{ name: ROUTE.reviews }" :title="t('home.reviews.title')">
        <ReviewList
          :empty-description="t('home.reviews.emptyDescription')"
          :empty-title="t('home.reviews.empty')"
          :limit="HOME_REVIEWS"
          :loader="loadLatestReviews"
          :paginate="false"
        />

        <AdSlot placement="HOME_FEED" variant="inline" />
      </MxSection>

      <div class="home__side">
        <MxGlass class="home-card" variant="panel">
          <div class="toolbar">
            <h2 class="panel-title">{{ t('home.ranking.title') }}</h2>
            <span class="toolbar__spacer" />
            <RouterLink class="link-strong" data-testid="page-home-rankings-link" :to="{ name: ROUTE.rankings }">{{ t('common.seeAll') }}</RouterLink>
          </div>

          <p class="muted home-card__lead">{{ t('home.ranking.description') }}</p>
          <MxSkeleton v-if="ranking.loading.value && !ranking.data.value" height="220px" />

          <template v-else-if="ranking.data.value?.items.length">
            <MxPodium :entries="podium" :label="t('home.ranking.title')" />

            <ol class="numbered-list">
              <MxRankRow
                v-for="entry in ranking.data.value.items.filter(item => item.position > 3)"
                :key="entry.user.id"
                :avatar-url="entry.user.avatarUrl"
                data-testid="page-home-rank-row"
                :highlight="entry.user.id === session.user?.id"
                :name="entry.user.fullName"
                :notoriety="entry.notoriety"
                :participation="entry.participation"
                :position="entry.position"
                :tier="entry.user.disc.tier"
                :tier-label="labels.tierLabel(entry.user.disc.tier, entry.user.disc.label)"
                :to="profileRoute(entry.user.username)"
                :total="entry.total"
                :username="entry.user.username"
              />
            </ol>
          </template>

          <p v-else class="muted">{{ t('rankings.emptyDescription') }}</p>
        </MxGlass>

        <MxGlass class="home-card" variant="panel">
          <div class="toolbar">
            <h2 class="panel-title">{{ t('home.awards.title') }}</h2>
            <span class="toolbar__spacer" />
            <RouterLink class="link-strong" data-testid="page-home-awards-link" :to="{ name: ROUTE.awards }">{{ t('common.seeAll') }}</RouterLink>
          </div>

          <p class="muted home-card__lead">
            {{ awards.data.value?.period ? t('home.awards.period', { period: formatPeriod(awards.data.value.period) }) : t('home.awards.description') }}
          </p>

          <MxSkeleton v-if="awards.loading.value && !awards.data.value" height="200px" />

          <ul v-else-if="awardWinners.length > 0" class="home-awards">
            <li v-for="winner in awardWinners" :key="winner.category" class="home-awards__item" :style="winner.style">
              <span aria-hidden="true" class="home-awards__icon"><VIcon :icon="winner.icon" /></span>

              <span class="home-awards__text">
                <span class="home-awards__category">{{ winner.name }}</span>
                <RouterLink class="home-awards__winner" data-testid="page-home-winner" :to="profileRoute(winner.username)">{{ winner.fullName }}</RouterLink>
              </span>

              <MxAvatar
                decorative
                :name="winner.fullName"
                :seed="winner.username"
                :size="40"
                :src="winner.avatarUrl"
                :tier="winner.tier"
              />
            </li>
          </ul>

          <p v-else class="muted">{{ t('awards.empty') }}</p>
        </MxGlass>
      </div>
    </div>

    <MxSection :description="t('home.playlists.description')" :more-to="{ name: ROUTE.playlists }" :title="t('home.playlists.title')">
      <HomeRail
        :empty="t('playlists.empty')"
        :error="playlists.error.value"
        item-width="clamp(160px, 44vw, 230px)"
        :items="playlists.data.value?.items ?? null"
        :label="t('home.playlists.title')"
        :loading="playlists.loading.value"
        @retry="playlists.reload()"
      >
        <template #default="{ item }">
          <PlaylistCard :playlist="item" />
        </template>
      </HomeRail>
    </MxSection>

    <section v-if="rules.rules" aria-labelledby="home-tiers-title" class="home-tiers">
      <div class="home-tiers__copy">
        <p class="page-header__eyebrow">{{ t('home.tiers.eyebrow') }}</p>
        <h2 id="home-tiers-title" class="home-tiers__title mx-display">{{ t('home.tiers.title') }}</h2>
        <p class="home-tiers__lead">{{ t('home.tiers.description') }}</p>

        <MxButton
          data-testid="page-home-more"
          icon="mdi-help-circle-outline"
          :label="t('home.tiers.more')"
          :to="{ name: ROUTE.howItWorks }"
          variant="ink"
        />
      </div>

      <ol class="home-tiers__list">
        <li v-for="(tier, index) in rules.rules.discTiers" :key="tier.tier" v-reveal="{ variant: 'pop', delay: index * 90 }" class="home-tiers__tier">
          <MxDiscTier :label="labels.tierLabel(tier.tier, tier.label)" :show-label="false" :size="84" :tier="tier.tier" />
          <span class="home-tiers__name">{{ labels.tierLabel(tier.tier, tier.label) }}</span>
          <span class="home-tiers__min">{{ t('home.tiers.min', { count: tier.minReviews, formatted: formatNumber(tier.minReviews, locale) }) }}</span>
        </li>
      </ol>
    </section>

    <section v-if="!session.isAuthenticated" aria-labelledby="home-cta-title" class="home-cta">
      <MxBlob class="home-cta__blob" :color="ctaColors.accent" :size="BLOB_SIZE.homeCta" />
      <h2 id="home-cta-title" class="home-cta__title mx-display">{{ t('home.cta.title') }}</h2>
      <p class="home-cta__lead">{{ t('home.cta.description') }}</p>

      <div class="home-hero__actions">
        <MxButton
          data-testid="page-home-create-account"
          icon="mdi-account-plus"
          :label="t('auth.createAccount')"
          size="lg"
          :to="{ name: ROUTE.register }"
          variant="ink"
        />

        <MxButton
          data-testid="page-home-sign-in"
          :label="t('auth.signIn')"
          size="lg"
          :to="{ name: ROUTE.login }"
          variant="ink-outline"
        />
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
  import type { ItemSummary, Period } from '@/types/api'
  import type { PodiumEntry } from '@pedrolucaslopes/mixtape-ui'
  import {
    duotones,
    formatNumber,
    MxAvatar,
    MxBlob,
    MxButton,
    MxCover,
    MxDiscTier,
    MxGlass,
    MxItemCard,
    MxMarquee,
    MxPodium,
    MxRankRow,
    MxSection,
    MxSegmented,
    MxSkeleton,
    MxStarburst,
    MxVinyl,
    vReveal,
    vTilt,
  } from '@pedrolucaslopes/mixtape-ui'
  import { computed, onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import AdSlot from '@/components/AdSlot.vue'
  import HomeRail from '@/components/HomeRail.vue'
  import PlaylistCard from '@/components/PlaylistCard.vue'
  import ProgressPanel from '@/components/ProgressPanel.vue'
  import ReviewList from '@/components/ReviewList.vue'
  import { useAsyncData } from '@/composables/useAsyncData'
  import { useCatalogCards } from '@/composables/useCatalogCards'
  import { useLabels } from '@/composables/useLabels'
  import { usePeriod } from '@/composables/usePeriod'
  import { useSeo } from '@/composables/useSeo'
  import { HOME_GENRES, HOME_RANKING, HOME_REVIEWS, RAIL_SIZE } from '@/constants/api'
  import { BLOB_SIZE } from '@/constants/decor'
  import { AWARD_STYLE } from '@/constants/gamification'
  import { ROUTE } from '@/router/routes'
  import { catalogApi, gamificationApi, playlistsApi, reviewsApi } from '@/services/mixtape'
  import { useGenresStore } from '@/stores/genres'
  import { useRulesStore } from '@/stores/rules'
  import { useSessionStore } from '@/stores/session'
  import { profileRoute } from '@/utils/items'

  const { t, locale } = useI18n()
  const labels = useLabels()
  const cards = useCatalogCards()
  const session = useSessionStore()
  const genres = useGenresStore()
  const rules = useRulesStore()
  const { formatPeriod, periodOptions } = usePeriod()

  const period = ref<Period>('week')

  const trendingAlbums = useAsyncData(() => reviewsApi.trending('ALBUM', period.value, RAIL_SIZE), { watch: period })
  const trendingTracks = useAsyncData(() => reviewsApi.trending('TRACK', period.value, RAIL_SIZE), { watch: period })
  const worldChart = useAsyncData(() => catalogApi.albumChart('week', RAIL_SIZE))
  const ranking = useAsyncData(() => gamificationApi.rankings('overall', 'month', { page: 1, limit: HOME_RANKING }))
  const awards = useAsyncData(() => gamificationApi.awards())
  const playlists = useAsyncData(() => playlistsApi.explore({ page: 1, limit: RAIL_SIZE }))
  const progress = useAsyncData(
    () => (session.isAuthenticated ? gamificationApi.myProgress() : Promise.resolve(null)),
    { watch: () => session.isAuthenticated },
  )

  onMounted(() => {
    void genres.load().catch(() => undefined)
    void rules.load()
  })

  function momentOfDay (hour: number): 'morning' | 'afternoon' | 'night' {
    if (hour >= 5 && hour < 12) {
      return 'morning'
    }
    return hour >= 12 && hour < 18 ? 'afternoon' : 'night'
  }

  const greeting = computed(() => {
    const name = session.user?.fullName.split(' ', 1)[0]
    return name ? t(`home.greeting.${momentOfDay(new Date().getHours())}`, { name }) : t('home.hero.eyebrow')
  })

  const heroWords = computed(() => t('home.hero.title').split(/(\s+)/).filter(part => part.trim().length > 0))

  const heroCovers = computed<ItemSummary[]>(() => (trendingAlbums.data.value ?? [])
    .map(entry => entry.item)
    .filter(item => item.coverUrl)
    .slice(0, 3))

  const genreMarquee = computed(() => genres.genres.slice(0, HOME_GENRES))

  const podium = computed<PodiumEntry[]>(() => (ranking.data.value?.items ?? []).filter(entry => entry.position <= 3).map(entry => ({
    key: entry.user.id,
    position: entry.position,
    name: entry.user.fullName,
    caption: `@${entry.user.username}`,
    avatarUrl: entry.user.avatarUrl,
    seed: entry.user.username,
    tier: entry.user.disc.tier,
    score: t('rankings.points', { points: formatNumber(entry.total, locale.value) }),
    to: profileRoute(entry.user.username) as PodiumEntry['to'],
  })))

  const awardWinners = computed(() => (awards.data.value?.categories ?? []).flatMap(category => {
    const winner = category.podium.find(award => award.position === 1)
    if (!winner) return []
    const style = AWARD_STYLE[category.category] ?? { icon: 'mdi-trophy', duotone: 'lime' as const }
    const colors = duotones[style.duotone]
    return [{
      category: category.category,
      name: labels.awardName(category.category, category.name),
      icon: style.icon,
      style: { '--award-bg': colors.background, '--award-ink': colors.ink },
      fullName: winner.user.fullName,
      username: winner.user.username,
      avatarUrl: winner.user.avatarUrl,
      tier: winner.user.disc.tier,
    }]
  }))

  const tiersColors = duotones.forest
  const ctaColors = duotones.pink

  function loadLatestReviews (page: number, limit: number) {
    return reviewsApi.feed('recent', null, true, { page, limit })
  }

  useSeo(() => ({ title: null, socialTitle: t('seo.home.title'), description: t('seo.home.description') }))
</script>

<style scoped>
.home__marquee {
  margin-inline: calc(-1 * clamp(16px, 4vw, 40px));
}

.home-hero {
  position: relative;
  display: grid;
  gap: clamp(24px, 5vw, 56px);
  align-items: center;
  min-height: min(78vh, 720px);
}

@media (min-width: 960px) {
  .home-hero {
    grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  }
}

.home-hero__copy {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 18px;
}

.home-hero__eyebrow {
  margin: 0;
  font-size: var(--mx-text-overline);
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--mx-link);
  animation: mx-rise var(--mx-duration-slow) var(--mx-ease-out) both;
}

.home-hero__title {
  margin: 0;
  font-family: var(--mx-font-display);
  font-size: var(--mx-text-giant);
  font-weight: 800;
  font-stretch: 76%;
  letter-spacing: var(--mx-tracking-display);
  line-height: 0.86;
}

.home-hero__word {
  display: inline-block;
  margin-inline-end: 0.18em;
  animation: home-word 760ms var(--mx-spring-bouncy) both;
}

.home-hero__word:last-child {
  color: var(--mx-primary);
}

.home-hero__lead {
  max-width: 50ch;
  margin: 0;
  font-size: clamp(1.0625rem, 1.8vw, 1.3125rem);
  font-weight: 600;
  line-height: 1.5;
  color: var(--mx-on-surface-muted);
  animation: mx-rise var(--mx-duration-slow) var(--mx-ease-out) 420ms both;
}

.home-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  animation: mx-rise var(--mx-duration-slow) var(--mx-ease-out) 520ms both;
}

.home-hero__stage {
  position: relative;
  display: grid;
  place-items: center;
  min-height: clamp(300px, 46vw, 520px);
}

.home-hero__burst {
  position: absolute;
  opacity: 0.95;
  animation: mx-pop-in var(--mx-spring-pop-duration) var(--mx-spring-pop) 200ms both;
}

.home-hero__vinyl {
  position: absolute;
  animation: mx-pop-in var(--mx-spring-pop-duration) var(--mx-spring-pop) 320ms both;
}

.home-hero__cover {
  position: absolute;
  width: clamp(120px, 20vw, 200px);
  border-radius: var(--mx-radius-md);
  box-shadow: var(--mx-elevation-float, 0 24px 48px -16px var(--mx-shadow));
}

.home-hero__cover--1 {
  top: 4%;
  left: 6%;
  --mx-float-rotate: -8deg;
  animation: mx-pop-in var(--mx-spring-pop-duration) var(--mx-spring-pop) 420ms both, mx-float 7s ease-in-out 1.4s infinite;
}

.home-hero__cover--2 {
  right: 2%;
  bottom: 10%;
  --mx-float-rotate: 7deg;
  animation: mx-pop-in var(--mx-spring-pop-duration) var(--mx-spring-pop) 520ms both, mx-float 8s ease-in-out 1.6s infinite;
}

.home-hero__cover--3 {
  bottom: 0;
  left: 18%;
  width: clamp(96px, 15vw, 150px);
  --mx-float-rotate: 3deg;
  animation: mx-pop-in var(--mx-spring-pop-duration) var(--mx-spring-pop) 620ms both, mx-float 6s ease-in-out 1.8s infinite;
}

.home__progress {
  display: grid;
  gap: 16px;
}

.home__split {
  display: grid;
  gap: clamp(28px, 4vw, 48px);
}

@media (min-width: 1145px) {
  .home__split {
    grid-template-columns: minmax(0, 1fr) 380px;
    align-items: start;
  }
}

.home__side {
  display: grid;
  gap: 24px;
}

.home-card {
  display: grid;
  gap: 16px;
}

.home-card__lead {
  margin: -6px 0 0;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.home-awards {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.home-awards__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  color: var(--award-ink);
  background: var(--award-bg);
  border-radius: var(--mx-radius-md);
  transition: transform var(--mx-spring-bouncy-duration) var(--mx-spring-bouncy);
}

.home-awards__item:hover {
  transform: translateY(-2px) rotate(-0.6deg);
}

.home-awards__icon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 36px;
  height: 36px;
  color: var(--award-bg);
  background: var(--award-ink);
  border-radius: 50%;
}

.home-awards__text {
  display: grid;
  flex: 1;
  min-width: 0;
}

.home-awards__category {
  font-size: var(--mx-text-overline);
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.home-awards__winner {
  overflow: hidden;
  font-weight: 800;
  color: inherit;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-awards__winner:focus-visible {
  outline: 3px solid var(--award-ink);
  outline-offset: 2px;
}

.home-tiers {
  display: grid;
  gap: clamp(24px, 4vw, 48px);
  padding: clamp(24px, 5vw, 56px);
  color: var(--tiers-ink);
  background: var(--tiers-bg);
  border-radius: var(--mx-radius-xl);
  --tiers-bg: v-bind('tiersColors.background');
  --tiers-ink: v-bind('tiersColors.ink');
  --mx-hero-bg: var(--tiers-bg);
  --mx-hero-ink: var(--tiers-ink);
}

@media (min-width: 960px) {
  .home-tiers {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    align-items: center;
  }
}

.home-tiers__copy {
  display: grid;
  justify-items: start;
  gap: 14px;
}

.home-tiers__copy .page-header__eyebrow {
  color: inherit;
}

.home-tiers__title {
  margin: 0;
  font-size: var(--mx-text-display-l);
}

.home-tiers__lead {
  max-width: 48ch;
  margin: 0;
  font-weight: 600;
  line-height: 1.55;
}

.home-tiers__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
  gap: 18px 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.home-tiers__tier {
  display: grid;
  justify-items: center;
  gap: 6px;
  text-align: center;
}

.home-tiers__name {
  font-weight: 800;
  line-height: 1.2;
}

.home-tiers__min {
  font-size: 0.8125rem;
  font-weight: 700;
  opacity: 0.85;
}

.home-cta {
  position: relative;
  isolation: isolate;
  display: grid;
  justify-items: center;
  gap: 16px;
  padding: clamp(32px, 7vw, 88px) clamp(20px, 5vw, 56px);
  overflow: hidden;
  text-align: center;
  color: var(--cta-ink);
  background: var(--cta-bg);
  border-radius: var(--mx-radius-xl);
  --cta-bg: v-bind('ctaColors.background');
  --cta-ink: v-bind('ctaColors.ink');
  --mx-hero-bg: var(--cta-bg);
  --mx-hero-ink: var(--cta-ink);
}

.home-cta__blob {
  position: absolute;
  top: -35%;
  right: -10%;
  z-index: -1;
  opacity: 0.55;
}

.home-cta__title {
  max-width: 16ch;
  margin: 0;
  font-size: var(--mx-text-display-l);
}

.home-cta__lead {
  max-width: 52ch;
  margin: 0;
  font-weight: 600;
  line-height: 1.55;
}

.home-cta .home-hero__actions {
  justify-content: center;
}

@keyframes home-word {
  from { transform: translate3d(0, 0.5em, 0) rotate(4deg); }
  to { transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .home-hero__eyebrow,
  .home-hero__word,
  .home-hero__lead,
  .home-hero__actions,
  .home-hero__burst,
  .home-hero__vinyl,
  .home-hero__cover {
    animation: none;
  }

  .home-awards__item,
  .home-awards__item:hover {
    transition: none;
    transform: none;
  }
}
</style>
