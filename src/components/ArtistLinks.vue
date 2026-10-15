<template>
  <span v-if="artists.length > 0" class="artist-links" data-testid="artist-links">
    <template v-for="(artist, index) in artists" :key="artist.id">
      <RouterLink class="hero-link" data-testid="artist-links-artist" :to="artistRoute(artist.id)">{{ artist.name }}</RouterLink>
      <span v-if="index < artists.length - 2">, </span>
      <span v-else-if="index === artists.length - 2"> {{ t('common.and') }} </span>
    </template>
  </span>

  <span v-else data-testid="artist-links">{{ fallback }}</span>
</template>

<script lang="ts" setup>
  import type { ArtistRef } from '@/types/api'
  import { useI18n } from 'vue-i18n'
  import { artistRoute } from '@/utils/items'

  defineProps<{ artists: readonly ArtistRef[], fallback?: string | null }>()

  const { t } = useI18n()
</script>
