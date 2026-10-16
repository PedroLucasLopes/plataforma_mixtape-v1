<template>
  <MxDialog
    v-model="open"
    data-testid="favorites-editor-dialog"
    :description="t('favorites.editor.description', { albums: FAVORITE_LIMITS.ALBUM, tracks: FAVORITE_LIMITS.TRACK })"
    :title="t('favorites.editor.title')"
  >
    <div class="editor">
      <section
        v-for="group in groups"
        :key="group.kind"
        :aria-labelledby="`favorites-editor-${group.kind}`"
        class="editor__group"
      >
        <header class="editor__group-header">
          <h3 :id="`favorites-editor-${group.kind}`" class="editor__subtitle">{{ group.title }}</h3>

          <p aria-live="polite" class="editor__count" :class="{ 'editor__count--over': group.over > 0 }">
            {{ t('favorites.editor.count', { count: group.entries.length, limit: group.limit }) }}
          </p>
        </header>

        <p v-if="group.over > 0" class="editor__error" data-testid="favorites-editor-dialog-over" role="alert">
          {{ t('favorites.editor.over', { count: group.entries.length, limit: group.limit, extra: group.over }) }}
        </p>

        <ol v-if="group.entries.length > 0" :aria-label="t('favorites.editor.listLabel', { group: group.title })" class="editor__list">
          <li v-for="(entry, index) in group.entries" :key="entry.key" class="editor__row" data-testid="favorites-editor-dialog-row">
            <span aria-hidden="true" class="editor__position">{{ index + 1 }}</span>

            <MxItemCard
              data-testid="favorites-editor-dialog-row-card"
              v-bind="entry.card"
              :heading-level="4"
              layout="row"
              :to="undefined"
            />

            <div class="editor__row-actions">
              <MxIconButton
                data-testid="favorites-editor-dialog-up"
                :disabled="index === 0"
                icon="mdi-arrow-up"
                :label="t('favorites.editor.moveUp', { title: entry.card.title })"
                size="sm"
                variant="ghost"
                @click="move(entry.key, -1)"
              />

              <MxIconButton
                data-testid="favorites-editor-dialog-down"
                :disabled="index === group.entries.length - 1"
                icon="mdi-arrow-down"
                :label="t('favorites.editor.moveDown', { title: entry.card.title })"
                size="sm"
                variant="ghost"
                @click="move(entry.key, 1)"
              />

              <MxIconButton
                data-testid="favorites-editor-dialog-remove"
                icon="mdi-close"
                :label="t('favorites.editor.remove', { title: entry.card.title })"
                size="sm"
                variant="ghost"
                @click="remove(entry.key)"
              />
            </div>
          </li>
        </ol>

        <p v-else class="editor__hint">{{ t('favorites.editor.emptyList') }}</p>
      </section>

      <h3 class="editor__subtitle">{{ t('favorites.editor.addTitle') }}</h3>

      <MxSegmented
        v-model="kind"
        block
        data-testid="favorites-editor-dialog-kind"
        :label="t('favorites.editor.kindLabel')"
        :options="kindOptions"
      />

      <MxSearchField
        v-model="query"
        data-testid="favorites-editor-dialog-search"
        :label="t('favorites.editor.searchLabel')"
        :loading="searching"
        :maxlength="SEARCH_TEXT_LENGTH.max"
        :placeholder="kind === 'TRACK' ? t('favorites.editor.trackPlaceholder') : t('favorites.editor.albumPlaceholder')"
        @submit="search"
      />

      <p v-if="error" class="editor__error" role="alert">{{ error }}</p>
      <p v-else-if="searched && !searching && results.length === 0" class="editor__hint">{{ t('favorites.editor.noResults') }}</p>

      <ul v-if="results.length > 0" :aria-label="t('favorites.editor.resultsLabel')" class="editor__results">
        <li v-for="result in results" :key="result.key" data-testid="favorites-editor-dialog-result">
          <MxItemCard
            data-testid="favorites-editor-dialog-result-card"
            v-bind="result.card"
            :heading-level="4"
            layout="row"
            :to="undefined"
          >
            <template #actions>
              <MxButton
                data-testid="favorites-editor-dialog-add"
                :disabled="inDraft(result.key) || full(result.kind)"
                :icon="inDraft(result.key) ? 'mdi-check' : 'mdi-star-plus-outline'"
                :label="inDraft(result.key) ? t('favorites.editor.added') : t('favorites.editor.add')"
                size="sm"
                @click="add(result)"
              />
            </template>
          </MxItemCard>
        </li>
      </ul>
    </div>

    <template #actions>
      <MxButton data-testid="favorites-editor-dialog-cancel" :label="t('common.cancel')" variant="ghost" @click="open = false" />

      <MxButton
        data-testid="favorites-editor-dialog-save"
        :disabled="groups.some(group => group.over > 0)"
        icon="mdi-content-save-outline"
        :label="t('favorites.editor.save')"
        :loading="saving"
        @click="save"
      />
    </template>
  </MxDialog>
</template>

<script lang="ts" setup>
  import type { CatalogCard } from '@/composables/useCatalogCards'
  import type { Favorite, FavoriteKind } from '@/types/api'
  import { MxButton, MxDialog, MxIconButton, MxItemCard, MxSearchField, MxSegmented, type SegmentedOption, toast } from '@pedrolucaslopes/mixtape-ui'
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useCatalogCards } from '@/composables/useCatalogCards'
  import { FAVORITE_GROUPS, FAVORITE_LIMITS, FAVORITES_SEARCH_LIMIT } from '@/constants/api'
  import { SEARCH_TEXT_LENGTH } from '@/constants/validation'
  import { errorMessage } from '@/services/http'
  import { catalogApi } from '@/services/mixtape'
  import { useFavoritesStore } from '@/stores/favorites'

  interface DraftEntry {
    key: string
    kind: FavoriteKind
    id: string
    card: CatalogCard
  }

  const open = defineModel<boolean>({ default: false })
  const props = defineProps<{ favorites: readonly Favorite[] }>()

  const { t } = useI18n()
  const cards = useCatalogCards()
  const store = useFavoritesStore()

  const draft = ref<DraftEntry[]>([])
  const kind = ref<FavoriteKind>('ALBUM')
  const query = ref('')
  const searching = ref(false)
  const searched = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const results = ref<DraftEntry[]>([])

  const groups = computed(() => FAVORITE_GROUPS.map(group => {
    const entries = draft.value.filter(entry => entry.kind === group)
    const limit = FAVORITE_LIMITS[group]
    return {
      kind: group,
      title: group === 'ALBUM' ? t('favorites.albums') : t('favorites.tracks'),
      entries,
      limit,
      over: Math.max(0, entries.length - limit),
    }
  }))

  const kindOptions = computed<SegmentedOption<FavoriteKind>[]>(() => [
    { value: 'ALBUM', label: t('library.types.albums'), icon: 'mdi-album' },
    { value: 'TRACK', label: t('library.types.tracks'), icon: 'mdi-music-note' },
  ])

  const keyOf = (type: FavoriteKind, id: string) => `${type}:${id}`

  watch(open, value => {
    if (!value) {
      return
    }
    draft.value = props.favorites.flatMap(favorite => favorite.item.type === 'ARTIST'
      ? []
      : [{ key: keyOf(favorite.item.type, favorite.item.id), kind: favorite.item.type, id: favorite.item.id, card: cards.summary(favorite.item) }])
    query.value = ''
    results.value = []
    searched.value = false
    error.value = null
  }, { immediate: true })

  watch(kind, () => {
    if (searched.value) {
      void search()
    }
  })

  function full (group: FavoriteKind): boolean {
    return draft.value.filter(entry => entry.kind === group).length >= FAVORITE_LIMITS[group]
  }

  function inDraft (key: string): boolean {
    return draft.value.some(entry => entry.key === key)
  }

  function move (key: string, step: number): void {
    const entry = draft.value.find(item => item.key === key)
    if (!entry) {
      return
    }
    const siblings = draft.value.filter(item => item.kind === entry.kind)
    const from = siblings.indexOf(entry)
    const to = from + step
    if (to < 0 || to >= siblings.length) {
      return
    }
    const reordered = [...siblings]
    reordered.splice(from, 1)
    reordered.splice(to, 0, entry)
    draft.value = [...draft.value.filter(item => item.kind !== entry.kind), ...reordered]
  }

  function remove (key: string): void {
    draft.value = draft.value.filter(entry => entry.key !== key)
  }

  function add (entry: DraftEntry): void {
    if (full(entry.kind) || inDraft(entry.key)) {
      return
    }
    draft.value = [...draft.value, entry]
  }

  async function search (): Promise<void> {
    const text = query.value.trim()
    if (text.length < SEARCH_TEXT_LENGTH.min) {
      return
    }
    searching.value = true
    error.value = null
    try {
      const page = { page: 1, limit: FAVORITES_SEARCH_LIMIT }
      results.value = kind.value === 'TRACK'
        ? (await catalogApi.searchTracks(text, page)).items.map(item => ({ key: keyOf('TRACK', item.id), kind: 'TRACK' as const, id: item.id, card: cards.track(item) }))
        : (await catalogApi.searchAlbums(text, page)).items.map(item => ({ key: keyOf('ALBUM', item.id), kind: 'ALBUM' as const, id: item.id, card: cards.album(item) }))
      searched.value = true
    } catch (error_) {
      error.value = errorMessage(error_)
    } finally {
      searching.value = false
    }
  }

  async function save (): Promise<void> {
    saving.value = true
    error.value = null
    try {
      await store.replace(groups.value.flatMap(group => group.entries.map(entry => ({ kind: entry.kind, id: entry.id }))))
      toast.success(t('favorites.editor.saved'))
      open.value = false
    } catch (error_) {
      error.value = errorMessage(error_)
    } finally {
      saving.value = false
    }
  }
</script>

<style scoped>
.editor {
  display: grid;
  gap: 14px;
}

.editor__group {
  display: grid;
  gap: 10px;
}

.editor__group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.editor__count {
  margin: 0;
  padding: 4px 12px;
  font-size: 0.875rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--mx-on-cta);
  background: var(--mx-cta);
  border-radius: var(--mx-radius-pill);
}

.editor__count--over {
  color: var(--mx-error);
  background: color-mix(in srgb, var(--mx-error) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--mx-error) 45%, transparent);
}

.editor__list,
.editor__results {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.editor__row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
}

.editor__position {
  min-width: 2ch;
  font-family: var(--mx-font-display);
  font-size: 1.5rem;
  font-weight: 800;
  text-align: center;
  color: var(--mx-link);
}

.editor__row-actions {
  display: flex;
  gap: 2px;
}

.editor__subtitle {
  margin: 8px 0 0;
  font-family: var(--mx-font-display);
  font-size: var(--mx-text-h3);
  font-weight: 800;
}

.editor__hint {
  margin: 0;
  color: var(--mx-on-surface-muted);
}

.editor__error {
  margin: 0;
  font-weight: 700;
  color: var(--mx-error);
}

@media (max-width: 600px) {
  .editor__row {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .editor__row-actions {
    grid-column: 1 / -1;
    justify-content: flex-end;
  }
}
</style>
