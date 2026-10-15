<template>
  <MxConsentBanner
    :accept-label="t('consent.accept')"
    data-testid="consent-host"
    :description="t('consent.description')"
    :open="ads.enabled && consent.choice === null"
    :policy-to="{ name: ROUTE.privacy }"
    :reject-label="t('consent.reject')"
    :title="t('consent.title')"
    @accept="consent.decide('all')"
    @reject="consent.decide('essential')"
  />
</template>

<script lang="ts" setup>
  import { MxConsentBanner } from '@pedrolucaslopes/mixtape-ui'
  import { useI18n } from 'vue-i18n'
  import { ROUTE } from '@/router/routes'
  import { useAdsStore } from '@/stores/ads'
  import { useConsentStore } from '@/stores/consent'

  const { t } = useI18n()
  const ads = useAdsStore()
  const consent = useConsentStore()
</script>
