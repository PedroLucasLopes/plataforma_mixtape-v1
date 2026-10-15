import type { ItemType } from '@/types/api'
import { type MaybeRefOrGetter, toValue } from 'vue'
import { reviewsApi } from '@/services/mixtape'
import { useComposerStore } from '@/stores/composer'
import { useSessionStore } from '@/stores/session'
import { useAsyncData } from './useAsyncData'

export function useItemStats (type: MaybeRefOrGetter<ItemType>, id: MaybeRefOrGetter<string>) {
  const composer = useComposerStore()
  const session = useSessionStore()

  return useAsyncData(
    () => reviewsApi.stats(toValue(type), toValue(id)),
    { watch: () => [toValue(type), toValue(id), composer.version, session.isAuthenticated] },
  )
}
