<template>
  <MxButton
    data-testid="rate-button"
    :icon="rating === null ? 'mdi-album' : 'mdi-pencil'"
    :label="rating === null ? t('composer.rate') : t('composer.yourRating', { rating: formatRatingValue(rating, locale) })"
    :size="size"
    :variant="variant"
    @click="start"
  />
</template>

<script lang="ts" setup>
  import type { ComposerTarget } from '@/stores/composer'
  import type { ButtonVariant } from '@pedrolucaslopes/mixtape-ui'
  import { formatRatingValue, MxButton } from '@pedrolucaslopes/mixtape-ui'
  import { useI18n } from 'vue-i18n'
  import { useAuthAction } from '@/composables/useAuthAction'
  import { useComposerStore } from '@/stores/composer'

  const props = withDefaults(defineProps<{
    target: ComposerTarget
    rating?: number | null
    variant?: ButtonVariant
    size?: 'sm' | 'md' | 'lg'
  }>(), { rating: null, variant: 'cta', size: 'md' })

  const { t, locale } = useI18n()
  const composer = useComposerStore()
  const { requireAuth } = useAuthAction()

  function start (): void {
    if (requireAuth(t('composer.signInToRate'))) void composer.start(props.target)
  }
</script>
