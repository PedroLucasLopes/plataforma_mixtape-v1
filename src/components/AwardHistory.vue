<template>
  <ul v-if="awards.length > 0" :aria-label="label" class="award-history" data-testid="award-history">
    <li
      v-for="(award, index) in awards"
      :key="`${award.category}-${award.period}-${award.position}`"
      v-reveal="{ variant: 'tilt', delay: Math.min(index, 8) * 70 }"
      class="award-history__item"
      :style="styleFor(award.category)"
    >
      <span aria-hidden="true" class="award-history__medal">
        <VIcon :icon="AWARD_STYLE[award.category]?.icon ?? 'mdi-trophy'" />
        <span class="award-history__position">{{ award.position }}</span>
      </span>

      <span class="award-history__text">
        <strong>{{ labels.awardName(award.category, award.categoryName) }}</strong>
        <span>{{ t('awards.historyLine', { period: formatPeriod(award.period), position: t('common.position', { position: award.position }), score: formatNumber(award.score, locale) }) }}</span>

        <RouterLink v-if="award.review" class="award-history__review" data-testid="award-history-review" :to="reviewRoute(award.review.id)">
          {{ t('awards.reviewOf', { title: award.review.item.title, rating: formatRatingValue(award.review.rating, locale) }) }}
        </RouterLink>
      </span>
    </li>
  </ul>

  <p v-else class="muted" data-testid="award-history">{{ empty }}</p>
</template>

<script lang="ts" setup>
  import type { Award } from '@/types/api'
  import { duotones, formatNumber, formatRatingValue, vReveal } from '@pedrolucaslopes/mixtape-ui'
  import { useI18n } from 'vue-i18n'
  import { useLabels } from '@/composables/useLabels'
  import { usePeriod } from '@/composables/usePeriod'
  import { AWARD_STYLE } from '@/constants/gamification'
  import { reviewRoute } from '@/utils/items'

  defineProps<{ awards: readonly Award[], label: string, empty: string }>()

  const { t, locale } = useI18n()
  const labels = useLabels()
  const { formatPeriod } = usePeriod()

  function styleFor (category: string) {
    const colors = duotones[AWARD_STYLE[category]?.duotone ?? 'lime']
    return { '--award-bg': colors.background, '--award-ink': colors.ink }
  }
</script>

<style scoped>
.award-history {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.award-history__item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  color: var(--award-ink);
  background: var(--award-bg);
  border-radius: var(--mx-radius-lg);
}

.award-history__medal {
  position: relative;
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 52px;
  height: 52px;
  font-size: 26px;
  color: var(--award-bg);
  background: var(--award-ink);
  border-radius: 50%;
}

.award-history__position {
  position: absolute;
  right: -4px;
  bottom: -4px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  font-size: 0.75rem;
  font-weight: 900;
  color: var(--award-ink);
  background: var(--award-bg);
  border: 2px solid var(--award-ink);
  border-radius: 50%;
}

.award-history__text {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.award-history__text > span {
  font-size: 0.875rem;
  font-weight: 650;
  opacity: 0.9;
}

.award-history__review {
  overflow: hidden;
  font-size: 0.875rem;
  font-weight: 800;
  color: inherit;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.award-history__review:focus-visible {
  outline: 3px solid var(--award-ink);
  outline-offset: 2px;
}
</style>
