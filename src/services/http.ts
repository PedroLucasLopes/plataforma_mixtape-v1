import { API_PREFIX, CATALOG_RETRY, SESSION } from '@/constants/api'
import { KNOWN_ERROR_CODES, STATUS_MESSAGE_KEYS } from '@/constants/messages'
import { currentLocale, t } from '@/plugins/i18n'

export type QueryValue = string | number | boolean | null | undefined

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  query?: Record<string, QueryValue>
  auth?: 'optional' | 'required' | 'none'
  session?: boolean
  signal?: AbortSignal
  headers?: Record<string, string>
}

export class ApiError extends Error {
  constructor (
    readonly status: number,
    message: string,
    readonly code: string | null = null,
    readonly details: Record<string, unknown> | null = null,
    readonly retryAfter: number | null = null,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  get notFound (): boolean {
    return this.status === 404
  }
}

interface HttpHooks {
  accessToken: () => Promise<string | null>
  refresh: () => Promise<boolean>
  expired: () => void
}

let hooks: HttpHooks = {
  accessToken: async () => null,
  refresh: async () => false,
  expired: () => {},
}

export function configureHttp (next: HttpHooks): void {
  hooks = next
}

const EMPTY_QUERY_VALUES: ReadonlySet<QueryValue> = new Set<QueryValue>([null, undefined, ''])

export function buildUrl (path: string, query?: Record<string, QueryValue>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (EMPTY_QUERY_VALUES.has(value)) {
      continue
    }
    params.set(key, String(value))
  }
  const search = params.toString()
  return `${API_PREFIX}${path}${search ? `?${search}` : ''}`
}

function record (value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

async function readBody (response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) {
    return null
  }
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function retryAfterSeconds (response: Response, details: Record<string, unknown>): number | null {
  const fromDetails = details.retryAfterSeconds
  if (typeof fromDetails === 'number') {
    return fromDetails
  }
  const header = Number(response.headers.get('Retry-After'))
  return Number.isFinite(header) && header > 0 ? header : null
}

function waitText (seconds: number) {
  const [value, unit] = seconds < 60 ? [Math.ceil(seconds), 'second'] : [Math.ceil(seconds / 60), 'minute']
  return new Intl.NumberFormat(currentLocale(), { style: 'unit', unit, unitDisplay: 'long' }).format(value)
}

function errorParams (code: string, details: Record<string, unknown>): Record<string, string | number> {
  if (code === 'UNDERAGE' && typeof details.minAge === 'number') {
    return { minAge: details.minAge }
  }
  if (typeof details.retryAfterSeconds === 'number') {
    return { seconds: details.retryAfterSeconds, wait: waitText(details.retryAfterSeconds) }
  }
  if (typeof details.limit === 'number') {
    return { limit: details.limit }
  }
  return {}
}

function onlyProfanity (details: Record<string, unknown>): boolean {
  return Array.isArray(details.reasons) && details.reasons.length > 0 && details.reasons.every(reason => reason === 'PROFANITY')
}

function messageKey (code: string, details: Record<string, unknown>) {
  if (code === 'CONTENT_REJECTED' && onlyProfanity(details)) {
    return 'errors.code.CONTENT_REJECTED_PROFANITY'
  }
  if (code === 'FAVORITES_FULL' && (details.kind === 'ALBUM' || details.kind === 'TRACK')) {
    return `errors.code.FAVORITES_FULL_${details.kind}`
  }
  return `errors.code.${code}`
}

export function describeError (status: number, code: string | null, details: Record<string, unknown> = {}): string {
  if (code && KNOWN_ERROR_CODES.has(code)) {
    return t(messageKey(code, details), errorParams(code, details))
  }
  const key = STATUS_MESSAGE_KEYS[status] ?? (status >= 500 ? STATUS_MESSAGE_KEYS[500] : undefined)
  return key ? t(key) : t('errors.fallback')
}

async function failure (response: Response): Promise<ApiError> {
  const body = record(await readBody(response))
  const code = typeof body.error === 'string' ? body.error : null
  const details = record(body.details)
  return new ApiError(response.status, describeError(response.status, code, details), code, details, retryAfterSeconds(response, details))
}

export function wait (seconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason)
      return
    }
    const timer = setTimeout(resolve, seconds * 1000)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(signal.reason)
    }, { once: true })
  })
}

async function send (path: string, options: RequestOptions, attempt = 0, retriedAuth = false): Promise<Response> {
  const method = options.method ?? 'GET'
  const headers: Record<string, string> = { Accept: 'application/json', ...options.headers }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (options.session) {
    headers[SESSION.header] = SESSION.transport
  }

  const auth = options.auth ?? 'optional'
  const token = auth === 'none' ? null : await hooks.accessToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: 'same-origin',
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }
    throw new ApiError(0, describeError(0, 'NETWORK_ERROR'), 'NETWORK_ERROR')
  }

  if (response.status === 401 && token && !retriedAuth) {
    const renewed = await hooks.refresh()
    if (renewed) {
      return send(path, options, attempt, true)
    }
    hooks.expired()
  }

  const busy = response.status === 503 || response.status === 429
  if (busy && method === 'GET' && attempt < CATALOG_RETRY.attempts) {
    const seconds = Number(response.headers.get('Retry-After')) || 1.5
    if (seconds <= CATALOG_RETRY.maxWaitSeconds) {
      await wait(seconds, options.signal)
      return send(path, options, attempt + 1, retriedAuth)
    }
  }

  return response
}

export async function request<T> (path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options)
  if (!response.ok) {
    throw await failure(response)
  }
  if (response.status === 204) {
    return null as T
  }
  return await readBody(response) as T
}

export function errorMessage (error: unknown): string {
  return error instanceof ApiError ? error.message : t('errors.fallback')
}

export function isHumanCheckError (error: unknown): boolean {
  return error instanceof ApiError && Boolean(error.code?.startsWith('HUMAN_CHECK_'))
}

export function isNotFound (error: unknown): boolean {
  return error instanceof ApiError && error.status === 404
}
