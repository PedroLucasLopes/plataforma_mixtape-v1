import type { ListenLater, ListenLaterKind } from '@/types/api'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { listenLaterApi } from '@/services/mixtape'
import { useComposerStore } from '@/stores/composer'
import { useSessionStore } from '@/stores/session'

export const useListenLaterStore = defineStore('listenLater', () => {
  const session = useSessionStore()
  const composer = useComposerStore()
  const mine = ref<ListenLater[] | null>(null)
  const pending = ref<string[]>([])
  const version = ref(0)
  let loading: Promise<void> | null = null

  const key = (kind: ListenLaterKind, id: string) => `${kind}:${id}`

  function settle (list: ListenLater[]): void {
    mine.value = list
    version.value += 1
  }

  function load (): Promise<void> {
    loading ??= listenLaterApi.mine()
      .then(settle)
      .catch(() => undefined)
      .finally(() => {
        loading = null
      })
    return loading
  }

  function ensure (): Promise<void> {
    return !session.isAuthenticated || mine.value ? Promise.resolve() : load()
  }

  function isSaved (kind: ListenLaterKind, id: string): boolean {
    return mine.value?.some(entry => entry.item.type === kind && entry.item.id === id) ?? false
  }

  function isPending (kind: ListenLaterKind, id: string): boolean {
    return pending.value.includes(key(kind, id))
  }

  async function toggle (kind: ListenLaterKind, id: string): Promise<void> {
    const current = key(kind, id)
    pending.value = [...pending.value, current]
    try {
      settle(isSaved(kind, id) ? await listenLaterApi.remove(kind, id) : await listenLaterApi.add(kind, id))
    } finally {
      pending.value = pending.value.filter(item => item !== current)
    }
  }

  watch(() => session.username, () => {
    mine.value = null
  })

  watch(() => composer.version, () => {
    if (mine.value) {
      void load()
    }
  })

  return { mine, version, ensure, isSaved, isPending, toggle }
})
