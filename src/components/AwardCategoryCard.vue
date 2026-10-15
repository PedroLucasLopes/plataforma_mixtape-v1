<template>
  <article class="award-card" data-testid="award-category-card" :style="{ '--award-bg': colors.background, '--award-ink': colors.ink, '--award-accent': colors.accent }">
    <header class="award-card__header">
      <span aria-hidden="true" class="award-card__icon"><VIcon :icon="style.icon" /></span>

      <div>
        <h3 class="award-card__title">{{ labels.awardName(result.category, result.name) }}</h3>
        <p class="award-card__description">{{ labels.awardDescription(result.category, result.description) }}</p>
      </div>
    </header>

    <MxPodium v-if="podium.length > 0" :entries="podium" :label="labels.awardName(result.category, result.name)" />
    <p v-else class="award-card__empty">{{ t('awards.noWinner') }}</p>

    <ul v-if="reviews.length > 0" class="award-card__reviews">
      <li v-for="award in reviews" :key="award.review!.id">
        <RouterLink class="award-card__review" data-testid="award-category-card-review" :to="reviewRoute(award.review!.id)">
          <span class="award-card__position">{{ t('common.position', { position: award.position }) }}</span>
          <MxCover :seed="award.review!.item.id" size="44px" :src="award.review!.item.coverUrl" :title="award.review!.item.title" />

          <span class="award-card__review-text">
            <strong>{{ award.review!.item.title }}</strong>
            <span>{{ t('awards.reviewBy', { username: award.user.username }) }}</span>
          </span>

          <MxRating size="sm" tone="ink" :value="award.review!.rating" />
        </RouterLink>
      </li>
    </ul>
  </article>
</template>

<script lang="ts" setup>
  import type { AwardCategoryResult } from '@/types/api'
  import type { PodiumEntry } from '@pedrolucaslopes/mixtape-ui'
  import { duotones, formatNumber, MxCover, MxPodium, MxRating } from '@pedrolucaslopes/mixtape-ui'
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useLabels } from '@/composables/useLabels'
  import { AWARD_STYLE } from '@/constants/gamification'
  import { profileRoute, reviewRoute } from '@/utils/items'

  const props = defineProps<{ result: AwardCategoryResult }>()

  const { t, locale } = useI18n()
  const labels = useLabels()

  const style = computed(() => AWARD_STYLE[props.result.category] ?? { icon: 'mdi-trophy', duotone: 'lime' as const })
  const colors = computed(() => duotones[style.value.duotone])

  const podium = computed<PodiumEntry[]>(() => props.result.podium.map(award => ({
    key: `${award.user.id}-${award.position}`,
    position: award.position,
    name: award.user.fullName,
    caption: `@${award.user.username}`,
    avatarUrl: award.user.avatarUrl,
    seed: award.user.username,
    tier: award.user.disc.tier,
    score: t('awards.score', { score: formatNumber(award.score, locale.value) }),
    to: profileRoute(award.user.username) as PodiumEntry['to'],
  })))

  const reviews = computed(() => props.result.podium.filter(award => award.review))
</script>

<style scoped>
.award-card {
  display: grid;
  gap: 20px;
  padding: clamp(18px, 3vw, 28px);
  color: var(--award-ink);
  background: var(--award-bg);
  border-radius: var(--mx-radius-xl);
}

.award-card__header {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.award-card__icon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 48px;
  height: 48px;
  font-size: 26px;
  color: var(--award-bg);
  background: var(--award-ink);
  border-radius: 50%;
}

.award-card__title {
  margin: 0;
  font-family: var(--mx-font-display);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  letter-spacing: var(--mx-tracking-title);
  line-height: 1;
}

.award-card__description,
.award-card__empty {
  margin: 6px 0 0;
  font-weight: 600;
  line-height: 1.45;
}

.award-card :deep(.mx-podium__name),
.award-card :deep(.mx-podium__caption) {
  color: var(--award-ink);
}

.award-card__reviews {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.award-card__review {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  color: inherit;
  text-decoration: none;
  background: color-mix(in srgb, var(--award-ink) 10%, transparent);
  border-radius: var(--mx-radius-md);
}

.award-card__review:hover {
  background: color-mix(in srgb, var(--award-ink) 16%, transparent);
}

.award-card__review:focus-visible {
  outline: 3px solid var(--award-ink);
  outline-offset: 2px;
}

.award-card__position {
  font-family: var(--mx-font-display);
  font-weight: 800;
}

.award-card__review-text {
  display: grid;
  flex: 1;
  min-width: 0;
  font-size: 0.875rem;
}

.award-card__review-text strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
