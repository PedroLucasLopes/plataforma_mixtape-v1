import { prefersReducedMotion, startViewTransition, supportsViewTransitions } from '@pedrolucaslopes/mixtape-ui'
import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { VIEW_TRANSITION_UPDATE_TIMEOUT_MS } from '@/constants/navigation'
import { useSessionStore } from '@/stores/session'
import { isChunkLoadError, reloadOnce } from '@/utils/deploy'
import { safeRedirect } from '@/utils/navigation'
import { routeLoading } from './loading'
import { ROUTE, routes } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (to, from, saved) => {
    if (saved) {
      return saved
    }
    if (to.hash) {
      return { el: to.hash, top: 96 }
    }
    if (to.path === from.path) {
      return false
    }
    return { top: 0 }
  },
})

router.beforeEach(async to => {
  routeLoading.value = true
  const session = useSessionStore()
  await session.ensure()

  if (to.meta.auth === 'required' && !session.isAuthenticated) {
    return { name: ROUTE.login, query: { redirect: to.fullPath } }
  }

  if (to.meta.auth === 'guest' && session.isAuthenticated) {
    return safeRedirect(to.query.redirect) ?? { name: ROUTE.home }
  }

  if (to.meta.admin && !session.isAdmin) {
    return { name: ROUTE.notFound, params: { pathMatch: to.path.slice(1).split('/') } }
  }

  return true
})

let finishViewTransition: (() => void) | null = null

function settleViewTransition (): void {
  finishViewTransition?.()
  finishViewTransition = null
}

router.beforeResolve((to, from) => {
  if (!supportsViewTransitions() || prefersReducedMotion() || to.path === from.path || from.matched.length === 0) {
    return
  }
  settleViewTransition()
  return new Promise<void>(proceed => {
    void startViewTransition(() => new Promise<void>(done => {
      const timer = window.setTimeout(done, VIEW_TRANSITION_UPDATE_TIMEOUT_MS)
      finishViewTransition = () => {
        window.clearTimeout(timer)
        done()
      }
      proceed()
    }))
  })
})

router.afterEach(async () => {
  routeLoading.value = false
  await nextTick()
  settleViewTransition()
})

router.onError((error, to) => {
  routeLoading.value = false
  settleViewTransition()
  if (isChunkLoadError(error)) {
    reloadOnce(to.fullPath)
  }
})

export default router
