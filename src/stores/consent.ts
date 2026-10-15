import { defineStore } from 'pinia'
import { ref } from 'vue'
import { CONSENT_STORAGE_KEY, type ConsentChoice } from '@/constants/ads'

function readChoice (): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    return value === 'all' || value === 'essential' ? value : null
  } catch {
    return null
  }
}

export const useConsentStore = defineStore('consent', () => {
  const choice = ref<ConsentChoice | null>(typeof window === 'undefined' ? null : readChoice())

  function decide (next: ConsentChoice): void {
    choice.value = next
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, next)
    } catch {
      return
    }
  }

  function reopen (): void {
    choice.value = null
    try {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY)
    } catch {
      return
    }
  }

  return { choice, decide, reopen }
})
