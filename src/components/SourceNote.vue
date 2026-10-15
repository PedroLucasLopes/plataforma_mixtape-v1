<template>
  <p class="source-note" data-testid="source-note">
    <MxBrandIcon name="musicbrainz" :size="18" />

    <span>
      {{ t('item.source') }}
      <a data-testid="source-note-link" :href="source.url" rel="noopener noreferrer" target="_blank">{{ source.provider }}</a>
      · {{ t('item.sourceLicense') }}
    </span>
  </p>
</template>

<script lang="ts" setup>
  import type { SourceAttribution } from '@/types/api'
  import { MxBrandIcon } from '@pedrolucaslopes/mixtape-ui'
  import { useI18n } from 'vue-i18n'

  defineProps<{ source: SourceAttribution }>()

  const { t } = useI18n()
</script>

<style scoped>
.source-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 0.8125rem;
  color: var(--mx-on-surface-muted);
}

.source-note a {
  font-weight: 700;
  color: var(--mx-link);
}
</style>
