<template>
  <div v-if="loading && !items" aria-hidden="true" class="home-rail__skeleton" data-testid="home-rail">
    <MxSkeleton v-for="index in 5" :key="index" shape="square" />
  </div>

  <MxErrorState
    v-else-if="error && !items"
    compact
    data-testid="home-rail"
    :description="error"
    @retry="emit('retry')"
  />

  <p v-else-if="!items || items.length === 0" class="home-rail__empty muted" data-testid="home-rail">{{ empty }}</p>

  <MxRail
    v-else
    ref="rail"
    data-testid="home-rail"
    :item-width="itemWidth"
    :label="label"
  >
    <li
      v-for="(item, index) in items"
      :key="index"
      v-reveal="{ variant: 'up', delay: Math.min(index, 6) * 70 }"
      :data-rail-index="index"
    >
      <slot :index="index" :item="item" />
    </li>
  </MxRail>
</template>

<script lang="ts" setup generic="T">
  import type { ComponentPublicInstance } from 'vue'
  import { MxErrorState, MxRail, MxSkeleton, prefersReducedMotion, vReveal } from '@pedrolucaslopes/mixtape-ui'
  import { useTemplateRef } from 'vue'

  withDefaults(defineProps<{
    items: readonly T[] | null | undefined
    loading: boolean
    error?: string | null
    empty: string
    label: string
    itemWidth?: string
  }>(), { error: null, itemWidth: 'clamp(150px, 42vw, 210px)' })

  const emit = defineEmits<{ retry: [] }>()

  defineSlots<{ default: (props: { item: T, index: number }) => unknown }>()

  const rail = useTemplateRef<ComponentPublicInstance>('rail')

  function reveal (index: number): void {
    const root = rail.value?.$el as HTMLElement | undefined
    const entry = root?.querySelector<HTMLElement>(`[data-rail-index="${CSS.escape(String(index))}"]`)
    if (!entry) {
      return
    }
    entry.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest', inline: 'start' })
    entry.querySelector<HTMLElement>('a, button')?.focus({ preventScroll: true })
  }

  defineExpose({ reveal })
</script>

<style scoped>
.home-rail__skeleton {
  display: grid;
  grid-auto-columns: clamp(150px, 42vw, 210px);
  grid-auto-flow: column;
  gap: 16px;
  overflow: hidden;
}

.home-rail__empty {
  margin: 0;
  padding: 24px;
  text-align: center;
  background: var(--mx-surface);
  border-radius: var(--mx-radius-lg);
}
</style>
