<template>
  <VMenu v-model="open" location="bottom end" :offset="10" transition="scale-transition">
    <template #activator="{ props: activator, isActive }">
      <button
        v-bind="activator"
        :aria-expanded="isActive"
        :aria-label="t('nav.more')"
        class="app-nav-menu__trigger"
        data-testid="app-nav-menu"
        type="button"
      >
        <VIcon aria-hidden="true" :icon="isActive ? 'mdi-close' : 'fa-burger'" />
      </button>
    </template>

    <nav :aria-label="t('nav.main')" class="app-nav-menu mx-glass">
      <RouterLink
        v-for="entry in entries"
        :key="entry.key"
        :aria-current="route.meta.nav === entry.key || route.name === entry.route ? 'page' : undefined"
        class="app-nav-menu__link"
        :class="{ 'app-nav-menu__link--active': route.meta.nav === entry.key || route.name === entry.route }"
        data-testid="app-nav-menu-link"
        :to="{ name: entry.route }"
        @click="open = false"
      >
        <VIcon aria-hidden="true" :icon="entry.icon" size="20" />
        {{ t(entry.label) }}
      </RouterLink>
    </nav>
  </VMenu>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import { MAIN_NAV, MENU_EXTRA_NAV } from '@/constants/navigation'
  import { useSessionStore } from '@/stores/session'

  const { t } = useI18n()
  const route = useRoute()
  const session = useSessionStore()
  const open = ref(false)

  const entries = computed(() => [...MAIN_NAV, ...MENU_EXTRA_NAV].filter(entry => !entry.auth || session.isAuthenticated))
</script>

<style scoped>
.app-nav-menu__trigger {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  font-size: 22px;
  color: var(--mx-on-surface);
  cursor: pointer;
  background: var(--mx-glass);
  border: 1px solid var(--mx-glass-border);
  border-radius: 50%;
  transition: transform var(--mx-spring-bouncy-duration) var(--mx-spring-bouncy);
}

.app-nav-menu__trigger:hover {
  transform: scale(1.08) rotate(-10deg);
}

.app-nav-menu__trigger:focus-visible {
  outline: 3px solid var(--mx-focus);
  outline-offset: 2px;
}

@media (min-width: 1145px) {
  .app-nav-menu__trigger {
    display: none;
  }
}

.app-nav-menu {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2px;
  width: min(280px, calc(100vw - 24px));
  min-height: 0;
  padding: 10px;
  overflow-y: auto;
  overscroll-behavior: contain;
  color: var(--mx-on-surface);
  border-radius: var(--mx-radius-lg);
}

.app-nav-menu__link {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 46px;
  padding: 0 14px;
  font-weight: 800;
  color: inherit;
  text-decoration: none;
  border-radius: var(--mx-radius-sm);
}

.app-nav-menu__link:hover {
  background: color-mix(in srgb, var(--mx-on-surface) 8%, transparent);
}

.app-nav-menu__link--active {
  color: var(--mx-on-cta);
  background: var(--mx-cta);
}

.app-nav-menu__link--active:hover {
  background: var(--mx-cta);
}

.app-nav-menu__link:focus-visible {
  outline: 3px solid var(--mx-focus);
  outline-offset: 1px;
}

@media (prefers-reduced-motion: reduce) {
  .app-nav-menu__trigger,
  .app-nav-menu__trigger:hover {
    transition: none;
    transform: none;
  }
}
</style>
