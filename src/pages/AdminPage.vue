<template>
  <div class="page" data-testid="page-admin">
    <header class="page-header">
      <p class="page-header__eyebrow">{{ t('admin.eyebrow') }}</p>
      <h1 class="page-header__title">{{ t('admin.title') }}</h1>
      <p class="page-header__lead">{{ t('admin.lead') }}</p>
    </header>

    <div class="page-columns">
      <div class="page-columns__main">
        <MxGlass aria-labelledby="admin-awards" class="panel-stack" tag="section" variant="panel">
          <h2 id="admin-awards" class="panel-title">{{ t('admin.awardsTitle') }}</h2>
          <p class="muted admin__text">{{ t('admin.awardsText') }}</p>

          <form class="admin__form" data-testid="page-admin-form" @submit.prevent="compute">
            <VSelect
              v-model="period"
              class="admin__select"
              data-testid="page-admin-select"
              hide-details
              :items="periodItems"
              :label="t('awards.periodLabel')"
            />

            <MxButton
              data-testid="page-admin-compute"
              icon="mdi-trophy"
              :label="t('admin.compute')"
              :loading="computing"
              type="submit"
            />
          </form>

          <p v-if="error" class="form-error" data-testid="page-admin-error" role="alert">{{ error }}</p>
        </MxGlass>

        <section v-if="result" aria-labelledby="admin-result" class="panel-stack">
          <div class="toolbar">
            <h2 id="admin-result" class="panel-title">{{ t('admin.result', { period: formatPeriod(result.period) }) }}</h2>
            <span class="toolbar__spacer" />
            <RouterLink class="link-strong" data-testid="page-admin-awards-link" :to="{ name: ROUTE.awards, query: { period: result.period ?? undefined } }">{{ t('admin.openAwards') }}</RouterLink>
          </div>

          <div class="admin__awards">
            <AwardCategoryCard v-for="category in result.categories" :key="category.category" :result="category" />
          </div>
        </section>
      </div>

      <aside class="page-columns__aside">
        <MxGlass aria-labelledby="admin-ads" class="panel-stack" tag="section" variant="panel">
          <h2 id="admin-ads" class="panel-title">{{ t('admin.adsTitle') }}</h2>
          <MxDescriptionList :columns="1" :items="adsItems" />

          <ul v-if="ads.config?.placements.length" class="admin__placements">
            <li v-for="placement in ads.config.placements" :key="placement.placement">
              <span>{{ t(`admin.placements.${placement.placement}`) }}</span>
              <code>{{ placement.slotId }}</code>
            </li>
          </ul>
        </MxGlass>
      </aside>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { MonthlyAwards } from '@/types/api'
  import type { DescriptionItem } from '@pedrolucaslopes/mixtape-ui'
  import { MxButton, MxDescriptionList, MxGlass, toast } from '@pedrolucaslopes/mixtape-ui'
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import AwardCategoryCard from '@/components/AwardCategoryCard.vue'
  import { usePeriod } from '@/composables/usePeriod'
  import { useSeo } from '@/composables/useSeo'
  import { AWARD_HISTORY_MONTHS } from '@/constants/gamification'
  import { ROUTE } from '@/router/routes'
  import { errorMessage } from '@/services/http'
  import { gamificationApi } from '@/services/mixtape'
  import { useAdsStore } from '@/stores/ads'
  import { closedMonths } from '@/utils/periods'

  const { t } = useI18n()
  const { formatPeriod } = usePeriod()
  const ads = useAdsStore()

  const periods = closedMonths(AWARD_HISTORY_MONTHS)
  const period = ref(periods[0] ?? '')
  const computing = ref(false)
  const error = ref<string | null>(null)
  const result = ref<MonthlyAwards | null>(null)

  const periodItems = computed(() => periods.map(value => ({ value, title: formatPeriod(value) })))

  const adsItems = computed<DescriptionItem[]>(() => {
    const config = ads.config
    return [
      { term: t('admin.ads.enabled'), value: config?.enabled ? t('common.yes') : t('common.no') },
      { term: t('admin.ads.provider'), value: config?.provider ?? '—' },
      { term: t('admin.ads.client'), value: config?.clientId ?? '—', mono: true },
      { term: t('admin.ads.testMode'), value: config?.testMode ? t('common.yes') : t('common.no') },
      { term: t('admin.ads.placements'), value: String(config?.placements.length ?? 0) },
    ]
  })

  async function compute (): Promise<void> {
    if (!period.value) return
    computing.value = true
    error.value = null
    try {
      result.value = await gamificationApi.computeAwards(period.value)
      toast.success(t('admin.computed', { period: formatPeriod(period.value) }))
    } catch (error_) {
      error.value = errorMessage(error_)
    } finally {
      computing.value = false
    }
  }

  useSeo(() => ({ title: t('admin.title'), noindex: true }))
</script>

<style scoped>
.admin__text {
  margin: 0;
  line-height: 1.5;
}

.admin__form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.admin__select {
  flex: 1;
  min-width: 220px;
}

.admin__awards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(380px, 100%), 1fr));
  gap: 20px;
}

.admin__placements {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.admin__placements li {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 0.875rem;
}

.admin__placements code {
  font-family: var(--mx-font-mono);
  color: var(--mx-on-surface-muted);
}
</style>
