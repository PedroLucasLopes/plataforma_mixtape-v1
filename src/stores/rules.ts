import type { GamificationRules } from '@/types/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { gamificationApi } from '@/services/mixtape'

export const useRulesStore = defineStore('rules', () => {
  const rules = ref<GamificationRules | null>(null)
  let loading: Promise<void> | null = null

  const writtenReviewMinLength = computed(() => rules.value?.writtenReviewMinLength ?? null)

  function load (): Promise<void> {
    if (rules.value) {
      return Promise.resolve()
    }
    loading ??= gamificationApi.rules().then(result => {
      rules.value = result
    }).catch(() => undefined).finally(() => {
      loading = null
    })
    return loading
  }

  return { rules, writtenReviewMinLength, load }
})
