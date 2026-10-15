<template>
  <MxLoader data-testid="page-me-redirect" :label="t('common.loading')" />
</template>

<script lang="ts" setup>
  import { MxLoader } from '@pedrolucaslopes/mixtape-ui'
  import { onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import { ROUTE } from '@/router/routes'
  import { useSessionStore } from '@/stores/session'
  import { libraryRoute, profileRoute } from '@/utils/items'

  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const session = useSessionStore()

  onMounted(() => {
    const username = session.username
    if (!username) {
      void router.replace({ name: ROUTE.login, query: { redirect: route.fullPath } })
      return
    }
    void router.replace(route.name === ROUTE.myLibrary ? libraryRoute(username) : profileRoute(username))
  })
</script>
