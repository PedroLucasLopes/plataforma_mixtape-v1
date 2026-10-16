import type { RouteLocationRaw } from 'vue-router'
import { safeReturnTo } from '@pedrolucaslopes/mixtape-auth'
import { AUTH_SCREENS } from '@/constants/navigation'

export function safeRedirect (value: unknown): string | null {
  return safeReturnTo(value, { exclude: AUTH_SCREENS })
}

export function queryString (value: unknown): string | null {
  const first = Array.isArray(value) ? value[0] : value
  return typeof first === 'string' && first.length > 0 ? first : null
}

export function queryEnum<T extends string> (value: unknown, allowed: readonly T[], fallback: T): T {
  const first = queryString(value)
  return first && (allowed as readonly string[]).includes(first) ? first as T : fallback
}

export function queryNumber (value: unknown, fallback: number | null = null): number | null {
  const first = queryString(value)
  if (first === null) {
    return fallback
  }
  const parsed = Number(first)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function loginRoute (redirect: string): RouteLocationRaw {
  return { name: 'login', query: { redirect } }
}
