import type { PlaylistItemKind, PlaylistSummary, PlaylistVisibility } from '@/types/api'
import { toast } from '@pedrolucaslopes/mixtape-ui'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { t } from '@/plugins/i18n'
import router from '@/router'
import { ROUTE } from '@/router/routes'
import { errorMessage } from '@/services/http'
import { playlistsApi } from '@/services/mixtape'

export interface PickerTarget {
  kind: PlaylistItemKind
  refId: string
  label: string
}

const PICKER_LIMIT = 50

export const usePlaylistPickerStore = defineStore('playlistPicker', () => {
  const open = ref(false)
  const target = ref<PickerTarget | null>(null)
  const playlists = ref<PlaylistSummary[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  async function start (next: PickerTarget): Promise<void> {
    target.value = next
    error.value = null
    open.value = true
    loading.value = true
    try {
      playlists.value = (await playlistsApi.mine({ page: 1, limit: PICKER_LIMIT })).items
    } catch (error_) {
      error.value = errorMessage(error_)
    } finally {
      loading.value = false
    }
  }

  function announce (playlistId: string, title: string): void {
    toast.success(t('playlists.added', { title }), {
      action: { label: t('playlists.open'), handler: () => void router.push({ name: ROUTE.playlist, params: { id: playlistId } }) },
    })
  }

  async function add (playlist: PlaylistSummary, note: string | null): Promise<void> {
    if (!target.value || saving.value) {
      return
    }
    saving.value = true
    error.value = null
    try {
      await playlistsApi.addItem(playlist.id, target.value.kind, target.value.refId, note)
      open.value = false
      announce(playlist.id, playlist.title)
    } catch (error_) {
      error.value = errorMessage(error_)
    } finally {
      saving.value = false
    }
  }

  async function createAndAdd (title: string, visibility: PlaylistVisibility, note: string | null): Promise<void> {
    if (!target.value || saving.value) {
      return
    }
    saving.value = true
    error.value = null
    try {
      const playlist = await playlistsApi.create({ title, visibility })
      await playlistsApi.addItem(playlist.id, target.value.kind, target.value.refId, note)
      open.value = false
      announce(playlist.id, playlist.title)
    } catch (error_) {
      error.value = errorMessage(error_)
    } finally {
      saving.value = false
    }
  }

  return { open, target, playlists, loading, saving, error, start, add, createAndAdd }
})
