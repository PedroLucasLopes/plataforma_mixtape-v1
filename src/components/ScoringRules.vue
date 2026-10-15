<template>
  <div class="scoring" data-testid="scoring-rules">
    <section v-for="group in groups" :key="group.category" :aria-labelledby="`scoring-${group.category}`" class="scoring__group">
      <h3 :id="`scoring-${group.category}`" class="scoring__title">
        <VIcon aria-hidden="true" :icon="group.category === 'PARTICIPATION' ? 'mdi-lightning-bolt' : 'mdi-star-shooting'" size="18" />
        {{ t(`rules.categories.${group.category}`) }}
      </h3>

      <p class="scoring__hint muted">{{ t(`rules.categoryHints.${group.category}`) }}</p>

      <ul class="scoring__list">
        <li v-for="rule in group.rules" :key="rule.reason" class="scoring__rule">
          <span aria-hidden="true" class="scoring__icon"><VIcon :icon="SCORE_REASON_ICONS[rule.reason] ?? 'mdi-star'" size="18" /></span>
          <span class="scoring__reason">{{ labels.reasonLabel(rule.reason, rule.description) }}</span>
          <span class="scoring__points" :class="{ 'scoring__points--negative': rule.points < 0 }">{{ t('rules.points', { points: rule.points > 0 ? `+${rule.points}` : String(rule.points) }) }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts" setup>
  import type { GamificationRules } from '@/types/api'
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useLabels } from '@/composables/useLabels'
  import { SCORE_REASON_ICONS } from '@/constants/gamification'

  const props = defineProps<{ scoring: GamificationRules['scoring'] }>()

  const { t } = useI18n()
  const labels = useLabels()

  const groups = computed(() => (['PARTICIPATION', 'NOTORIETY'] as const)
    .map(category => ({ category, rules: props.scoring.filter(rule => rule.category === category) }))
    .filter(group => group.rules.length > 0))
</script>

<style scoped>
.scoring {
  display: grid;
  gap: 20px;
}

.scoring__group {
  display: grid;
  gap: 8px;
}

.scoring__title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: var(--mx-text-overline);
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.scoring__hint {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.45;
}

.scoring__list {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.scoring__rule {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--mx-surface);
  border-radius: var(--mx-radius-sm);
}

.scoring__icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  color: var(--mx-on-cta);
  background: var(--mx-cta);
  border-radius: 50%;
}

.scoring__reason {
  font-size: 0.9375rem;
  line-height: 1.35;
}

.scoring__points {
  font-family: var(--mx-font-display);
  font-weight: 800;
  white-space: nowrap;
  color: var(--mx-success);
}

.scoring__points--negative {
  color: var(--mx-error);
}
</style>
