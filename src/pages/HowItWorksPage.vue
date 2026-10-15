<template>
  <div class="page how" data-testid="page-how-it-works">
    <MxPageHero
      decoration="flower"
      duotone="lime"
      :eyebrow="t('how.eyebrow')"
      layout="center"
      :title="t('how.title')"
    >
      <template #story>
        <p class="how__lead">{{ t('how.lead') }}</p>
      </template>

      <template #actions>
        <nav :aria-label="t('how.navLabel')" class="how__nav">
          <MxButton
            v-for="anchor in anchors"
            :key="anchor.id"
            data-testid="page-how-it-works-anchor"
            :href="`#${anchor.id}`"
            :label="t(anchor.label)"
            size="sm"
            variant="ink-outline"
          />
        </nav>
      </template>
    </MxPageHero>

    <ol :aria-label="t('how.stepsLabel')" class="story-grid how__steps">
      <li v-for="(step, index) in steps" :key="step.key" v-reveal="{ variant: 'tilt', delay: index * 90 }">
        <MxStoryCard
          :duotone="step.duotone"
          :icon="step.icon"
          :label="t('how.step', { number: index + 1 })"
          :sentence="t(`how.steps.${step.key}.text`)"
          :tilt="index % 2 === 0 ? -1.5 : 1.5"
          :value="t(`how.steps.${step.key}.title`)"
        />
      </li>
    </ol>

    <MxSection id="rating" :description="t('how.ratingDescription')" :title="t('how.ratingTitle')">
      <ul class="how__scale">
        <li v-for="(value, index) in [0, 1, 2, 3, 4, 5]" :key="value" v-reveal="{ variant: 'up', delay: index * 60 }" class="how__scale-item">
          <MxRating size="md" :value="value" />
          <strong>{{ formatRatingValue(value, locale) }}</strong>
          <span>{{ t(`how.scale.${value}`) }}</span>
        </li>
      </ul>

      <p class="muted">{{ t('how.halfDiscs') }}</p>
    </MxSection>

    <template v-if="rules.rules">
      <MxSection id="discs" :description="t('how.discsDescription')" :title="t('how.discsTitle')">
        <ol class="how__tiers">
          <li
            v-for="(tier, index) in rules.rules.discTiers"
            :key="tier.tier"
            v-reveal="{ variant: 'pop', delay: index * 110 }"
            class="how__tier"
            :style="{ '--step': index }"
          >
            <MxDiscTier
              :label="labels.tierLabel(tier.tier, tier.label)"
              :show-label="false"
              :size="96"
              :spinning="index === rules.rules.discTiers.length - 1"
              :tier="tier.tier"
            />

            <strong class="how__tier-name">{{ labels.tierLabel(tier.tier, tier.label) }}</strong>
            <span class="how__tier-min">{{ tier.minReviews === 0 ? t('how.tierStart') : t('how.tierMin', { count: tier.minReviews, formatted: formatNumber(tier.minReviews, locale) }) }}</span>
          </li>
        </ol>
      </MxSection>

      <MxSection id="points" :description="t('how.pointsDescription', { count: rules.rules.writtenReviewMinLength })" :title="t('how.pointsTitle')">
        <div class="how__points">
          <ScoringRules :scoring="rules.rules.scoring" />

          <MxGlass class="panel-stack" tint="violet" variant="panel">
            <h3 class="panel-title">{{ t('how.rankingTitle') }}</h3>
            <p class="how__text">{{ t('how.rankingText') }}</p>

            <MxButton
              append-icon="mdi-arrow-right"
              data-testid="page-how-it-works-see-ranking"
              :label="t('how.seeRanking')"
              :to="{ name: ROUTE.rankings }"
              variant="glass"
            />
          </MxGlass>
        </div>
      </MxSection>

      <MxSection id="badges" :description="t('how.badgesDescription')" :title="t('how.badgesTitle')">
        <ul class="how__badges">
          <li v-for="(badge, index) in rules.rules.badges" :key="badge.code" v-reveal="{ variant: 'up', delay: Math.min(index, 8) * 60 }" class="how__badge">
            <MxBadge
              :description="labels.badgeDescription(badge.code, badge.description)"
              :icon="BADGE_ICONS[badge.code] ?? DEFAULT_BADGE_ICON"
              :name="labels.badgeName(badge.code, badge.name)"
              size="sm"
              :tier="badge.tiers.length"
              :tier-name="labels.badgeTierName(badge.tiers.length, badge.tiers.at(-1)?.name)"
            />

            <div class="how__badge-body">
              <p class="how__badge-metric">{{ t('how.metric', { metric: labels.metricLabel(badge.metric) }) }}</p>

              <ol class="how__badge-tiers">
                <li v-for="tier in badge.tiers" :key="tier.tier" :style="{ '--metal': metalColor(tier.tier) }">
                  <span aria-hidden="true" class="how__badge-dot" />
                  {{ labels.badgeTierName(tier.tier, tier.name) }}
                  <strong>{{ formatNumber(tier.threshold, locale) }}</strong>
                </li>
              </ol>
            </div>
          </li>
        </ul>
      </MxSection>

      <MxSection id="awards" :description="t('how.awardsDescription')" :more-to="{ name: ROUTE.awards }" :title="t('how.awardsTitle')">
        <ul class="how__awards">
          <li v-for="(award, index) in rules.rules.awards" :key="award.category" v-reveal="{ variant: 'tilt', delay: index * 90 }">
            <MxStoryCard
              :duotone="AWARD_STYLE[award.category]?.duotone ?? 'lime'"
              :icon="AWARD_STYLE[award.category]?.icon ?? 'mdi-trophy'"
              :label="t('how.awardLabel')"
              :sentence="labels.awardDescription(award.category, award.description)"
              :tilt="index % 2 === 0 ? 1 : -1"
              :value="labels.awardName(award.category, award.name)"
            />
          </li>
        </ul>
      </MxSection>
    </template>

    <MxErrorState v-else-if="failed" :description="t('errors.fallback')" @retry="load" />
    <MxSkeleton v-else height="420px" />

    <section aria-labelledby="how-cta-title" class="how__cta">
      <h2 id="how-cta-title" class="mx-display how__cta-title">{{ t('how.ctaTitle') }}</h2>

      <MxButton
        data-testid="page-how-it-works-rate"
        icon="mdi-album"
        :label="t('home.hero.rate')"
        size="lg"
        :to="session.isAuthenticated ? { name: ROUTE.search, query: { rate: '1' } } : { name: ROUTE.register }"
      />
    </section>
  </div>
</template>

<script lang="ts" setup>
  import type { DuotoneName } from '@pedrolucaslopes/mixtape-ui'
  import {
    BADGE_TIER_METAL,
    formatNumber,
    formatRatingValue,
    metals,
    MxBadge,
    MxButton,
    MxDiscTier,
    MxErrorState,
    MxGlass,
    MxPageHero,
    MxRating,
    MxSection,
    MxSkeleton,
    MxStoryCard,
    vReveal,
  } from '@pedrolucaslopes/mixtape-ui'
  import { onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import ScoringRules from '@/components/ScoringRules.vue'
  import { useLabels } from '@/composables/useLabels'
  import { useSeo } from '@/composables/useSeo'
  import { AWARD_STYLE, BADGE_ICONS, DEFAULT_BADGE_ICON } from '@/constants/gamification'
  import { ROUTE } from '@/router/routes'
  import { useRulesStore } from '@/stores/rules'
  import { useSessionStore } from '@/stores/session'

  const { t, locale } = useI18n()
  const labels = useLabels()
  const rules = useRulesStore()
  const session = useSessionStore()
  const failed = ref(false)

  const anchors = [
    { id: 'rating', label: 'how.nav.rating' },
    { id: 'discs', label: 'how.nav.discs' },
    { id: 'points', label: 'how.nav.points' },
    { id: 'badges', label: 'how.nav.badges' },
    { id: 'awards', label: 'how.nav.awards' },
  ] as const

  const steps: ReadonlyArray<{ key: string, icon: string, duotone: DuotoneName }> = [
    { key: 'rate', icon: 'mdi-album', duotone: 'lime' },
    { key: 'write', icon: 'mdi-text-long', duotone: 'pink' },
    { key: 'react', icon: 'mdi-heart', duotone: 'blue' },
    { key: 'galera', icon: 'mdi-account-group', duotone: 'pink' },
    { key: 'collect', icon: 'mdi-playlist-music', duotone: 'orange' },
    { key: 'compete', icon: 'mdi-account-group', duotone: 'green' },
  ]

  function metalColor (tier: number): string {
    const metal = BADGE_TIER_METAL[Math.max(0, Math.min(4, tier))] ?? 'demo'
    return metals[metal][1]
  }

  async function load (): Promise<void> {
    failed.value = false
    await rules.load()
    failed.value = !rules.rules
  }

  onMounted(() => void load())

  useSeo(() => ({ title: t('how.title'), description: t('how.lead') }))
</script>

<style scoped>
.how__lead {
  max-width: 60ch;
  margin: 0 auto;
}

.how__nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.how__scale {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(180px, 100%), 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.how__scale-item {
  display: grid;
  gap: 6px;
  padding: 16px;
  background: var(--mx-surface);
  border-radius: var(--mx-radius-lg);
}

.how__scale-item strong {
  font-family: var(--mx-font-display);
  font-size: 1.75rem;
  font-weight: 800;
}

.how__scale-item span {
  font-size: 0.9375rem;
  line-height: 1.4;
  color: var(--mx-on-surface-muted);
}

.how__tiers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 16px;
  align-items: end;
  margin: 0;
  padding: 0;
  list-style: none;
}

.how__tier {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 18px 12px calc(18px + var(--step) * 10px);
  text-align: center;
  background: var(--mx-surface);
  border-radius: var(--mx-radius-lg);
}

.how__tier-name {
  font-weight: 800;
}

.how__tier-min {
  font-size: 0.875rem;
  color: var(--mx-on-surface-muted);
}

.how__points {
  display: grid;
  gap: 24px;
}

@media (min-width: 960px) {
  .how__points {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    align-items: start;
  }
}

.how__text {
  margin: 0;
  line-height: 1.55;
}

.how__badges {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.how__badge {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  padding: 16px;
  background: var(--mx-surface);
  border-radius: var(--mx-radius-lg);
}

.how__badge-body {
  display: grid;
  gap: 8px;
}

.how__badge-metric {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--mx-on-surface-muted);
}

.how__badge-tiers {
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.how__badge-tiers li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.how__badge-dot {
  width: 12px;
  height: 12px;
  background: var(--metal);
  border-radius: 50%;
}

.how__awards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr));
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.how__cta {
  display: grid;
  justify-items: center;
  gap: 18px;
  padding: clamp(28px, 6vw, 64px) 16px;
  text-align: center;
}

.how__cta-title {
  max-width: 18ch;
  margin: 0;
  font-size: var(--mx-text-display-l);
}
</style>
