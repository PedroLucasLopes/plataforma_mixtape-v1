import type { App } from 'vue'
import { MIXTAPE_LINK_KEY } from '@pedrolucaslopes/mixtape-ui'
import { createHead } from '@unhead/vue/client'
import { createPinia } from 'pinia'
import { RouterLink } from 'vue-router'
import router from '@/router'
import { configureHttp } from '@/services/http'
import { useSessionStore } from '@/stores/session'
import { i18n } from './i18n'
import vuetify from './vuetify'

export function registerPlugins (app: App) {
  const pinia = createPinia()

  app.use(i18n)
  app.use(vuetify)
  app.use(pinia)
  app.use(createHead())
  app.provide(MIXTAPE_LINK_KEY, RouterLink)

  const session = useSessionStore(pinia)

  configureHttp({
    accessToken: () => session.validAccessToken(),
    refresh: () => session.refresh(),
    expired: () => session.expire(),
  })

  app.use(router)
}
