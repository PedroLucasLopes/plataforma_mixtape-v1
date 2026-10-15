<template>
  <div v-if="groups.length > 0" class="credits" data-testid="track-credits">
    <section
      v-for="(group, index) in groups"
      :key="group.key"
      v-reveal="{ variant: 'up', delay: Math.min(index, 8) * 60 }"
      class="credits__group"
      :style="group.style"
    >
      <h3 class="credits__role">
        <VIcon aria-hidden="true" :icon="group.icon" size="18" />
        {{ group.label }}
      </h3>

      <ul class="credits__people">
        <li v-for="person in group.people" :key="person.key" class="credits__person">
          <RouterLink class="credits__name" data-testid="track-credits-name" :to="artistRoute(person.id)">{{ person.name }}</RouterLink>
          <span v-if="person.detail" class="credits__detail">{{ person.detail }}</span>
        </li>
      </ul>
    </section>
  </div>

  <p v-else class="muted" data-testid="track-credits">{{ t('track.noCredits') }}</p>
</template>

<script lang="ts" setup>
  import type { ArtistRef, TrackCredit, TrackDetails } from '@/types/api'
  import { DUOTONE_NAMES, duotones, vReveal } from '@pedrolucaslopes/mixtape-ui'
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useLabels } from '@/composables/useLabels'
  import { CREDIT_ROLE_ICONS, DEFAULT_CREDIT_ICON } from '@/constants/catalog'
  import { artistRoute } from '@/utils/items'

  const props = defineProps<{ credits: readonly TrackCredit[], work: TrackDetails['work'] }>()

  const { t } = useI18n()
  const labels = useLabels()

  interface Person { key: string, id: string, name: string, detail: string | null }

  const groups = computed(() => {
    const map = new Map<string, { label: string, icon: string, people: Person[] }>()
    const add = (key: string, label: string, icon: string, artist: ArtistRef, detail: string | null) => {
      const group = map.get(key) ?? { label, icon, people: [] }
      if (!group.people.some(person => person.id === artist.id && person.detail === detail)) {
        group.people.push({ key: `${artist.id}-${detail ?? ''}`, id: artist.id, name: artist.name, detail })
      }
      map.set(key, group)
    }

    for (const artist of props.work?.composers ?? []) add('composer', labels.creditRole('composer'), CREDIT_ROLE_ICONS.composer ?? DEFAULT_CREDIT_ICON, artist, null)
    for (const artist of props.work?.lyricists ?? []) add('lyricist', labels.creditRole('lyricist'), CREDIT_ROLE_ICONS.lyricist ?? DEFAULT_CREDIT_ICON, artist, null)
    for (const artist of props.work?.writers ?? []) add('writer', labels.creditRole('writer'), CREDIT_ROLE_ICONS.writer ?? DEFAULT_CREDIT_ICON, artist, null)
    for (const credit of props.credits) {
      const role = credit.role.toLowerCase()
      add(role, labels.creditRole(credit.role), CREDIT_ROLE_ICONS[role] ?? DEFAULT_CREDIT_ICON, credit.artist, credit.attributes.length > 0 ? credit.attributes.join(', ') : null)
    }

    return [...map.entries()].map(([key, group], index) => {
      const colors = duotones[DUOTONE_NAMES[index % DUOTONE_NAMES.length]!]
      return { key, ...group, style: { '--credit-bg': colors.background, '--credit-ink': colors.ink } }
    })
  })
</script>

<style scoped>
.credits {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr));
  gap: 14px;
}

.credits__group {
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 18px;
  color: var(--credit-ink);
  background: var(--credit-bg);
  border-radius: var(--mx-radius-lg);
}

.credits__role {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: var(--mx-text-overline);
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.credits__people {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.credits__person {
  display: grid;
  gap: 2px;
}

.credits__name {
  font-family: var(--mx-font-display);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: var(--mx-tracking-title);
  color: inherit;
  text-decoration: none;
}

.credits__name:hover {
  text-decoration: underline;
}

.credits__name:focus-visible {
  outline: 3px solid var(--credit-ink);
  outline-offset: 2px;
  border-radius: 4px;
}

.credits__detail {
  font-size: 0.875rem;
  font-weight: 650;
  opacity: 0.85;
}
</style>
