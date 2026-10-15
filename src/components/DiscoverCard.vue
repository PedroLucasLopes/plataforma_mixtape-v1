<template>
  <div v-if="inline" class="discover-inline" data-testid="discover-card">
    <MxSkeleton v-if="!albums.data.value && albums.loading.value" aria-hidden="true" height="360px" shape="rect" />

    <MxErrorState
      v-else-if="albums.error.value"
      compact
      :description="albums.error.value"
      :retrying="albums.loading.value"
      @retry="albums.reload()"
    />

    <p v-else-if="records.length === 0" class="muted">{{ t('discover.empty') }}</p>

    <MxCrate
      v-else
      v-model:pulled="pulled"
      data-testid="discover-card-crate"
      :label="t('discover.crateLabel')"
      :records="records"
    >
      <template #pulled="{ record }">
        <CratePulledCard v-bind="pulledCard(record.key, record.title)" />
      </template>
    </MxCrate>

    <MxButton
      v-if="albums.data.value"
      class="discover-inline__shuffle"
      data-testid="discover-card-shuffle"
      icon="mdi-shuffle-variant"
      :label="t('discover.shuffle')"
      :loading="albums.loading.value"
      size="sm"
      variant="glass"
      @click="shuffle"
    />
  </div>

  <article
    v-else
    class="discover-card"
    data-testid="discover-card"
    :style="{ '--discover-bg': colors.background, '--discover-ink': colors.ink, '--discover-accent': colors.accent }"
  >
    <span aria-hidden="true" class="discover-card__dot" />

    <header class="discover-card__header">
      <h2 class="discover-card__label">
        <VIcon aria-hidden="true" icon="mdi-compass-outline" size="18" />
        {{ t('discover.title') }}
      </h2>

      <MxIconButton
        data-testid="discover-card-shuffle"
        :disabled="albums.loading.value"
        icon="mdi-shuffle-variant"
        :label="t('discover.shuffle')"
        size="sm"
        variant="ink"
        @click="shuffle"
      />
    </header>

    <MxSkeleton v-if="!albums.data.value && albums.loading.value" aria-hidden="true" height="216px" shape="rect" />

    <div v-else-if="albums.error.value" class="discover-card__message">
      <p>{{ albums.error.value }}</p>

      <MxButton
        data-testid="discover-card-retry"
        icon="mdi-refresh"
        :label="t('discover.retry')"
        size="sm"
        variant="ink-outline"
        @click="albums.reload()"
      />
    </div>

    <p v-else-if="records.length === 0" class="discover-card__message">{{ t('discover.empty') }}</p>

    <MxCrate
      v-else
      v-model:pulled="pulled"
      compact
      data-testid="discover-card-crate"
      :depth="DISCOVER_STACK_DEPTH"
      :label="t('discover.crateLabel')"
      :records="records"
    />

    <p class="discover-card__sentence">{{ t('discover.sentence') }}</p>

    <MxDialog
      v-model="dialogOpen"
      data-testid="discover-card-dialog"
      :description="pulledAlbum?.artistCredit"
      :title="pulledAlbum?.title ?? ''"
      :width="460"
    >
      <div v-if="pulledAlbum" class="discover-card__pulled">
        <MxCover
          :seed="pulledAlbum.id"
          size="120px"
          :sources="coverSources(pulledAlbum.cover)"
          :title="pulledAlbum.title"
        />

        <CratePulledCard v-bind="pulledCard(pulledAlbum.id, pulledAlbum.title)" :heading="false" />
      </div>
    </MxDialog>
  </article>
</template>

<script lang="ts" setup>
  import {
    duotones,
    MxButton,
    MxCover,
    MxCrate,
    MxDialog,
    MxErrorState,
    MxIconButton,
    MxSkeleton,
    yearOf,
  } from '@pedrolucaslopes/mixtape-ui'
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import CratePulledCard from '@/components/CratePulledCard.vue'
  import { useAsyncData } from '@/composables/useAsyncData'
  import { crateRecord, useCatalogCards } from '@/composables/useCatalogCards'
  import { useLabels } from '@/composables/useLabels'
  import { DISCOVER_ALBUMS, DISCOVER_DUOTONE, DISCOVER_STACK_DEPTH } from '@/constants/catalog'
  import { discoverApi } from '@/services/mixtape'
  import { useComposerStore } from '@/stores/composer'
  import { coverSources } from '@/utils/items'

  const props = withDefaults(defineProps<{ inline?: boolean }>(), { inline: false })

  const { t } = useI18n()
  const cards = useCatalogCards()
  const labels = useLabels()
  const composer = useComposerStore()
  const colors = duotones[DISCOVER_DUOTONE]

  const albums = useAsyncData(signal => discoverApi.albums(DISCOVER_ALBUMS, signal))
  const pulled = ref<string | null>(null)
  const rated = ref<ReadonlySet<string>>(new Set())

  const fresh = computed(() => (albums.data.value ?? []).filter(album => !rated.value.has(album.id)))
  const records = computed(() => fresh.value.map(album => crateRecord(album.id, cards.album(album))))
  const pulledAlbum = computed(() => fresh.value.find(album => album.id === pulled.value) ?? null)

  const dialogOpen = computed({
    get: () => !props.inline && pulledAlbum.value !== null,
    set: open => {
      if (!open) pulled.value = null
    },
  })

  function pulledCard (key: string, title: string) {
    const album = fresh.value.find(item => item.id === key)
    return {
      id: key,
      kind: 'ALBUM' as const,
      title,
      subtitle: album?.artistCredit ?? null,
      meta: labels.listeners(album?.listenerCount),
      cover: album?.cover?.medium ?? null,
      year: yearOf(album?.firstReleaseDate ?? null),
    }
  }

  function shuffle (): void {
    pulled.value = null
    rated.value = new Set()
    void albums.reload()
  }

  watch(() => composer.open, open => {
    if (open && !props.inline) pulled.value = null
  })

  watch(() => composer.changed, value => {
    if (value?.type === 'ALBUM') rated.value = new Set([...rated.value, value.id])
  })
</script>

<style scoped>
.discover-inline {
  display: grid;
  gap: 14px;
  min-width: 0;
}

.discover-inline__shuffle {
  justify-self: center;
}

.discover-card {
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-width: 0;
  height: 100%;
  padding: 18px 18px 22px;
  overflow: hidden;
  color: var(--discover-ink);
  background: var(--discover-bg);
  border-radius: var(--mx-radius-lg);
}

.discover-card :deep(.mx-crate.mx-crate--compact) {
  --mx-crate-size: clamp(150px, 13vw, 196px);
  --mx-crate-step: 9px;
}

.discover-card__dot {
  position: absolute;
  top: -34px;
  right: -34px;
  z-index: -1;
  width: 120px;
  height: 120px;
  background: var(--discover-accent);
  border-radius: 50%;
  opacity: 0.85;
}

.discover-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.discover-card__label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: var(--mx-text-overline);
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.discover-card__message {
  display: grid;
  justify-items: start;
  gap: 10px;
  margin: 12px 0;
  font-weight: 650;
}

.discover-card__message p {
  margin: 0;
}

.discover-card__sentence {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 650;
  line-height: 1.45;
}

.discover-card__pulled {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  align-items: start;
  gap: 18px;
}

@media (max-width: 420px) {
  .discover-card__pulled {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
