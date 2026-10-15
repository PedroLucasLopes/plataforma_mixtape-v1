<template>
  <VApp data-testid="app">
    <RouterView />
    <MxToastHost />
  </VApp>
</template>

<script lang="ts" setup>
  import { bindVuetifyTheme, MxToastHost } from '@pedrolucaslopes/mixtape-ui'
  import { useHead } from '@unhead/vue'
  import { useI18n } from 'vue-i18n'

  const { t, locale } = useI18n()

  bindVuetifyTheme()

  useHead({
    titleTemplate: title => (title ? `${title} · ${t('app.name')}` : t('seo.home.title')),
    htmlAttrs: { lang: locale },
  })
</script>
