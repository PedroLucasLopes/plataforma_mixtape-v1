import { DEPLOY_RELOAD } from '@/constants/storage'

const CHUNK_LOAD_ERROR = /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|unable to preload css/i

export function isChunkLoadError (error: unknown): boolean {
  return error instanceof Error && CHUNK_LOAD_ERROR.test(error.message)
}

export function reloadOnce (target?: string): boolean {
  try {
    const last = Number(sessionStorage.getItem(DEPLOY_RELOAD.key) ?? 0)
    if (Date.now() - last < DEPLOY_RELOAD.windowMs) {
      return false
    }
    sessionStorage.setItem(DEPLOY_RELOAD.key, String(Date.now()))
  } catch {
    return false
  }
  if (target) {
    window.location.assign(target)
  } else {
    window.location.reload()
  }
  return true
}
