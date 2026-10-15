<template>
  <MxButton
    :aria-pressed="saved"
    data-testid="listen-later-button"
    :disabled="store.isPending(kind, id)"
    :icon="saved ? 'mdi-bookmark' : 'mdi-bookmark-outline'"
    :label="saved ? t('listenLater.saved') : t('listenLater.save')"
    :size="size"
    :variant="saved ? 'tonal' : variant"
    @click="toggle"
  />
</template>

<script lang="ts" setup>
  import type { ListenLaterKind } from '@/types/api'
  import type { ButtonVariant } from '@pedrolucaslopes/mixtape-ui'
  import { MxButton, toast } from '@pedrolucaslopes/mixtape-ui'
  import { computed, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useAuthAction } from '@/composables/useAuthAction'
  import { errorMessage } from '@/services/http'
  import { useListenLaterStore } from '@/stores/listenLater'

  const props = withDefaults(defineProps<{
    kind: ListenLaterKind
    id: string
    title: string
    size?: 'sm' | 'md' | 'lg'
    variant?: ButtonVariant
  }>(), { size: 'sm', variant: 'glass' })

  const { t } = useI18n()
  const store = useListenLaterStore()
  const { requireAuth } = useAuthAction()

  const saved = computed(() => store.isSaved(props.kind, props.id))

  onMounted(() => {
    void store.ensure()
  })

  async function toggle (): Promise<void> {
    if (!requireAuth(t('listenLater.signIn'))) return
    const adding = !saved.value
    try {
      await store.toggle(props.kind, props.id)
      toast.success(adding ? t('listenLater.added', { title: props.title }) : t('listenLater.removed', { title: props.title }))
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }
</script>
