<template>
  <MxDialog v-model="open" data-testid="group-review-propose-dialog" :description="t('galera.propose.description')" :title="t('galera.propose.title')">
    <div class="propose">
      <MxSegmented
        v-model="kind"
        block
        data-testid="group-review-propose-dialog-kind"
        :label="t('galera.propose.kindLabel')"
        :options="kindOptions"
      />

      <MxSearchField
        v-model="query"
        autofocus
        data-testid="group-review-propose-dialog-search"
        :label="t('galera.propose.searchLabel')"
        :loading="searching"
        :maxlength="SEARCH_TEXT_LENGTH.max"
        :placeholder="kind === 'TRACK' ? t('galera.propose.trackPlaceholder') : t('galera.propose.albumPlaceholder')"
        @submit="search"
      />

      <p v-if="error" class="propose__error" role="alert">{{ error }}</p>

      <p v-else-if="searched && !searching && results.length === 0" class="propose__hint">{{ t('galera.propose.empty') }}</p>
      <p v-else-if="!searched" class="propose__hint">{{ t('galera.propose.hint') }}</p>

      <ul v-if="results.length > 0" :aria-label="t('galera.propose.resultsLabel')" class="propose__results">
        <li v-for="result in results" :key="result.id">
          <MxItemCard v-bind="result.card" :heading-level="3" layout="row">
            <template #actions>
              <MxButton
                data-testid="group-review-propose-dialog-pick"
                :disabled="proposing !== null && proposing !== result.id"
                icon="mdi-account-group"
                :label="t('galera.propose.pick')"
                :loading="proposing === result.id"
                size="sm"
                @click="propose(result.id)"
              />
            </template>
          </MxItemCard>
        </li>
      </ul>
    </div>

    <template #actions>
      <MxButton data-testid="group-review-propose-dialog-cancel" :label="t('common.cancel')" variant="ghost" @click="open = false" />
    </template>
  </MxDialog>
</template>

<script lang="ts" setup>
  import type { CatalogCard } from '@/composables/useCatalogCards'
  import type { GroupReview, ItemType } from '@/types/api'
  import { MxButton, MxDialog, MxItemCard, MxSearchField, MxSegmented, type SegmentedOption } from '@pedrolucaslopes/mixtape-ui'
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useCatalogCards } from '@/composables/useCatalogCards'
  import { GALERA_SEARCH_LIMIT } from '@/constants/api'
  import { SEARCH_TEXT_LENGTH } from '@/constants/validation'
  import { ApiError, errorMessage } from '@/services/http'
  import { catalogApi, groupsApi } from '@/services/mixtape'

  const open = defineModel<boolean>({ default: false })
  const props = defineProps<{ groupId: string }>()
  const emit = defineEmits<{ proposed: [groupReview: GroupReview], existing: [groupReviewId: string] }>()

  const { t } = useI18n()
  const cards = useCatalogCards()

  const kind = ref<ItemType>('ALBUM')
  const query = ref('')
  const searching = ref(false)
  const searched = ref(false)
  const proposing = ref<string | null>(null)
  const error = ref<string | null>(null)
  const results = ref<Array<{ id: string, card: CatalogCard }>>([])

  const kindOptions = computed<SegmentedOption<ItemType>[]>(() => [
    { value: 'ALBUM', label: t('library.types.albums'), icon: 'mdi-album' },
    { value: 'TRACK', label: t('library.types.tracks'), icon: 'mdi-music-note' },
  ])

  watch(open, value => {
    if (!value) return
    query.value = ''
    results.value = []
    searched.value = false
    error.value = null
    proposing.value = null
  })

  watch(kind, () => {
    if (searched.value) void search()
  })

  async function search (): Promise<void> {
    const text = query.value.trim()
    if (text.length < SEARCH_TEXT_LENGTH.min) return
    searching.value = true
    error.value = null
    try {
      const page = { page: 1, limit: GALERA_SEARCH_LIMIT }
      results.value = kind.value === 'TRACK'
        ? (await catalogApi.searchTracks(text, page)).items.map(item => ({ id: item.id, card: cards.track(item) }))
        : (await catalogApi.searchAlbums(text, page)).items.map(item => ({ id: item.id, card: cards.album(item) }))
      searched.value = true
    } catch (error_) {
      error.value = errorMessage(error_)
    } finally {
      searching.value = false
    }
  }

  async function propose (itemId: string): Promise<void> {
    proposing.value = itemId
    error.value = null
    try {
      const created = await groupsApi.proposeGroupReview(props.groupId, kind.value, itemId)
      open.value = false
      emit('proposed', created)
    } catch (error_) {
      const existingId = error_ instanceof ApiError && error_.code === 'GROUP_REVIEW_ALREADY_EXISTS' ? error_.details?.groupReviewId : null
      if (typeof existingId === 'string') {
        open.value = false
        emit('existing', existingId)
        return
      }
      error.value = errorMessage(error_)
    } finally {
      proposing.value = null
    }
  }
</script>

<style scoped>
.propose {
  display: grid;
  gap: 16px;
}

.propose__hint {
  margin: 0;
  color: var(--mx-on-surface-muted);
}

.propose__error {
  margin: 0;
  padding: 10px 12px;
  font-weight: 600;
  background: color-mix(in srgb, var(--mx-error) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--mx-error) 45%, transparent);
  border-radius: var(--mx-radius-sm);
}

.propose__results {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
