<template>
  <MxFooter :columns="columns" data-testid="app-footer" :label="t('footer.label')">
    <template #brand>
      <div class="app-footer__brand">
        <AppBrand />
        <p>{{ t('footer.tagline') }}</p>
      </div>
    </template>

    <p class="app-footer__attribution">
      {{ t('footer.attribution') }}
      <template v-for="(source, index) in DATA_SOURCES" :key="source.name">
        <a data-testid="app-footer-data-source" :href="source.url" rel="noopener noreferrer" target="_blank">{{ source.name }}</a>
        <template v-if="index < DATA_SOURCES.length - 1"> · </template>
      </template>
    </p>

    <p class="app-footer__legal">
      {{ t('footer.copyright', { year }) }}
      <button
        v-if="ads.enabled"
        class="app-footer__cookies"
        data-testid="app-footer-cookies"
        type="button"
        @click="consent.reopen()"
      >{{ t('footer.cookies') }}</button>
    </p>
  </MxFooter>
</template>

<script lang="ts" setup>
  import type { FooterColumn } from '@pedrolucaslopes/mixtape-ui'
  import { MxFooter } from '@pedrolucaslopes/mixtape-ui'
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import AppBrand from '@/components/AppBrand.vue'
  import { DATA_SOURCES } from '@/constants/sources'
  import { ROUTE } from '@/router/routes'
  import { useAdsStore } from '@/stores/ads'
  import { useConsentStore } from '@/stores/consent'
  import { useSessionStore } from '@/stores/session'

  const { t } = useI18n()
  const session = useSessionStore()
  const ads = useAdsStore()
  const consent = useConsentStore()
  const year = new Date().getFullYear()

  const columns = computed<FooterColumn[]>(() => [
    {
      title: t('footer.explore'),
      links: [
        { label: t('nav.charts'), to: { name: ROUTE.charts } },
        { label: t('nav.reviews'), to: { name: ROUTE.reviews } },
        { label: t('nav.playlists'), to: { name: ROUTE.playlists } },
        { label: t('nav.rankings'), to: { name: ROUTE.rankings } },
        { label: t('nav.awards'), to: { name: ROUTE.awards } },
      ],
    },
    {
      title: t('footer.mixtape'),
      links: [
        { label: t('nav.howItWorks'), to: { name: ROUTE.howItWorks } },
        { label: t('nav.privacy'), to: { name: ROUTE.privacy } },
        { label: t('nav.terms'), to: { name: ROUTE.terms } },
      ],
    },
    {
      title: t('footer.account'),
      links: session.isAuthenticated
        ? [
          { label: t('nav.myProfile'), to: { name: ROUTE.myProfile } },
          { label: t('nav.myLibrary'), to: { name: ROUTE.myLibrary } },
          { label: t('nav.settings'), to: { name: ROUTE.settings } },
        ]
        : [
          { label: t('auth.signIn'), to: { name: ROUTE.login } },
          { label: t('auth.signUp'), to: { name: ROUTE.register } },
        ],
    },
  ])
</script>

<style scoped>
.app-footer__brand {
  display: grid;
  gap: 10px;
  max-width: 34ch;
}

.app-footer__brand p {
  margin: 0;
  line-height: 1.5;
  color: var(--mx-on-surface-muted);
}

.app-footer__attribution,
.app-footer__legal {
  margin: 0 0 6px;
}

.app-footer__cookies {
  margin-inline-start: 10px;
  padding: 0;
  font: inherit;
  font-weight: 700;
  color: var(--mx-link);
  text-decoration: underline;
  cursor: pointer;
  background: none;
  border: 0;
}

.app-footer__cookies:focus-visible {
  outline: 2px solid var(--mx-focus);
  outline-offset: 2px;
}
</style>
