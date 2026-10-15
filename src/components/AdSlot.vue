<template>
  <MxAdFrame
    v-if="slot"
    class="ad-slot"
    data-testid="ad-slot"
    :label="t('ads.label')"
    :variant="variant"
  >
    <ins
      ref="unit"
      class="adsbygoogle ad-slot__unit"
      :data-ad-client="ads.config?.clientId ?? undefined"
      data-ad-format="auto"
      :data-ad-slot="slot"
      :data-adtest="ads.config?.testMode ? 'on' : undefined"
      data-full-width-responsive="true"
    />
  </MxAdFrame>
</template>

<script lang="ts" setup>
  import type { AdPlacement } from '@/types/api'
  import { MxAdFrame } from '@pedrolucaslopes/mixtape-ui'
  import { computed, onMounted, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ADSENSE_PUSH_DELAY_MS } from '@/constants/ads'
  import { useAdsStore } from '@/stores/ads'
  import { useConsentStore } from '@/stores/consent'

  const props = withDefaults(defineProps<{ placement: AdPlacement, variant?: 'banner' | 'rectangle' | 'inline' }>(), {
    variant: 'banner',
  })

  const { t } = useI18n()
  const ads = useAdsStore()
  const consent = useConsentStore()
  const unit = ref<HTMLElement | null>(null)
  let pushed = false

  const slot = computed(() => (ads.enabled && consent.choice !== null ? ads.slotFor(props.placement) : null))

  async function render (): Promise<void> {
    if (pushed || !slot.value) return
    const ready = await ads.ensureScript()
    if (!ready || !unit.value) return
    pushed = true
    setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle ?? []).push({})
      } catch {
        pushed = false
      }
    }, ADSENSE_PUSH_DELAY_MS)
  }

  onMounted(() => void render())
  watch(slot, () => void render(), { flush: 'post' })
</script>

<style scoped>
.ad-slot {
  margin-block: clamp(24px, 4vw, 40px);
}

.ad-slot__unit {
  display: block;
  width: 100%;
}
</style>
