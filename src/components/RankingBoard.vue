<template>
  <div class="ranking-board" data-testid="ranking-board">
    <div class="ranking-board__filters">
      <MxSegmented
        v-model="category"
        data-testid="ranking-board-category"
        :label="t('rankings.category')"
        :options="categoryOptions"
        size="sm"
      />

      <MxSegmented
        v-model="period"
        data-testid="ranking-board-period"
        :label="t('rankings.period')"
        :options="periodOptions"
        size="sm"
      />
    </div>

    <div v-if="!paged.loaded.value && paged.loading.value" aria-hidden="true" class="ranking-board__skeleton">
      <MxSkeleton height="220px" />
      <MxSkeleton v-for="index in 4" :key="index" height="64px" />
    </div>

    <MxErrorState v-else-if="paged.error.value && paged.items.value.length === 0" compact :description="paged.error.value" @retry="paged.reset()" />

    <MxEmptyState
      v-else-if="paged.loaded.value && paged.items.value.length === 0"
      compact
      :description="t('rankings.emptyDescription')"
      duotone="violet"
      :heading-level="3"
      icon="mdi-podium"
      :title="t('rankings.empty')"
    />

    <template v-else>
      <MxPodium v-if="podium.length > 0" :entries="podium" :label="t('rankings.podium')" />

      <ol class="ranking-board__list">
        <MxRankRow
          v-for="entry in rest"
          :key="entry.user.id"
          :avatar-url="entry.user.avatarUrl"
          data-testid="ranking-board-row"
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

      <MxLoadMore data-testid="ranking-board-load-more" :has-more="paged.hasMore.value" :loading="paged.loading.value" @load="paged.loadMore()" />
    </template>
  </div>
</template>

<script lang="ts" setup>
  import type { Page, Period, RankingCategory, RankingEntry } from '@/types/api'
  import type { PodiumEntry } from '@pedrolucaslopes/mixtape-ui'
  import { formatNumber, MxEmptyState, MxErrorState, MxLoadMore, MxPodium, MxRankRow, MxSegmented, MxSkeleton } from '@pedrolucaslopes/mixtape-ui'
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useLabels } from '@/composables/useLabels'
  import { usePaged } from '@/composables/usePaged'
  import { usePeriod } from '@/composables/usePeriod'
  import { RANKING_CATEGORIES } from '@/constants/filters'
  import { useSessionStore } from '@/stores/session'
  import { profileRoute } from '@/utils/items'

  const props = defineProps<{
    loader: (category: RankingCategory, period: Period, page: number, limit: number) => Promise<Page<RankingEntry>>
  }>()

  const category = defineModel<RankingCategory>('category', { default: 'overall' })
  const period = defineModel<Period>('period', { default: 'month' })

  const { t, locale } = useI18n()
  const labels = useLabels()
  const session = useSessionStore()

  const paged = usePaged<RankingEntry>(
    (page, limit) => props.loader(category.value, period.value, page, limit),
    { watch: () => [category.value, period.value] },
  )

  const { periodOptions } = usePeriod()

  const categoryOptions = computed(() => RANKING_CATEGORIES.map(value => ({
    value,
    label: t(`rankings.categories.${value}`),
  })))

  const podium = computed<PodiumEntry[]>(() => paged.items.value.filter(entry => entry.position <= 3).map(entry => ({
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

  const rest = computed(() => paged.items.value.filter(entry => entry.position > 3))
</script>

<style scoped>
.ranking-board {
  display: grid;
  gap: 24px;
}

.ranking-board__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ranking-board__skeleton {
  display: grid;
  gap: 10px;
}

.ranking-board__list {
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
