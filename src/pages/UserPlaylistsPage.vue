<template>
  <div class="page" data-testid="page-user-playlists">
    <header class="page-header">
      <RouterLink class="link-strong user-playlists__back" data-testid="page-user-playlists-back" :to="profileRoute(username)">
        <VIcon aria-hidden="true" icon="mdi-arrow-left" size="18" />
        @{{ username }}
      </RouterLink>

      <h1 class="page-header__title">{{ isMe ? t('playlists.mine') : t('playlists.ofUser', { username }) }}</h1>
      <p class="page-header__lead">{{ isMe ? t('playlists.mineDescription') : t('playlists.ofUserDescription', { username }) }}</p>

      <div v-if="isMe" class="toolbar">
        <MxButton data-testid="page-user-playlists-create" icon="mdi-playlist-plus" :label="t('playlists.create')" @click="creating = true" />
      </div>
    </header>

    <PlaylistGrid
      :empty-description="isMe ? t('playlists.mineEmptyDescription') : t('playlists.ofUserEmptyDescription')"
      :empty-title="isMe ? t('playlists.mineEmpty') : t('playlists.ofUserEmpty', { username })"
      :label="isMe ? t('playlists.mine') : t('playlists.ofUser', { username })"
      :loader="loadPlaylists"
      :watch-key="[username, session.isAuthenticated]"
    />

    <PlaylistFormDialog v-if="isMe" v-model="creating" @saved="created" />
  </div>
</template>

<script lang="ts" setup>
  import type { Playlist } from '@/types/api'
  import { MxButton, toast } from '@pedrolucaslopes/mixtape-ui'
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import PlaylistFormDialog from '@/components/PlaylistFormDialog.vue'
  import PlaylistGrid from '@/components/PlaylistGrid.vue'
  import { useSeo } from '@/composables/useSeo'
  import { playlistsApi } from '@/services/mixtape'
  import { useSessionStore } from '@/stores/session'
  import { playlistRoute, profileRoute } from '@/utils/items'

  const props = defineProps<{ username: string }>()

  const { t } = useI18n()
  const router = useRouter()
  const session = useSessionStore()

  const username = computed(() => props.username)
  const isMe = computed(() => session.username === props.username)
  const creating = ref(false)

  const loadPlaylists = (page: number, limit: number) => playlistsApi.ofUser(props.username, { page, limit })

  async function created (playlist: Playlist): Promise<void> {
    toast.success(t('playlists.created', { title: playlist.title }))
    await router.push(playlistRoute(playlist.id))
  }

  useSeo(() => ({
    title: t('playlists.ofUser', { username: props.username }),
    description: t('playlists.ofUserDescription', { username: props.username }),
  }))
</script>

<style scoped>
.user-playlists__back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  justify-self: start;
  text-decoration: none;
}
</style>
