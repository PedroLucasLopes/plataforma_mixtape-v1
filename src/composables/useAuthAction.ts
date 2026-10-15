import { toast } from '@pedrolucaslopes/mixtape-ui'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { ROUTE } from '@/router/routes'
import { useSessionStore } from '@/stores/session'

export function useAuthAction () {
  const session = useSessionStore()
  const router = useRouter()
  const route = useRoute()
  const { t } = useI18n()

  function requireAuth (reason?: string): boolean {
    if (session.isAuthenticated) {
      return true
    }
    toast.info(reason ?? t('auth.required'), {
      action: { label: t('auth.signIn'), handler: () => void router.push({ name: ROUTE.login, query: { redirect: route.fullPath } }) },
    })
    return false
  }

  function run<T extends unknown[]> (action: (...args: T) => unknown, reason?: string) {
    return (...args: T) => {
      if (requireAuth(reason)) {
        void action(...args)
      }
    }
  }

  return { requireAuth, run }
}
