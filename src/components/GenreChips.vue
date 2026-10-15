<template>
  <ul v-if="genres.length > 0" :aria-label="label" class="chip-row" data-testid="genre-chips">
    <li v-for="(genre, index) in genres" :key="genre" v-reveal="{ variant: 'pop', delay: Math.min(index, 10) * 40 }">
      <MxChip
        data-testid="genre-chips-genre"
        :duotone="DUOTONE_NAMES[(offset + index) % DUOTONE_NAMES.length]"
        :label="genre"
        :size="size"
        :to="{ name: ROUTE.search, query: { q: genre } }"
        variant="duotone"
      />
    </li>
  </ul>

  <p v-else-if="empty" class="muted genre-chips__empty" data-testid="genre-chips">{{ empty }}</p>
</template>

<script lang="ts" setup>
  import { DUOTONE_NAMES, hashString, MxChip, vReveal } from '@pedrolucaslopes/mixtape-ui'
  import { computed } from 'vue'
  import { ROUTE } from '@/router/routes'

  const props = withDefaults(defineProps<{
    genres: readonly string[]
    label?: string
    empty?: string
    seed?: string
    size?: 'sm' | 'md' | 'lg'
  }>(), { seed: 'genres', size: 'md' })

  const offset = computed(() => hashString(props.seed) % DUOTONE_NAMES.length)
</script>

<style scoped>
.genre-chips__empty {
  margin: 0;
}
</style>
