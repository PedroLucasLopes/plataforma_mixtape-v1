import { toast } from '@pedrolucaslopes/mixtape-ui'
import { ref } from 'vue'
import { errorMessage } from '@/services/http'
import { reviewsApi } from '@/services/mixtape'
import { useAuthAction } from './useAuthAction'

export interface Likeable {
  id: string
  likes: number
  viewer?: { liked: boolean, isAuthor: boolean } | null
}

function applyLocal<T extends Likeable> (target: T, liked: boolean): T {
  const was = target.viewer?.liked ?? false
  const likes = target.likes + (liked === was ? 0 : (liked ? 1 : -1))
  return { ...target, likes, viewer: { liked, isAuthor: target.viewer?.isAuthor ?? false } }
}

export function useLikes<T extends Likeable> () {
  const pending = ref(new Set<string>())
  const { requireAuth } = useAuthAction()

  async function toggle (target: T, liked: boolean, update: (value: T) => void): Promise<void> {
    if (!requireAuth() || pending.value.has(target.id)) {
      return
    }
    pending.value = new Set([...pending.value, target.id])
    update(applyLocal(target, liked))
    try {
      const result = await reviewsApi.like(target.id, liked)
      update({ ...target, likes: result.likes, viewer: { liked: result.liked, isAuthor: target.viewer?.isAuthor ?? false } })
    } catch (error) {
      update(target)
      toast.error(errorMessage(error))
    } finally {
      const rest = new Set(pending.value)
      rest.delete(target.id)
      pending.value = rest
    }
  }

  return { toggle, isPending: (id: string) => pending.value.has(id) }
}
