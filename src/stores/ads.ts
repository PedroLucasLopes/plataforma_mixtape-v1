import type { AdPlacement, AdsConfig } from '@/types/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { adsApi } from '@/services/mixtape'
import { useConsentStore } from './consent'

declare global {
  interface Window {
    adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number }
  }
}

export const useAdsStore = defineStore('ads', () => {
  const config = ref<AdsConfig | null>(null)
  let loading: Promise<void> | null = null
  let script: Promise<boolean> | null = null

  const enabled = computed(() => Boolean(config.value?.enabled && config.value.clientId && config.value.scriptUrl))

  function load (): Promise<void> {
    loading ??= adsApi.config().then(result => {
      config.value = result
    }).catch(() => {
      config.value = null
    })
    return loading
  }

  function slotFor (placement: AdPlacement): string | null {
    return config.value?.placements.find(entry => entry.placement === placement)?.slotId ?? null
  }

  function ensureScript (): Promise<boolean> {
    const consent = useConsentStore()
    if (!enabled.value || !config.value?.scriptUrl || !config.value.clientId || consent.choice === null) {
      return Promise.resolve(false)
    }
    script ??= new Promise<boolean>(resolve => {
      const queue = (window.adsbygoogle = window.adsbygoogle ?? [])
      if (consent.choice === 'essential') {
        queue.requestNonPersonalizedAds = 1
      }
      const element = document.createElement('script')
      element.async = true
      element.crossOrigin = 'anonymous'
      element.src = config.value!.scriptUrl!
      element.addEventListener('load', () => resolve(true))
      element.addEventListener('error', () => resolve(false))
      document.head.append(element)
    })
    return script
  }

  return { config, enabled, load, slotFor, ensureScript }
})
