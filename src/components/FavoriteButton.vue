<template>
  <MxIconButton
    v-if="session.isAuthenticated"
    data-testid="favorite-button"
    :disabled="favorites.isPending(kind, id)"
    :icon="active ? 'mdi-star' : 'mdi-star-outline'"
    :label="active ? t('favorites.remove', { title }) : t('favorites.add', { title })"
    :pressed="active"
    :size="size"
    :variant="variant"
    @click="toggle"
  />
</template>

<script lang="ts" setup>
  import type { FavoriteKind } from '@/types/api'
  import { MxIconButton, toast } from '@pedrolucaslopes/mixtape-ui'
  import { computed, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { errorMessage } from '@/services/http'
  import { useFavoritesStore } from '@/stores/favorites'
  import { useSessionStore } from '@/stores/session'

  const props = withDefaults(defineProps<{
    kind: FavoriteKind
    id: string
    title: string
    size?: 'sm' | 'md' | 'lg'
    variant?: 'glass' | 'ghost' | 'cta' | 'tonal' | 'solid' | 'ink'
  }>(), { size: 'lg', variant: 'ink' })

  const { t } = useI18n()
  const session = useSessionStore()
  const favorites = useFavoritesStore()

  const active = computed(() => favorites.isFavorite(props.kind, props.id))

  onMounted(() => {
    void favorites.ensure()
  })

  async function toggle (): Promise<void> {
    const adding = !active.value
    try {
      await favorites.toggle(props.kind, props.id)
      toast.success(adding ? t('favorites.added', { title: props.title }) : t('favorites.removed', { title: props.title }))
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }
</script>
