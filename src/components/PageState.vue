<template>
  <div class="page-state" data-testid="page-state">
    <div v-if="loading && !ready" :aria-label="t('common.loading')" class="page-state__loading" role="status">
      <slot name="skeleton">
        <div class="page-state__hero">
          <MxSkeleton shape="square" width="min(100%, 320px)" />

          <div class="page-state__lines">
            <MxSkeleton height="18px" width="40%" />
            <MxSkeleton height="64px" width="85%" />
            <MxSkeleton :lines="3" shape="text" />
          </div>
        </div>
      </slot>
    </div>

    <MxEmptyState
      v-else-if="notFound"
      :description="notFoundDescription ?? t('errors.notFound.description')"
      duotone="pink"
      icon="mdi-album"
      :title="notFoundTitle ?? t('errors.notFound.title')"
    >
      <MxButton data-testid="page-state-search" icon="mdi-magnify" :label="t('errors.notFound.search')" :to="{ name: ROUTE.search }" />
    </MxEmptyState>

    <MxErrorState v-else-if="error && !ready" :description="error" :retrying="loading" @retry="emit('retry')" />
    <slot v-else-if="ready" />
  </div>
</template>

<script lang="ts" setup>
  import { MxButton, MxEmptyState, MxErrorState, MxSkeleton } from '@pedrolucaslopes/mixtape-ui'
  import { useI18n } from 'vue-i18n'
  import { ROUTE } from '@/router/routes'

  defineProps<{
    loading: boolean
    ready: boolean
    error?: string | null
    notFound?: boolean
    notFoundTitle?: string
    notFoundDescription?: string
  }>()

  const emit = defineEmits<{ retry: [] }>()

  const { t } = useI18n()
</script>

<style scoped>
.page-state {
  min-width: 0;
}

.page-state__hero {
  display: grid;
  gap: 24px;
  align-items: center;
  padding: clamp(24px, 5vw, 56px);
  background: var(--mx-surface);
  border-radius: var(--mx-radius-xl);
}

@media (min-width: 840px) {
  .page-state__hero {
    grid-template-columns: 320px 1fr;
  }
}

.page-state__lines {
  display: grid;
  gap: 16px;
}
</style>
