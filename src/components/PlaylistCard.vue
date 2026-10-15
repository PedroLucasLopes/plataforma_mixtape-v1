<template>
  <article class="playlist-card" data-testid="playlist-card">
    <div v-tilt="{ max: 6, glare: true }" class="playlist-card__media">
      <MxMosaic :covers="playlist.coverUrls" :seed="playlist.id" />

      <span v-if="playlist.visibility === 'PRIVATE'" class="playlist-card__private">
        <VIcon aria-hidden="true" icon="mdi-lock" size="14" />
        {{ t('playlists.private') }}
      </span>
    </div>

    <h3 class="playlist-card__title">
      <RouterLink class="playlist-card__link" data-testid="playlist-card-link" :to="playlistRoute(playlist.id)">{{ playlist.title }}</RouterLink>
    </h3>

    <p class="playlist-card__meta">
      {{ t('playlists.byOwner', { name: playlist.owner.fullName }) }} ·
      {{ t('playlists.items', { count: playlist.itemsCount }) }}
    </p>

    <p v-if="playlist.description" class="playlist-card__description">{{ playlist.description }}</p>
  </article>
</template>

<script lang="ts" setup>
  import type { PlaylistSummary } from '@/types/api'
  import { MxMosaic, vTilt } from '@pedrolucaslopes/mixtape-ui'
  import { useI18n } from 'vue-i18n'
  import { playlistRoute } from '@/utils/items'

  defineProps<{ playlist: PlaylistSummary }>()

  const { t } = useI18n()
</script>

<style scoped>
.playlist-card {
  position: relative;
  display: grid;
  gap: 8px;
  min-width: 0;
}

.playlist-card__media {
  position: relative;
  border-radius: var(--mx-radius-sm);
}

.playlist-card__media :deep(.mx-mosaic) {
  width: 100%;
}

.playlist-card__private {
  position: absolute;
  top: 8px;
  left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 800;
  color: #fff;
  background: rgba(11, 10, 18, 0.7);
  border-radius: var(--mx-radius-pill);
}

.playlist-card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
}

.playlist-card__link {
  color: inherit;
  text-decoration: none;
}

.playlist-card__link::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
}

.playlist-card:hover .playlist-card__link {
  text-decoration: underline;
}

.playlist-card__link:focus-visible {
  outline: none;
}

.playlist-card__link:focus-visible::after {
  outline: 3px solid var(--mx-focus);
  outline-offset: 4px;
  border-radius: var(--mx-radius-sm);
}

.playlist-card__meta,
.playlist-card__description {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--mx-on-surface-muted);
}

.playlist-card__description {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
