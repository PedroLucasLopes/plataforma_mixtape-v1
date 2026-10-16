<template>
  <MxGlass class="progress-panel" data-testid="progress-panel" variant="panel">
    <MxDiscProgress
      v-if="disc"
      :label="labels.tierLabel(disc.tier, disc.label)"
      :next="disc.next ? { ...disc.next, label: labels.tierLabel(disc.next.tier, disc.next.label) } : null"
      :progress="disc.progress"
      :reviews="disc.reviews"
      :tier="disc.tier"
    />

    <div class="progress-panel__grid">
      <div class="progress-panel__block">
        <p class="progress-panel__title">{{ t('progress.allTime') }}</p>
        <MxStat :label="t('progress.points')" size="md" :value="points.allTime.total" />
        <MxSplitBar :segments="split(points.allTime)" />
      </div>

      <div class="progress-panel__block">
        <p class="progress-panel__title">{{ t('progress.thisMonth') }}</p>
        <MxStat :label="t('progress.points')" size="md" :value="points.thisMonth.total" />
        <MxSplitBar :segments="split(points.thisMonth)" />
      </div>

      <div class="progress-panel__block">
        <p class="progress-panel__title">{{ t('progress.ranking') }}</p>

        <div class="progress-panel__positions">
          <MxStat :label="t('progress.positionAllTime')" size="md" :value="position(ranking.allTime)" />
          <MxStat :label="t('progress.positionMonth')" size="md" :value="position(ranking.thisMonth)" />
        </div>

        <RouterLink class="progress-panel__link" data-testid="progress-panel-link" :to="{ name: ROUTE.rankings }">{{ t('progress.seeRanking') }}</RouterLink>
      </div>
    </div>
  </MxGlass>
</template>

<script lang="ts" setup>
  import type { DiscProgress, UserProgress } from '@/types/api'
  import type { SplitSegment } from '@pedrolucaslopes/mixtape-ui'
  import { MxDiscProgress, MxGlass, MxSplitBar, MxStat } from '@pedrolucaslopes/mixtape-ui'
  import { useI18n } from 'vue-i18n'
  import { useLabels } from '@/composables/useLabels'
  import { ROUTE } from '@/router/routes'

  defineProps<{
    disc: DiscProgress | null
    points: UserProgress['points']
    ranking: UserProgress['ranking']
  }>()

  const { t } = useI18n()
  const labels = useLabels()

  function position (value: number | null | undefined): string {
    return value === null || value === undefined ? t('progress.unranked') : t('common.position', { position: value })
  }

  function split (totals: { participation: number, notoriety: number }): SplitSegment[] {
    return [
      { label: t('progress.participation'), value: totals.participation, color: 'var(--mx-primary)' },
      { label: t('progress.notoriety'), value: totals.notoriety, color: 'var(--mx-secondary)' },
    ]
  }
</script>

<style scoped>
.progress-panel {
  display: grid;
  gap: 24px;
}

.progress-panel__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}

.progress-panel__block {
  display: grid;
  align-content: start;
  gap: 10px;
}

.progress-panel__title {
  margin: 0;
  font-size: var(--mx-text-overline);
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--mx-link);
}

.progress-panel__positions {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.progress-panel__link {
  font-weight: 800;
  color: var(--mx-link);
}
</style>
