<template>
  <div class="listen-later-crate" data-testid="listen-later-crate">
    <MxSkeleton v-if="store.mine === null" aria-hidden="true" height="320px" shape="rect" />

    <MxEmptyState
      v-else-if="store.mine.length === 0"
      compact
      :description="t('listenLater.emptyDescription')"
      duotone="violet"
      :heading-level="3"
      icon="mdi-bookmark-outline"
      :title="t('listenLater.empty')"
    />

    <MxCrate
      v-else
      v-model:pulled="pulled"
      data-testid="listen-later-crate-crate"
      :label="t('listenLater.crateLabel')"
      :records="records"
    >
      <template #pulled="{ record }">
        <CratePulledCard v-bind="pulledCard(record.key, record.title)" meta-icon="mdi-bookmark-outline" />
      </template>
    </MxCrate>
  </div>
</template>

<script lang="ts" setup>
  import type { ListenLater } from '@/types/api'
  import type { CrateRecord } from '@pedrolucaslopes/mixtape-ui'
  import { MxCrate, MxEmptyState, MxSkeleton, relativeTime, yearOf } from '@pedrolucaslopes/mixtape-ui'
  import { computed, onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import CratePulledCard from '@/components/CratePulledCard.vue'
  import { useListenLaterStore } from '@/stores/listenLater'

  const { t, locale } = useI18n()
  const store = useListenLaterStore()
  const pulled = ref<string | null>(null)

  const keyOf = (entry: ListenLater) => `${entry.item.type}:${entry.item.id}`

  const records = computed<CrateRecord[]>(() => (store.mine ?? []).map(entry => ({
    key: keyOf(entry),
    title: entry.item.title,
    subtitle: entry.item.artistName ?? null,
    cover: entry.item.coverUrl ?? null,
    seed: entry.item.id,
  })))

  function pulledCard (key: string, title: string) {
    const entry = store.mine?.find(item => keyOf(item) === key)
    if (!entry) return { id: key, kind: 'ALBUM' as const, title }
    return {
      id: entry.item.id,
      kind: entry.item.type,
      title: entry.item.title,
      subtitle: entry.item.artistName ?? null,
      meta: t('listenLater.addedOn', { when: relativeTime(entry.addedAt, locale.value) }),
      cover: entry.item.coverUrl ?? null,
      year: yearOf(entry.item.releaseDate ?? null),
    }
  }

  onMounted(() => {
    void store.ensure()
  })
</script>

<style scoped>
.listen-later-crate {
  display: grid;
  min-width: 0;
}
</style>
