<template>
  <MxGlass class="listen-panel" data-testid="listen-panel" variant="panel">
    <h2 class="panel-title">{{ title ?? t('item.listenOn') }}</h2>
    <MxStreamingLinks v-if="hasLinks" :links="links" :only="only" />
    <p v-else class="muted listen-panel__empty">{{ t('item.noLinks') }}</p>
  </MxGlass>
</template>

<script lang="ts" setup>
  import type { BrandName } from '@pedrolucaslopes/mixtape-ui'
  import { MxGlass, MxStreamingLinks } from '@pedrolucaslopes/mixtape-ui'
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'

  const props = defineProps<{
    links: Readonly<Record<string, string | undefined>>
    only?: readonly BrandName[]
    title?: string
  }>()

  const { t } = useI18n()

  const hasLinks = computed(() => Object.entries(props.links).some(([name, url]) =>
    typeof url === 'string' && url.length > 0 && (!props.only || (props.only as readonly string[]).includes(name))))
</script>

<style scoped>
.listen-panel {
  display: grid;
  gap: 14px;
}

.listen-panel__empty {
  margin: 0;
}
</style>
