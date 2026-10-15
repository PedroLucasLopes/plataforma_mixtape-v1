<template>
  <MxSection
    v-if="albums.length > 0"
    data-testid="more-from-artist"
    :eyebrow="t('item.moreEyebrow')"
    :more-label="t('item.seeArtist')"
    :more-to="artistRoute(artistId)"
    :title="t('item.moreFrom', { name: artist.data.value?.name ?? artistName })"
  >
    <MxRail :label="t('item.moreFrom', { name: artist.data.value?.name ?? artistName })">
      <li v-for="(album, index) in albums" :key="album.id" v-reveal="{ variant: 'up', delay: Math.min(index, 6) * 60 }">
        <MxItemCard v-bind="cards.album(album)" />
      </li>
    </MxRail>
  </MxSection>

  <div v-else-if="artist.loading.value" aria-hidden="true" class="more-from__skeleton" data-testid="more-from-artist">
    <MxSkeleton v-for="index in 5" :key="index" shape="square" />
  </div>
</template>

<script lang="ts" setup>
  import { MxItemCard, MxRail, MxSection, MxSkeleton, vReveal } from '@pedrolucaslopes/mixtape-ui'
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useAsyncData } from '@/composables/useAsyncData'
  import { useCatalogCards } from '@/composables/useCatalogCards'
  import { RAIL_SIZE } from '@/constants/api'
  import { catalogApi } from '@/services/mixtape'
  import { artistRoute } from '@/utils/items'

  const props = defineProps<{ artistId: string, artistName: string, excludeId?: string }>()

  const { t } = useI18n()
  const cards = useCatalogCards()

  const artist = useAsyncData(() => catalogApi.artist(props.artistId), { watch: () => props.artistId })

  const albums = computed(() => (artist.data.value?.discography ?? [])
    .filter(album => album.id !== props.excludeId)
    .slice(0, RAIL_SIZE))
</script>

<style scoped>
.more-from__skeleton {
  display: grid;
  grid-auto-columns: clamp(150px, 42vw, 210px);
  grid-auto-flow: column;
  gap: 16px;
  overflow: hidden;
}
</style>
