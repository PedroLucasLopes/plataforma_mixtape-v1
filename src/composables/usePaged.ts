import type { Page } from '@/types/api'
import { computed, type MaybeRefOrGetter, ref, shallowRef, toValue, watch } from 'vue'
import { PAGE_SIZE } from '@/constants/api'
import { errorMessage } from '@/services/http'

export interface PagedOptions {
  limit?: number
  watch?: MaybeRefOrGetter<unknown>
}

export function usePaged<T> (loader: (page: number, limit: number) => Promise<Page<T>>, options: PagedOptions = {}) {
  const limit = options.limit ?? PAGE_SIZE
  const items = shallowRef<T[]>([])
  const page = ref(0)
  const total = ref(0)
  const totalPages = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)
  let generation = 0

  const hasMore = computed(() => page.value < totalPages.value)

  async function fetchPage (next: number, current: number): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const result = await loader(next, limit)
      if (current !== generation) {
        return
      }
      items.value = next === 1 ? result.items : [...items.value, ...result.items]
      page.value = result.page
      total.value = result.total
      totalPages.value = result.totalPages
      loaded.value = true
    } catch (error_) {
      if (current === generation) {
        error.value = errorMessage(error_)
      }
    } finally {
      if (current === generation) {
        loading.value = false
      }
    }
  }

  function reset (): Promise<void> {
    generation += 1
    items.value = []
    page.value = 0
    total.value = 0
    totalPages.value = 0
    loaded.value = false
    return fetchPage(1, generation)
  }

  function loadMore (): Promise<void> {
    if (loading.value || !hasMore.value) {
      return Promise.resolve()
    }
    return fetchPage(page.value + 1, generation)
  }

  function replace (predicate: (item: T) => boolean, next: T | null): void {
    items.value = next === null
      ? items.value.filter(item => !predicate(item))
      : items.value.map(item => (predicate(item) ? next : item))
    if (next === null) {
      total.value = Math.max(0, total.value - 1)
    }
  }

  if (options.watch === undefined) {
    void reset()
  } else {
    watch(() => toValue(options.watch), () => void reset(), { immediate: true, deep: true })
  }

  return { items, page, total, totalPages, loading, error, loaded, hasMore, reset, loadMore, replace }
}
