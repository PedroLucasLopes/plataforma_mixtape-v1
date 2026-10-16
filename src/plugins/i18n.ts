import { preferredLocale } from '@pedrolucaslopes/mixtape-ui'
import { watch } from 'vue'
import { createI18n } from 'vue-i18n'
import ptBR from '@/locales/pt-BR.json'

export type MessageSchema = typeof ptBR

declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
}

export const FALLBACK_LOCALE = 'pt-BR'

const loaders = Object.fromEntries(
  Object.entries(
    import.meta.glob<MessageSchema>(['../locales/*.json', '!../locales/pt-BR.json'], { import: 'default' }),
  ).map(([path, load]) => [path.slice(path.lastIndexOf('/') + 1, -'.json'.length), load]),
)

export const i18n = createI18n({
  legacy: false,
  locale: preferredLocale([FALLBACK_LOCALE, ...Object.keys(loaders)], FALLBACK_LOCALE),
  fallbackLocale: FALLBACK_LOCALE,
  messages: { [FALLBACK_LOCALE]: ptBR },
  missingWarn: false,
  fallbackWarn: false,
})

for (const code of Object.keys(loaders)) {
  i18n.global.mergeLocaleMessage(code, {})
}

const loaded = new Set([FALLBACK_LOCALE])

export async function loadLocale (code: string): Promise<void> {
  const load = loaders[code]
  if (!load || loaded.has(code)) {
    return
  }
  const messages = await load().catch(() => null)
  if (messages) {
    i18n.global.mergeLocaleMessage(code, messages)
    loaded.add(code)
  }
}

watch(i18n.global.locale, loadLocale)

export const t = i18n.global.t

export const te = i18n.global.te

export function currentLocale (): string {
  return i18n.global.locale.value
}
