<template>
  <div ref="root" class="when-visible" data-testid="when-visible" :style="visible ? undefined : { minHeight }">
    <slot v-if="visible" />
  </div>
</template>

<script lang="ts" setup>
  import { useInView } from '@pedrolucaslopes/mixtape-ui'
  import { ref } from 'vue'

  withDefaults(defineProps<{ minHeight?: string }>(), { minHeight: '120px' })

  const root = ref<HTMLElement | null>(null)
  const visible = useInView(root, { rootMargin: '400px 0px' })
</script>
