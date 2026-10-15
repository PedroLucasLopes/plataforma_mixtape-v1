<template>
  <div class="page" data-testid="page-playlists">
    <header class="page-header">
      <p class="page-header__eyebrow">{{ t('playlists.eyebrow') }}</p>
      <h1 class="page-header__title">{{ t('playlists.title') }}</h1>
      <p class="page-header__lead">{{ t('playlists.lead') }}</p>

      <div class="toolbar">
        <MxButton data-testid="page-playlists-create" icon="mdi-playlist-plus" :label="t('playlists.create')" @click="create" />
      </div>
    </header>

    <MxSection
      v-if="session.isAuthenticated && session.username"
      :description="t('playlists.mineDescription')"
      :more-to="{ name: ROUTE.userPlaylists, params: { username: session.username } }"
      :title="t('playlists.mine')"
    >
      <PlaylistGrid
        :empty-description="t('playlists.mineEmptyDescription')"
        :empty-title="t('playlists.mineEmpty')"
        :label="t('playlists.mine')"
        :loader="loadMine"
        :watch-key="session.username"
      >
        <template #empty>
          <MxButton data-testid="page-playlists-create-empty" icon="mdi-playlist-plus" :label="t('playlists.create')" @click="create" />
        </template>
      </PlaylistGrid>
    </MxSection>

    <MxSection :description="t('playlists.exploreDescription')" :title="t('playlists.explore')">
      <PlaylistGrid
        :empty-description="t('playlists.emptyDescription')"
        :empty-title="t('playlists.empty')"
        :label="t('playlists.explore')"
        :loader="loadExplore"
      />
    </MxSection>

    <PlaylistFormDialog v-model="creating" @saved="created" />
  </div>
</template>

<script lang="ts" setup>
  import type { Playlist } from '@/types/api'
  import { MxButton, MxSection, toast } from '@pedrolucaslopes/mixtape-ui'
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import PlaylistFormDialog from '@/components/PlaylistFormDialog.vue'
  import PlaylistGrid from '@/components/PlaylistGrid.vue'
  import { useAuthAction } from '@/composables/useAuthAction'
  import { useSeo } from '@/composables/useSeo'
  import { ROUTE } from '@/router/routes'
  import { playlistsApi } from '@/services/mixtape'
  import { useSessionStore } from '@/stores/session'
  import { playlistRoute } from '@/utils/items'

  const { t } = useI18n()
  const router = useRouter()
  const session = useSessionStore()
  const { requireAuth } = useAuthAction()

  const creating = ref(false)

  const loadMine = (page: number, limit: number) => playlistsApi.mine({ page, limit })
  const loadExplore = (page: number, limit: number) => playlistsApi.explore({ page, limit })

  function create (): void {
    if (requireAuth(t('playlists.signInToCreate'))) creating.value = true
  }

  async function created (playlist: Playlist): Promise<void> {
    toast.success(t('playlists.created', { title: playlist.title }))
    await router.push(playlistRoute(playlist.id))
  }

  useSeo(() => ({ title: t('playlists.title'), description: t('playlists.lead') }))
</script>
