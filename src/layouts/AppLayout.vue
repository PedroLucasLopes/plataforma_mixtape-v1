<template>
  <MxAppShell
    :active-tab="activeTab"
    data-testid="layout-app"
    :loading="routeLoading"
    :nav-label="t('nav.main')"
    :tab-items="tabs"
    :tab-label="t('nav.tabs')"
  >
    <template #brand>
      <AppBrand />
    </template>

    <template #nav>
      <RouterLink
        v-for="entry in navEntries"
        :key="entry.key"
        :aria-current="route.meta.nav === entry.key ? 'page' : undefined"
        class="app-nav__link"
        :class="{ 'app-nav__link--active': route.meta.nav === entry.key }"
        data-testid="layout-app-nav-link"
        :to="{ name: entry.route }"
      >
        {{ t(entry.label) }}
      </RouterLink>
    </template>

    <template #search>
      <MxSearchField
        v-model="query"
        data-testid="layout-app-search"
        :label="t('search.label')"
        :placeholder="t('search.placeholder')"
        @submit="search"
      />
    </template>

    <template #actions>
      <AppNavMenu />

      <template v-if="session.isAuthenticated && session.user">
        <MxButton
          class="app-rate-button"
          data-testid="layout-app-rate"
          icon="mdi-plus"
          :label="t('nav.rate')"
          size="sm"
          :to="{ name: ROUTE.search, query: { rate: '1' } }"
        />

        <MxUserMenu
          :avatar-url="session.user.avatarUrl"
          data-testid="layout-app-user-menu"
          :items="menuItems"
          :name="session.user.fullName"
          :theme-mode="preferences.themeMode"
          :username="session.user.username"
          @sign-out="signOut"
          @update:theme-mode="preferences.setThemeMode"
        />
      </template>

      <template v-else>
        <MxButton
          class="app-auth-button"
          data-testid="layout-app-sign-in"
          :label="t('auth.signIn')"
          size="sm"
          :to="{ name: ROUTE.login, query: { redirect: route.fullPath } }"
          variant="ghost"
        />

        <MxButton data-testid="layout-app-sign-up" :label="t('auth.signUp')" size="sm" :to="{ name: ROUTE.register }" />
      </template>
    </template>

    <template #fab>
      <MxIconButton
        data-testid="layout-app-rate-fab"
        icon="mdi-plus"
        :label="t('nav.rate')"
        size="lg"
        :to="{ name: ROUTE.search, query: { rate: '1' } }"
        variant="cta"
      />
    </template>

    <RouterView v-slot="{ Component, route: current }">
      <div v-if="viewTransitions" :key="current.path" class="app-route">
        <component :is="Component" />
      </div>

      <Transition v-else mode="out-in" name="page">
        <div :key="current.path" class="app-route">
          <component :is="Component" />
        </div>
      </Transition>
    </RouterView>

    <template #footer>
      <AppFooter />
    </template>

    <template #overlays>
      <ReviewComposer v-if="composerNeeded" />
      <PlaylistPickerDialog v-if="pickerNeeded" />
      <ShareHost v-if="shareNeeded" />
      <CelebrationDialog v-if="celebrationNeeded" />
      <ConsentHost v-if="consentNeeded" />
    </template>
  </MxAppShell>
</template>

<script lang="ts" setup>
  import type { TabBarItem, UserMenuItem } from '@pedrolucaslopes/mixtape-ui'
  import { MxAppShell, MxButton, MxIconButton, MxSearchField, MxUserMenu, supportsViewTransitions, toast } from '@pedrolucaslopes/mixtape-ui'
  import { computed, defineAsyncComponent, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import AppBrand from '@/components/AppBrand.vue'
  import AppFooter from '@/components/AppFooter.vue'
  import AppNavMenu from '@/components/AppNavMenu.vue'
  import { useLatch } from '@/composables/useLatch'
  import { ADMIN_MENU, MAIN_NAV, TAB_NAV, USER_MENU } from '@/constants/navigation'
  import { routeLoading } from '@/router/loading'
  import { ROUTE } from '@/router/routes'
  import { useAdsStore } from '@/stores/ads'
  import { useComposerStore } from '@/stores/composer'
  import { useConsentStore } from '@/stores/consent'
  import { usePlaylistPickerStore } from '@/stores/playlistPicker'
  import { usePreferencesStore } from '@/stores/preferences'
  import { useSessionStore } from '@/stores/session'
  import { useShareStore } from '@/stores/share'
  import { queryString } from '@/utils/navigation'

  const ReviewComposer = defineAsyncComponent(() => import('@/components/ReviewComposer.vue'))
  const PlaylistPickerDialog = defineAsyncComponent(() => import('@/components/PlaylistPickerDialog.vue'))
  const ShareHost = defineAsyncComponent(() => import('@/components/ShareHost.vue'))
  const CelebrationDialog = defineAsyncComponent(() => import('@/components/CelebrationDialog.vue'))
  const ConsentHost = defineAsyncComponent(() => import('@/components/ConsentHost.vue'))

  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const session = useSessionStore()
  const preferences = usePreferencesStore()
  const ads = useAdsStore()
  const composer = useComposerStore()
  const picker = usePlaylistPickerStore()
  const share = useShareStore()
  const consent = useConsentStore()

  void ads.load()

  const composerNeeded = useLatch(() => composer.open)
  const pickerNeeded = useLatch(() => picker.open)
  const shareNeeded = useLatch(() => share.open)
  const celebrationNeeded = useLatch(() => composer.celebration !== null)
  const consentNeeded = useLatch(() => ads.enabled && consent.choice === null)

  const viewTransitions = supportsViewTransitions()
  const query = ref(queryString(route.query.q) ?? '')

  watch(() => route.query.q, value => {
    if (route.name === ROUTE.search) query.value = queryString(value) ?? ''
  })

  const navEntries = computed(() => MAIN_NAV.filter(entry => !entry.auth || session.isAuthenticated))

  const tabs = computed<TabBarItem[]>(() => TAB_NAV.map(entry => ({
    key: entry.key,
    label: t(entry.label),
    icon: entry.icon,
    activeIcon: entry.activeIcon,
    to: entry.key === 'profile' && !session.isAuthenticated
      ? { name: ROUTE.login, query: { redirect: '/me' } }
      : { name: entry.route },
  })))

  const activeTab = computed(() => route.meta.tab ?? null)

  const menuItems = computed<UserMenuItem[]>(() => [...USER_MENU, ...(session.isAdmin ? [ADMIN_MENU] : [])].map(entry => ({
    key: entry.key,
    label: t(entry.label),
    icon: entry.icon,
    to: { name: entry.route },
  })))

  function search (value: string): void {
    void router.push({ name: ROUTE.search, query: { ...route.name === ROUTE.search ? route.query : {}, q: value } })
  }

  async function signOut (): Promise<void> {
    await session.logout()
    toast.info(t('auth.signedOut'))
    if (route.meta.auth === 'required') await router.replace({ name: ROUTE.home })
  }
</script>

<style scoped>
.app-nav__link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 14px;
  font-size: 0.9375rem;
  font-weight: 800;
  color: var(--mx-on-surface-muted);
  text-decoration: none;
  border-radius: var(--mx-radius-pill);
  transition:
    color var(--mx-duration-fast) var(--mx-ease-out),
    background-color var(--mx-duration-fast) var(--mx-ease-out);
}

.app-nav__link:hover {
  color: var(--mx-on-surface);
  background: color-mix(in srgb, var(--mx-on-surface) 8%, transparent);
}

.app-nav__link--active {
  color: var(--mx-on-cta);
  background: var(--mx-cta);
}

.app-nav__link--active:hover {
  color: var(--mx-on-cta);
  background: var(--mx-cta);
}

.app-nav__link:focus-visible {
  outline: 3px solid var(--mx-focus);
  outline-offset: 2px;
}

.app-rate-button,
.app-auth-button {
  display: none;
}

@media (min-width: 840px) {
  .app-rate-button,
  .app-auth-button {
    display: inline-flex;
  }
}
</style>
