<template>
  <ul v-if="badges.length > 0" :aria-label="label" class="badge-grid" data-testid="badge-grid">
    <li v-for="(badge, index) in shown" :key="badge.code" v-reveal="{ variant: 'pop', delay: Math.min(index, 10) * 60 }">
      <MxBadge
        :description="labels.badgeDescription(badge.code, badge.description)"
        :earned-at="badge.earnedAt"
        :icon="BADGE_ICONS[badge.code] ?? DEFAULT_BADGE_ICON"
        :name="labels.badgeName(badge.code, badge.name)"
        :next="badge.next"
        :progress="badge.progress"
        :show-progress="badge.showProgress"
        :size="size"
        :tier="badge.tier"
        :tier-name="badge.tier > 0 ? labels.badgeTierName(badge.tier, badge.tierName) : null"
        :value="badge.value"
      />
    </li>
  </ul>

  <p v-else class="muted" data-testid="badge-grid">{{ empty }}</p>
</template>

<script lang="ts" setup>
  import type { BadgeProgress, EarnedBadge } from '@/types/api'
  import { MxBadge, vReveal } from '@pedrolucaslopes/mixtape-ui'
  import { computed } from 'vue'
  import { useLabels } from '@/composables/useLabels'
  import { BADGE_ICONS, DEFAULT_BADGE_ICON } from '@/constants/gamification'

  /** Com progresso: as badges do dono. Sem (só o conquistado): as de outra pessoa. */
  const props = withDefaults(defineProps<{
    badges: readonly (BadgeProgress | EarnedBadge)[]
    label: string
    empty: string
    size?: 'sm' | 'md' | 'lg'
  }>(), { size: 'md' })

  const labels = useLabels()

  const shown = computed(() => props.badges.map(badge => {
    const progress = 'progress' in badge ? badge : null
    return {
      ...badge,
      showProgress: progress !== null,
      next: progress?.next ? { ...progress.next, tierName: labels.badgeTierName(progress.next.tier, progress.next.tierName) } : null,
      progress: progress?.progress ?? 0,
      value: progress?.value ?? 0,
    }
  }))
</script>

<style scoped>
.badge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(150px, 100%), 1fr));
  gap: 20px 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
