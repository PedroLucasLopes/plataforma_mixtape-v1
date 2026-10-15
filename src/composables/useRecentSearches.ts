import { ref } from 'vue'
import { RECENT_SEARCHES } from '@/constants/storage'

function read (): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(RECENT_SEARCHES.key) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string').slice(0, RECENT_SEARCHES.limit) : []
  } catch {
    return []
  }
}

function write (values: readonly string[]): void {
  try {
    window.localStorage.setItem(RECENT_SEARCHES.key, JSON.stringify(values))
  } catch {
    return
  }
}

export function useRecentSearches () {
  const searches = ref<string[]>(typeof window === 'undefined' ? [] : read())

  function remember (query: string): void {
    const value = query.trim()
    if (!value) {
      return
    }
    const next = [value, ...searches.value.filter(item => item.toLowerCase() !== value.toLowerCase())].slice(0, RECENT_SEARCHES.limit)
    searches.value = next
    write(next)
  }

  function forget (query: string): void {
    const next = searches.value.filter(item => item !== query)
    searches.value = next
    write(next)
  }

  function clear (): void {
    searches.value = []
    write([])
  }

  return { searches, remember, forget, clear }
}
