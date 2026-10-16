<template>
  <MxSection
    data-testid="favorites-shelf"
    :description="isMe ? t('favorites.descriptionMine', limits) : t('favorites.description', { name })"
    :title="t('favorites.title')"
  >
    <template v-if="isMe && list.length > 0" #actions>
      <MxButton
        data-testid="favorites-shelf-edit"
        icon="mdi-pencil"
        :label="t('favorites.edit')"
        size="sm"
        variant="glass"
        @click="openEditor"
      />
    </template>

    <div v-if="favorites.loading.value && !favorites.data.value" aria-hidden="true" class="favorites__grid">
      <MxSkeleton v-for="index in FAVORITE_LIMITS.ALBUM" :key="index" shape="square" />
    </div>

    <MxErrorState v-else-if="favorites.error.value" compact :description="favorites.error.value" @retry="favorites.reload()" />

    <div v-else-if="list.length > 0" class="favorites__groups">
      <section
        v-for="group in groups"
        :key="group.kind"
        :aria-labelledby="`favorites-${group.kind}`"
        class="favorites__group"
        :data-testid="`favorites-shelf-group-${group.kind.toLowerCase()}`"
      >
        <h3 :id="`favorites-${group.kind}`" class="favorites__group-title">{{ group.title }}</h3>

        <ol class="favorites__grid">
          <li
            v-for="(favorite, index) in group.items"
            :key="`${favorite.item.type}:${favorite.item.id}`"
            v-reveal="{ variant: 'pop', delay: index * 45 }"
            data-testid="favorites-shelf-item"
          >
            <MxItemCard v-bind="cards.summary(favorite.item)" :heading-level="4" :position="favorite.position" />
          </li>
        </ol>
      </section>
    </div>

    <MxEmptyState
      v-else
      compact
      :description="isMe ? t('favorites.emptyMineDescription', limits) : undefined"
      duotone="pink"
      :heading-level="3"
      icon="mdi-star-outline"
      :title="isMe ? t('favorites.emptyMine') : t('favorites.empty', { name })"
    >
      <MxButton
        v-if="isMe"
        data-testid="favorites-shelf-choose"
        icon="mdi-star-plus-outline"
        :label="t('favorites.choose')"
        @click="openEditor"
      />
    </MxEmptyState>

    <FavoritesEditorDialog v-if="editorMounted" v-model="editing" :favorites="list" />
  </MxSection>
</template>

<script lang="ts" setup>
  import { MxButton, MxEmptyState, MxErrorState, MxItemCard, MxSection, MxSkeleton, vReveal } from '@pedrolucaslopes/mixtape-ui'
  import { computed, defineAsyncComponent, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useAsyncData } from '@/composables/useAsyncData'
  import { useCatalogCards } from '@/composables/useCatalogCards'
  import { FAVORITE_GROUPS, FAVORITE_LIMITS } from '@/constants/api'
  import { favoritesApi } from '@/services/mixtape'
  import { useFavoritesStore } from '@/stores/favorites'

  const FavoritesEditorDialog = defineAsyncComponent(() => import('@/components/FavoritesEditorDialog.vue'))

  const props = defineProps<{ username: string, name: string, isMe: boolean }>()

  const { t } = useI18n()
  const cards = useCatalogCards()
  const store = useFavoritesStore()

  const favorites = useAsyncData(() => favoritesApi.ofUser(props.username), { watch: () => [props.username, store.version] })
  const list = computed(() => favorites.data.value ?? [])
  const limits = { albums: FAVORITE_LIMITS.ALBUM, tracks: FAVORITE_LIMITS.TRACK }

  const groups = computed(() => FAVORITE_GROUPS.flatMap(kind => {
    const items = list.value.filter(favorite => favorite.item.type === kind).slice(0, FAVORITE_LIMITS[kind])
    return items.length > 0 ? [{ kind, items, title: kind === 'ALBUM' ? t('favorites.albums') : t('favorites.tracks') }] : []
  }))

  const editing = ref(false)
  const editorMounted = ref(false)

  function openEditor (): void {
    editorMounted.value = true
    editing.value = true
  }
</script>

<style scoped>
.favorites__groups {
  display: grid;
  gap: clamp(18px, 3vw, 28px);
}

.favorites__group {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.favorites__group-title {
  margin: 0;
  font-family: var(--mx-font-display);
  font-size: var(--mx-text-h3);
  font-weight: 800;
  letter-spacing: var(--mx-tracking-title);
}

.favorites__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(12px, 2vw, 20px);
  margin: 0;
  padding: 0;
  list-style: none;
}

@media (min-width: 600px) {
  .favorites__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 900px) {
  .favorites__grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
</style>
