<template>
  <div class="page" data-testid="page-awards">
    <section aria-labelledby="awards-title" class="awards-hero" :style="heroStyle">
      <MxStarburst
        class="awards-hero__burst"
        :color="colors.accent"
        :ink="colors.ink"
        :points="18"
        shape="sun"
        size="min(70vw, 420px)"
        spin
      />

      <p class="page-header__eyebrow awards-hero__eyebrow">{{ t('awards.eyebrow') }}</p>
      <h1 id="awards-title" class="awards-hero__title mx-display">{{ t('awards.title') }}</h1>
      <p class="awards-hero__lead">{{ t('awards.lead') }}</p>

      <nav :aria-label="t('awards.periodNav')" class="awards-hero__periods">
        <MxIconButton
          data-testid="page-awards-previous"
          :disabled="!previousPeriod"
          icon="mdi-chevron-left"
          :label="t('awards.previous')"
          variant="ink"
          @click="selected = previousPeriod"
        />

        <VSelect
          v-model="selected"
          class="awards-hero__select"
          data-testid="page-awards-period"
          hide-details
          :items="periodItems"
          :label="t('awards.periodLabel')"
        />

        <MxIconButton
          data-testid="page-awards-next"
          :disabled="!nextPeriod"
          icon="mdi-chevron-right"
          :label="t('awards.next')"
          variant="ink"
          @click="selected = nextPeriod"
        />
      </nav>
    </section>

    <p aria-live="polite" class="mx-sr-only">{{ awards.data.value?.period ? t('awards.showing', { period: formatPeriod(awards.data.value.period) }) : '' }}</p>

    <div v-if="awards.loading.value && !awards.data.value" aria-hidden="true" class="awards__grid">
      <MxSkeleton v-for="index in 4" :key="index" height="360px" />
    </div>

    <MxErrorState v-else-if="awards.error.value" :description="awards.error.value" :retrying="awards.loading.value" @retry="awards.reload()" />

    <MxEmptyState
      v-else-if="!awards.data.value?.period || awards.data.value.categories.every(category => category.podium.length === 0)"
      :description="t('awards.emptyDescription')"
      duotone="violet"
      icon="mdi-trophy-outline"
      :title="t('awards.empty')"
    >
      <MxButton data-testid="page-awards-how-it-works" icon="mdi-help-circle-outline" :label="t('awards.howItWorks')" :to="{ name: ROUTE.howItWorks, hash: '#awards' }" />
    </MxEmptyState>

    <template v-else>
      <h2 class="awards__period mx-display">{{ formatPeriod(awards.data.value.period) }}</h2>

      <div class="awards__grid">
        <div v-for="(category, index) in awards.data.value.categories" :key="category.category" v-reveal="{ variant: 'up', delay: index * 100 }">
          <AwardCategoryCard :result="category" />
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { duotones, MxButton, MxEmptyState, MxErrorState, MxIconButton, MxSkeleton, MxStarburst, vReveal } from '@pedrolucaslopes/mixtape-ui'
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import AwardCategoryCard from '@/components/AwardCategoryCard.vue'
  import { useAsyncData } from '@/composables/useAsyncData'
  import { usePeriod } from '@/composables/usePeriod'
  import { useSeo } from '@/composables/useSeo'
  import { AWARD_HISTORY_MONTHS } from '@/constants/gamification'
  import { AWARD_PERIOD_PATTERN } from '@/constants/validation'
  import { ROUTE } from '@/router/routes'
  import { gamificationApi } from '@/services/mixtape'
  import { queryString } from '@/utils/navigation'
  import { closedMonths } from '@/utils/periods'

  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const { formatPeriod } = usePeriod()

  const colors = duotones.burgundy
  const heroStyle = { '--mx-hero-bg': colors.background, '--mx-hero-ink': colors.ink }

  const requested = computed(() => {
    const value = queryString(route.query.period)
    return value && AWARD_PERIOD_PATTERN.test(value) ? value : null
  })

  const awards = useAsyncData(() => gamificationApi.awards(requested.value), { watch: requested })

  const periods = computed(() => closedMonths(AWARD_HISTORY_MONTHS))
  const current = computed(() => requested.value ?? awards.data.value?.period ?? periods.value[0] ?? null)

  const periodItems = computed(() => periods.value.map(value => ({ value, title: formatPeriod(value) })))

  const selected = computed<string | null>({
    get: () => current.value,
    set: value => {
      if (value) void router.replace({ query: { ...route.query, period: value } })
    },
  })

  const currentIndex = computed(() => (current.value ? periods.value.indexOf(current.value) : -1))
  const previousPeriod = computed(() => (currentIndex.value >= 0 ? periods.value[currentIndex.value + 1] ?? null : null))
  const nextPeriod = computed(() => (currentIndex.value > 0 ? periods.value[currentIndex.value - 1] ?? null : null))

  useSeo(() => ({
    title: awards.data.value?.period ? t('awards.seoTitle', { period: formatPeriod(awards.data.value.period) }) : t('awards.title'),
    description: t('awards.lead'),
  }))
</script>

<style scoped>
.awards-hero {
  position: relative;
  isolation: isolate;
  display: grid;
  justify-items: start;
  gap: 14px;
  padding: clamp(28px, 6vw, 72px);
  overflow: hidden;
  color: var(--mx-hero-ink);
  background: var(--mx-hero-bg);
  border-radius: var(--mx-radius-xl);
}

.awards-hero__burst {
  position: absolute;
  top: -20%;
  right: -12%;
  z-index: -1;
}

.awards-hero__eyebrow {
  color: inherit;
}

.awards-hero__title {
  max-width: 12ch;
  margin: 0;
  font-size: var(--mx-text-giant);
}

.awards-hero__lead {
  max-width: 56ch;
  margin: 0;
  font-size: clamp(1rem, 1.6vw, 1.1875rem);
  font-weight: 600;
  line-height: 1.55;
}

.awards-hero__periods {
  display: flex;
  align-items: center;
  gap: 8px;
  width: min(100%, 420px);
  margin-top: 8px;
}

.awards-hero__select {
  flex: 1;
}

.awards__period {
  margin: 0;
  font-size: var(--mx-text-h1);
  text-transform: capitalize;
}

.awards__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(420px, 100%), 1fr));
  gap: clamp(18px, 3vw, 28px);
}
</style>
