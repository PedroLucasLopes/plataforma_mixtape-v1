import { preferredLocale } from '@pedrolucaslopes/mixtape-ui'
import { watch } from 'vue'
import { createI18n } from 'vue-i18n'
import ptBR from '@/locales/pt-BR.json'

export type MessageSchema = typeof ptBR

declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
}

export const FALLBACK_LOCALE = 'pt-BR'

/**
 * Só o pt-BR (referência e reserva) entra no bundle inicial. As outras línguas viram chunks próprios,
 * baixados quando são a língua da pessoa ou quando ela troca nas configurações.
 */
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

// Língua ainda não baixada já aparece na lista (e recebe as mensagens do Vuetify) com um catálogo vazio.
for (const code of Object.keys(loaders)) {
  i18n.global.mergeLocaleMessage(code, {})
}

const loaded = new Set([FALLBACK_LOCALE])

/**
 * Baixa as mensagens de uma língua uma vez. Se o download falhar, o texto segue no pt-BR
 * (`fallbackLocale`) e a próxima troca tenta de novo.
 */
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
