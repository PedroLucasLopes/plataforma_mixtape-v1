import type { Account, AuthResult } from '@/types/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { SESSION } from '@/constants/api'
import { ApiError } from '@/services/http'
import { accountApi, authApi, type RegisterInput } from '@/services/mixtape'

export type SessionStatus = 'unknown' | 'authenticated' | 'anonymous'

type ChannelMessage = 'signed-in' | 'signed-out' | 'profile'

function readHint (): boolean {
  try {
    return window.localStorage.getItem(SESSION.hintKey) === '1'
  } catch {
    return true
  }
}

function writeHint (active: boolean): void {
  try {
    if (active) {
      window.localStorage.setItem(SESSION.hintKey, '1')
    } else {
      window.localStorage.removeItem(SESSION.hintKey)
    }
  } catch {
    return
  }
}

export const useSessionStore = defineStore('session', () => {
  const user = ref<Account | null>(null)
  const status = ref<SessionStatus>('unknown')

  let accessToken: string | null = null
  let expiresAt = 0
  let refreshing: Promise<boolean> | null = null
  let restoring: Promise<void> | null = null
  let timer: ReturnType<typeof setTimeout> | undefined

  const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(SESSION.channel)

  const isAuthenticated = computed(() => status.value === 'authenticated')
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const username = computed(() => user.value?.username ?? null)

  function broadcast (message: ChannelMessage): void {
    channel?.postMessage(message)
  }

  function scheduleRefresh (): void {
    clearTimeout(timer)
    const delay = Math.max(5000, expiresAt - Date.now() - SESSION.refreshMarginMs)
    timer = setTimeout(() => {
      void refresh()
    }, delay)
  }

  function apply (result: AuthResult): void {
    user.value = result.user
    accessToken = result.tokens.accessToken
    expiresAt = Date.now() + result.tokens.accessTokenExpiresIn * 1000
    status.value = 'authenticated'
    writeHint(true)
    scheduleRefresh()
  }

  function clear (): void {
    clearTimeout(timer)
    user.value = null
    accessToken = null
    expiresAt = 0
    status.value = 'anonymous'
    writeHint(false)
  }

  async function withLock<T> (task: () => Promise<T>): Promise<T> {
    if (typeof navigator !== 'undefined' && navigator.locks) {
      return navigator.locks.request(SESSION.lockName, task)
    }
    return task()
  }

  function refresh (): Promise<boolean> {
    refreshing ??= withLock(async () => {
      try {
        apply(await authApi.refresh())
        return true
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 400)) {
          clear()
        } else if (status.value === 'unknown') {
          status.value = 'anonymous'
        }
        return false
      }
    }).finally(() => {
      refreshing = null
    })
    return refreshing
  }

  function ensure (): Promise<void> {
    if (status.value !== 'unknown') {
      return Promise.resolve()
    }
    if (!readHint()) {
      status.value = 'anonymous'
      return Promise.resolve()
    }
    restoring ??= refresh().then(() => undefined).finally(() => {
      restoring = null
    })
    return restoring
  }

  async function validAccessToken (): Promise<string | null> {
    if (status.value === 'unknown') {
      await ensure()
    }
    if (!accessToken) {
      return null
    }
    if (Date.now() > expiresAt - SESSION.refreshMarginMs) {
      return (await refresh()) ? accessToken : null
    }
    return accessToken
  }

  async function login (identifier: string, password: string, humanToken?: string | null): Promise<void> {
    apply(await authApi.login(identifier, password, humanToken))
    broadcast('signed-in')
  }

  async function register (input: RegisterInput, humanToken?: string | null): Promise<void> {
    apply(await authApi.register(input, humanToken))
    broadcast('signed-in')
  }

  async function logout (): Promise<void> {
    await authApi.logout().catch(() => null)
    clear()
    broadcast('signed-out')
  }

  async function logoutEverywhere (): Promise<void> {
    await authApi.logoutAll()
    clear()
    broadcast('signed-out')
  }

  function setAccount (account: Account): void {
    user.value = account
    broadcast('profile')
  }

  async function reloadAccount (): Promise<void> {
    if (status.value !== 'authenticated') {
      return
    }
    user.value = await accountApi.me()
  }

  function expire (): void {
    clear()
  }

  channel?.addEventListener('message', (event: MessageEvent<ChannelMessage>) => {
    if (event.data === 'signed-out') {
      clear()
    }
    if (event.data === 'signed-in' && status.value !== 'authenticated') {
      status.value = 'unknown'
      void ensure()
    }
    if (event.data === 'profile') {
      void reloadAccount()
    }
  })

  return {
    user,
    status,
    isAuthenticated,
    isAdmin,
    username,
    ensure,
    refresh,
    validAccessToken,
    login,
    register,
    logout,
    logoutEverywhere,
    setAccount,
    reloadAccount,
    expire,
  }
})
