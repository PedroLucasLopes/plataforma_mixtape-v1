<template>
  <MxSection
    data-testid="favorites-shelf"
    :description="isMe ? t('favorites.descriptionMine', { limit: FAVORITES_LIMIT }) : t('favorites.description', { name })"
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
      <MxSkeleton v-for="index in 5" :key="index" shape="square" />
    </div>

    <MxErrorState v-else-if="favorites.error.value" compact :description="favorites.error.value" @retry="favorites.reload()" />

    <ol v-else-if="list.length > 0" :aria-label="t('favorites.title')" class="favorites__grid">
      <li
        v-for="(favorite, index) in list"
        :key="`${favorite.item.type}:${favorite.item.id}`"
        v-reveal="{ variant: 'pop', delay: index * 45 }"
        data-testid="favorites-shelf-item"
      >
        <MxItemCard v-bind="cards.summary(favorite.item)" :heading-level="3" :position="favorite.position" />
      </li>
    </ol>

    <MxEmptyState
      v-else
      compact
      :description="isMe ? t('favorites.emptyMineDescription', { limit: FAVORITES_LIMIT }) : undefined"
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
  import { FAVORITES_LIMIT } from '@/constants/api'
  import { favoritesApi } from '@/services/mixtape'
  import { useFavoritesStore } from '@/stores/favorites'

  const FavoritesEditorDialog = defineAsyncComponent(() => import('@/components/FavoritesEditorDialog.vue'))

  const props = defineProps<{ username: string, name: string, isMe: boolean }>()

  const { t } = useI18n()
  const cards = useCatalogCards()
  const store = useFavoritesStore()

  const favorites = useAsyncData(() => favoritesApi.ofUser(props.username), { watch: () => [props.username, store.version] })
  const list = computed(() => favorites.data.value ?? [])

  const editing = ref(false)
  const editorMounted = ref(false)

  function openEditor (): void {
    editorMounted.value = true
    editing.value = true
  }
</script>

<style scoped>
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
