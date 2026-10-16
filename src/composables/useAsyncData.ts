import { type MaybeRefOrGetter, onScopeDispose, ref, shallowRef, toValue, watch } from 'vue'
import { ApiError, errorMessage } from '@/services/http'

export interface AsyncDataOptions {
  watch?: MaybeRefOrGetter<unknown>
  immediate?: boolean
  resetOnChange?: boolean
}

export function useAsyncData<T> (loader: (signal: AbortSignal) => Promise<T>, options: AsyncDataOptions = {}) {
  const data = shallowRef<T | null>(null)
  const error = ref<string | null>(null)
  const errorCode = ref<string | null>(null)
  const notFound = ref(false)
  const loading = ref(false)
  let controller: AbortController | null = null

  async function load (): Promise<void> {
    controller?.abort()
    const current = new AbortController()
    controller = current
    loading.value = true
    error.value = null
    errorCode.value = null
    notFound.value = false
    try {
      const result = await loader(current.signal)
      if (current.signal.aborted) {
        return
      }
      data.value = result
    } catch (error_) {
      if (current.signal.aborted || (error_ instanceof DOMException && error_.name === 'AbortError')) {
        return
      }
      data.value = null
      error.value = errorMessage(error_)
      errorCode.value = error_ instanceof ApiError ? error_.code : null
      notFound.value = error_ instanceof ApiError && error_.status === 404
    } finally {
      if (controller === current) {
        loading.value = false
      }
    }
  }

  if (options.watch !== undefined) {
    watch(() => toValue(options.watch), () => {
      if (options.resetOnChange) {
        data.value = null
      }
      void load()
    }, { immediate: options.immediate !== false })
  } else if (options.immediate !== false) {
    void load()
  }

  onScopeDispose(() => controller?.abort())

  return { data, error, errorCode, notFound, loading, reload: load }
}
