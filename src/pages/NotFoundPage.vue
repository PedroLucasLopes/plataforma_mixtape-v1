<template>
  <section aria-labelledby="not-found-title" class="page not-found" data-testid="page-not-found">
    <div aria-hidden="true" class="not-found__stage">
      <MxStarburst
        class="not-found__burst"
        color="var(--mx-secondary)"
        ink="var(--mx-on-secondary)"
        :points="14"
        shape="star"
        size="min(80vw, 420px)"
        spin
      />

      <MxVinyl class="not-found__vinyl" label-color="var(--mx-cta)" :size="240" />
      <span class="not-found__code mx-display">404</span>
    </div>

    <p class="page-header__eyebrow">{{ t('errors.notFound.eyebrow') }}</p>
    <h1 id="not-found-title" class="not-found__title mx-display">{{ t('errors.notFound.title') }}</h1>
    <p class="not-found__text">{{ t('errors.notFound.description') }}</p>

    <div class="not-found__actions">
      <MxButton
        data-testid="page-not-found-home"
        icon="mdi-home"
        :label="t('errors.notFound.home')"
        size="lg"
        :to="{ name: ROUTE.home }"
      />

      <MxButton
        data-testid="page-not-found-search"
        icon="mdi-magnify"
        :label="t('errors.notFound.search')"
        size="lg"
        :to="{ name: ROUTE.search }"
        variant="glass"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
  import { MxButton, MxStarburst, MxVinyl } from '@pedrolucaslopes/mixtape-ui'
  import { useI18n } from 'vue-i18n'
  import { useSeo } from '@/composables/useSeo'
  import { ROUTE } from '@/router/routes'

  const { t } = useI18n()

  useSeo(() => ({ title: t('errors.notFound.title'), description: t('errors.notFound.description'), noindex: true }))
</script>

<style scoped>
.not-found {
  justify-items: center;
  gap: 16px;
  padding-block: clamp(16px, 4vw, 48px);
  text-align: center;
}

.not-found__stage {
  position: relative;
  display: grid;
  place-items: center;
  width: min(80vw, 420px);
  aspect-ratio: 1;
}

.not-found__burst {
  position: absolute;
  animation: mx-pop-in var(--mx-spring-pop-duration) var(--mx-spring-pop) both;
}

.not-found__vinyl {
  position: absolute;
  animation: not-found-scratch 2.4s ease-in-out infinite;
}

.not-found__code {
  position: relative;
  font-size: clamp(4rem, 16vw, 8rem);
  color: var(--mx-on-surface);
  -webkit-text-stroke: 4px var(--mx-background);
  paint-order: stroke fill;
  transform: rotate(-6deg);
}

.not-found__title {
  max-width: 18ch;
  margin: 0;
  font-size: var(--mx-text-display-l);
}

.not-found__text {
  max-width: 52ch;
  margin: 0;
  font-size: 1.0625rem;
  line-height: 1.55;
  color: var(--mx-on-surface-muted);
}

.not-found__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

@keyframes not-found-scratch {
  0%, 100% { transform: rotate(0deg); }
  30% { transform: rotate(-24deg); }
  55% { transform: rotate(16deg); }
  75% { transform: rotate(-8deg); }
}

@media (prefers-reduced-motion: reduce) {
  .not-found__burst,
  .not-found__vinyl {
    animation: none;
  }
}
</style>
