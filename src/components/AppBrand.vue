<template>
  <RouterLink :aria-label="t('app.home')" class="app-brand" data-testid="app-brand" :to="{ name: ROUTE.home }">
    <svg aria-hidden="true" class="app-brand__mark" viewBox="0 0 32 32">
      <circle class="app-brand__disc" cx="16" cy="16" r="15" />
      <circle class="app-brand__groove" cx="16" cy="16" r="10.5" />
      <circle class="app-brand__label" cx="16" cy="16" r="6" />
      <circle class="app-brand__hole" cx="16" cy="16" r="1.6" />
    </svg>

    <span class="app-brand__word">{{ t('app.name').toLowerCase() }}</span>
  </RouterLink>
</template>

<script lang="ts" setup>
  import { useI18n } from 'vue-i18n'
  import { ROUTE } from '@/router/routes'

  const { t } = useI18n()
</script>

<style scoped>
.app-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--mx-on-surface);
  text-decoration: none;
  border-radius: var(--mx-radius-pill);
}

.app-brand:focus-visible {
  outline: 3px solid var(--mx-focus);
  outline-offset: 4px;
}

.app-brand__mark {
  width: 34px;
  height: 34px;
  transition: transform var(--mx-spring-bouncy-duration) var(--mx-spring-bouncy);
}

.app-brand:hover .app-brand__mark {
  transform: rotate(120deg);
}

.app-brand__disc { fill: var(--mx-on-surface); }
.app-brand__groove { fill: none; stroke: var(--mx-background); stroke-opacity: 0.35; stroke-width: 1.2; }
.app-brand__label { fill: var(--mx-cta); }
.app-brand__hole { fill: var(--mx-on-surface); }

.app-brand__word {
  font-family: var(--mx-font-display);
  font-size: 1.6rem;
  font-weight: 800;
  font-stretch: 80%;
  letter-spacing: -0.04em;
  line-height: 1;
}

@media (prefers-reduced-motion: reduce) {
  .app-brand__mark {
    transition: none;
  }

  .app-brand:hover .app-brand__mark {
    transform: none;
  }
}
</style>
