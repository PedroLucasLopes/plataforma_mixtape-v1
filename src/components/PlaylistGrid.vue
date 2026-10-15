<template>
  <div class="playlist-grid" data-testid="playlist-grid">
    <div v-if="!paged.loaded.value && paged.loading.value" aria-hidden="true" class="playlist-grid__skeleton">
      <MxSkeleton v-for="index in 6" :key="index" shape="square" />
    </div>

    <MxErrorState v-else-if="paged.error.value && paged.items.value.length === 0" compact :description="paged.error.value" @retry="paged.reset()" />

    <MxEmptyState
      v-else-if="paged.loaded.value && paged.items.value.length === 0"
      compact
      :description="emptyDescription"
      duotone="blush"
      :heading-level="3"
      icon="mdi-playlist-music"
      :title="emptyTitle"
    >
      <slot name="empty" />
    </MxEmptyState>

    <template v-else>
      <MxGrid :label="label" min="180px">
        <li v-for="(playlist, index) in paged.items.value" :key="playlist.id" v-reveal="{ variant: 'up', delay: index % 8 * 50 }">
          <PlaylistCard :playlist="playlist" />
        </li>
      </MxGrid>

      <MxLoadMore data-testid="playlist-grid-load-more" :has-more="paged.hasMore.value" :loading="paged.loading.value" @load="paged.loadMore()" />
    </template>
  </div>
</template>

<script lang="ts" setup>
  import type { Page, PlaylistSummary } from '@/types/api'
  import { MxEmptyState, MxErrorState, MxGrid, MxLoadMore, MxSkeleton, vReveal } from '@pedrolucaslopes/mixtape-ui'
  import PlaylistCard from '@/components/PlaylistCard.vue'
  import { usePaged } from '@/composables/usePaged'

  const props = defineProps<{
    loader: (page: number, limit: number) => Promise<Page<PlaylistSummary>>
    watchKey?: unknown
    label: string
    emptyTitle: string
    emptyDescription?: string
  }>()

  const paged = usePaged<PlaylistSummary>((page, limit) => props.loader(page, limit), { watch: () => props.watchKey })

  defineExpose({ reset: paged.reset })
</script>

<style scoped>
.playlist-grid {
  display: grid;
  gap: 16px;
}

.playlist-grid__skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}
</style>
