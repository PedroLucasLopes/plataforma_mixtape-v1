import type { SharePayload } from '@/types/api'
import type { ShareQrCode } from '@pedrolucaslopes/mixtape-ui'
import { toast } from '@pedrolucaslopes/mixtape-ui'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { qrCodePath } from '@/constants/api'
import { t } from '@/plugins/i18n'
import { errorMessage } from '@/services/http'
import { shareApi } from '@/services/mixtape'

export type ShareRef
  = | { kind: 'profile', username: string }
    | { kind: 'review', id: string }
    | { kind: 'playlist', id: string }
    | { kind: 'group', id: string }

export const useShareStore = defineStore('share', () => {
  const open = ref(false)
  const title = ref('')
  const payload = ref<SharePayload | null>(null)
  const qr = ref<ShareQrCode | null>(null)
  const loading = ref(false)

  async function start (ref: ShareRef, heading: string): Promise<void> {
    title.value = heading
    payload.value = null
    qr.value = null
    open.value = true
    loading.value = true
    try {
      switch (ref.kind) {
        case 'profile': {
          payload.value = await shareApi.profile(ref.username)
          qr.value = {
            png: qrCodePath(ref.username, 'png'),
            svg: qrCodePath(ref.username, 'svg'),
            alt: t('share.qrAlt', { username: ref.username }),
            downloadName: `mixtape-${ref.username}`,
          }

          break
        }
        case 'review': {
          payload.value = await shareApi.review(ref.id)

          break
        }
        case 'playlist': {
          payload.value = await shareApi.playlist(ref.id)

          break
        }
        default: {
          payload.value = await shareApi.group(ref.id)
        }
      }
    } catch (error) {
      open.value = false
      toast.error(errorMessage(error))
    } finally {
      loading.value = false
    }
  }

  return { open, title, payload, qr, loading, start }
})
