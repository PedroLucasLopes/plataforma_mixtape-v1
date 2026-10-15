import { defineStore } from 'pinia'
import { ref } from 'vue'
import { catalogApi } from '@/services/mixtape'

export const useGenresStore = defineStore('genres', () => {
  const genres = ref<string[]>([])
  let loading: Promise<void> | null = null

  function load (): Promise<void> {
    if (genres.value.length > 0) {
      return Promise.resolve()
    }
    loading ??= catalogApi.genres().then(result => {
      genres.value = result
    }).finally(() => {
      loading = null
    })
    return loading
  }

  return { genres, load }
})
