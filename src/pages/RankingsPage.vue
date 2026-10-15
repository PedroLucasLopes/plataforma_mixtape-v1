<template>
  <div class="page" data-testid="page-rankings">
    <header class="page-header">
      <p class="page-header__eyebrow">{{ t('rankings.eyebrow') }}</p>
      <h1 class="page-header__title">{{ t('rankings.title') }}</h1>
      <p class="page-header__lead">{{ t('rankings.lead') }}</p>
    </header>

    <section v-if="session.isAuthenticated && progress.data.value" aria-labelledby="my-ranking-title" class="panel-stack">
      <h2 id="my-ranking-title" class="panel-title">{{ t('rankings.mine') }}</h2>
      <ProgressPanel :disc="progress.data.value.disc" :points="progress.data.value.points" :ranking="progress.data.value.ranking" />
    </section>

    <div class="page-columns">
      <div class="page-columns__main">
        <RankingBoard
          v-model:category="category"
          v-model:period="period"
          :loader="loadRanking"
        />
      </div>

      <aside class="page-columns__aside">
        <MxGlass class="panel-stack" variant="panel">
          <h2 class="panel-title">{{ t('rankings.howTitle') }}</h2>
          <p class="muted rankings__how">{{ t(`rankings.categoryHints.${category}`) }}</p>
          <ScoringRules v-if="rules.rules" :scoring="rules.rules.scoring" />
          <MxSkeleton v-else height="240px" />
          <RouterLink class="link-strong" data-testid="page-rankings-how-it-works-link" :to="{ name: ROUTE.howItWorks }">{{ t('rankings.howMore') }}</RouterLink>
        </MxGlass>

        <AdSlot placement="RANKINGS_SIDEBAR" variant="rectangle" />
      </aside>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Period, RankingCategory } from '@/types/api'
  import { MxGlass, MxSkeleton } from '@pedrolucaslopes/mixtape-ui'
  import { computed, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import AdSlot from '@/components/AdSlot.vue'
  import ProgressPanel from '@/components/ProgressPanel.vue'
  import RankingBoard from '@/components/RankingBoard.vue'
  import ScoringRules from '@/components/ScoringRules.vue'
  import { useAsyncData } from '@/composables/useAsyncData'
  import { useSeo } from '@/composables/useSeo'
  import { PERIODS, RANKING_CATEGORIES } from '@/constants/filters'
  import { ROUTE } from '@/router/routes'
  import { gamificationApi } from '@/services/mixtape'
  import { useRulesStore } from '@/stores/rules'
  import { useSessionStore } from '@/stores/session'
  import { queryEnum } from '@/utils/navigation'

  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const session = useSessionStore()
  const rules = useRulesStore()

  onMounted(() => void rules.load())

  const progress = useAsyncData(
    () => (session.isAuthenticated ? gamificationApi.myProgress() : Promise.resolve(null)),
    { watch: () => session.isAuthenticated },
  )

  const category = computed<RankingCategory>({
    get: () => queryEnum(route.query.category, RANKING_CATEGORIES, 'overall'),
    set: value => void router.replace({ query: { ...route.query, category: value === 'overall' ? undefined : value } }),
  })

  const period = computed<Period>({
    get: () => queryEnum(route.query.period, PERIODS, 'month'),
    set: value => void router.replace({ query: { ...route.query, period: value === 'month' ? undefined : value } }),
  })

  function loadRanking (rankingCategory: RankingCategory, rankingPeriod: Period, page: number, limit: number) {
    return gamificationApi.rankings(rankingCategory, rankingPeriod, { page, limit })
  }

  useSeo(() => ({ title: t('rankings.title'), description: t('rankings.lead') }))
</script>

<style scoped>
.rankings__how {
  margin: -6px 0 0;
  font-size: 0.9375rem;
  line-height: 1.5;
}
</style>
