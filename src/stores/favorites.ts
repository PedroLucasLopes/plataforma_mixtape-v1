import type { Favorite, FavoriteKind } from '@/types/api'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { favoritesApi } from '@/services/mixtape'
import { useSessionStore } from '@/stores/session'

/**
 * Os meus favoritos (até 10 álbuns e músicas): o botão de favoritar das páginas de álbum e música e a
 * vitrine do meu perfil leem daqui. `version` muda a cada alteração, para a vitrine recarregar.
 */
export const useFavoritesStore = defineStore('favorites', () => {
  const session = useSessionStore()
  const mine = ref<Favorite[] | null>(null)
  const pending = ref<string[]>([])
  const version = ref(0)
  let loading: Promise<void> | null = null

  const key = (kind: FavoriteKind, id: string) => `${kind}:${id}`

  function ensure (): Promise<void> {
    if (!session.isAuthenticated || mine.value) {
      return Promise.resolve()
    }
    loading ??= favoritesApi.mine()
      .then(list => {
        mine.value = list
      })
      .catch(() => undefined)
      .finally(() => {
        loading = null
      })
    return loading
  }

  function isFavorite (kind: FavoriteKind, id: string): boolean {
    return mine.value?.some(favorite => favorite.item.type === kind && favorite.item.id === id) ?? false
  }

  function isPending (kind: FavoriteKind, id: string): boolean {
    return pending.value.includes(key(kind, id))
  }

  function settle (list: Favorite[]): void {
    mine.value = list
    version.value += 1
  }

  async function toggle (kind: FavoriteKind, id: string): Promise<void> {
    const current = key(kind, id)
    pending.value = [...pending.value, current]
    try {
      settle(isFavorite(kind, id) ? await favoritesApi.remove(kind, id) : await favoritesApi.add(kind, id))
    } finally {
      pending.value = pending.value.filter(item => item !== current)
    }
  }

  async function replace (items: Array<{ kind: FavoriteKind, id: string }>): Promise<void> {
    settle(await favoritesApi.replace(items))
  }

  watch(() => session.username, () => {
    mine.value = null
  })

  return { mine, version, ensure, isFavorite, isPending, toggle, replace }
})
