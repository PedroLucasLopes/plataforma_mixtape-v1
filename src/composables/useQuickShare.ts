import { toast } from '@pedrolucaslopes/mixtape-ui'
import { useI18n } from 'vue-i18n'

export function useQuickShare () {
  const { t } = useI18n()

  async function share (title: string, text: string): Promise<void> {
    const url = window.location.href
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      toast.success(t('share.copied'))
    } catch {
      toast.error(t('share.copyFailed'))
    }
  }

  return { share }
}
