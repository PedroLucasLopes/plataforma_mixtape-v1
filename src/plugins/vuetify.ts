import { createMixtapeLocale, mixtapeIcons, vuetifyOptions } from '@pedrolucaslopes/mixtape-ui'
import { useI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { FUN_ICONS } from './fun-icons'
import { i18n } from './i18n'
import { APP_ICON_PATHS } from './icons.generated'
import '@fontsource-variable/bricolage-grotesque/standard.css'
import '@fontsource-variable/figtree'
import 'vuetify/styles/core'
import '@pedrolucaslopes/mixtape-ui/styles'

export default createVuetify({
  ...vuetifyOptions,
  icons: mixtapeIcons({ ...APP_ICON_PATHS, ...FUN_ICONS }),
  locale: createMixtapeLocale({ i18n, useI18n }),
})
