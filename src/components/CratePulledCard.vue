<template>
  <div class="crate-card" data-testid="crate-pulled-card">
    <template v-if="heading">
      <p class="crate-card__eyebrow">{{ eyebrow ?? t(`crate.kinds.${kind}`) }}</p>
      <h3 class="crate-card__title">{{ title }}</h3>
      <p v-if="subtitle" class="crate-card__subtitle">{{ subtitle }}</p>
    </template>

    <MxRating v-if="rating !== null" show-value size="sm" :value="rating" />

    <blockquote v-if="body" class="crate-card__body" data-testid="crate-pulled-card-body">{{ body }}</blockquote>

    <p v-if="meta" class="crate-card__meta">
      <VIcon aria-hidden="true" :icon="metaIcon" size="16" />
      {{ meta }}
    </p>

    <div class="crate-card__actions">
      <MxButton
        data-testid="crate-pulled-card-open"
        :icon="OPEN_ICONS[kind]"
        :label="t(`crate.open.${kind}`)"
        size="sm"
        :to="itemRoute(kind, id)"
        variant="cta"
      />

      <MxButton
        v-if="reviewTo"
        data-testid="crate-pulled-card-review"
        icon="mdi-message-text-outline"
        :label="t('crate.seeReview')"
        size="sm"
        :to="reviewTo"
        variant="glass"
      />

      <RateButton
        v-else-if="kind !== 'ARTIST'"
        size="sm"
        :target="{ type: kind, id, title, artist: subtitle ?? null, cover: cover ?? null, year: year ?? null }"
        variant="glass"
      />

      <MxButton
        v-else
        data-testid="crate-pulled-card-rate-artist"
        icon="mdi-album"
        :label="t('crate.rateArtist')"
        size="sm"
        :to="{ name: ROUTE.search, query: { rate: '1', q: title } }"
        variant="glass"
      />

      <ListenLaterButton v-if="listenLater" :id="id" :kind="kind" :title="title" />

      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { ListenLaterKind } from '@/types/api'
  import type { RouteLocationRaw } from 'vue-router'
  import { MxButton, MxRating } from '@pedrolucaslopes/mixtape-ui'
  import { useI18n } from 'vue-i18n'
  import ListenLaterButton from '@/components/ListenLaterButton.vue'
  import RateButton from '@/components/RateButton.vue'
  import { ROUTE } from '@/router/routes'
  import { itemRoute } from '@/utils/items'

  withDefaults(defineProps<{
    kind: ListenLaterKind
    id: string
    title: string
    subtitle?: string | null
    eyebrow?: string | null
    meta?: string | null
    metaIcon?: string
    rating?: number | null
    /** O texto da resenha (painel das avaliações recentes do perfil): os primeiros parágrafos; o resto, na página dela. */
    body?: string | null
    reviewTo?: RouteLocationRaw | null
    cover?: string | null
    year?: string | null
    listenLater?: boolean
    heading?: boolean
  }>(), {
    subtitle: null,
    eyebrow: null,
    meta: null,
    metaIcon: 'mdi-headphones',
    rating: null,
    body: null,
    reviewTo: null,
    cover: null,
    year: null,
    listenLater: true,
    heading: true,
  })

  const OPEN_ICONS: Readonly<Record<ListenLaterKind, string>> = {
    ALBUM: 'mdi-album',
    TRACK: 'mdi-music-note',
    ARTIST: 'mdi-account-music',
  }

  const { t } = useI18n()
</script>

<style scoped>
.crate-card {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.crate-card__eyebrow {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mx-on-surface-muted);
}

.crate-card__title {
  margin: 0;
  font-family: var(--mx-font-display);
  font-size: var(--mx-text-h3);
  font-weight: 800;
  letter-spacing: var(--mx-tracking-title);
  line-height: 1.1;
  overflow-wrap: anywhere;
}

.crate-card__subtitle {
  margin: 0;
  font-weight: 600;
  color: var(--mx-on-surface-muted);
}

.crate-card__body {
  display: -webkit-box;
  margin: 2px 0 0;
  padding: 10px 14px;
  overflow: hidden;
  font-size: 0.9375rem;
  line-height: 1.5;
  white-space: pre-line;
  overflow-wrap: anywhere;
  border-left: 3px solid var(--mx-link);
  border-radius: 0 var(--mx-radius-sm) var(--mx-radius-sm) 0;
  background: color-mix(in srgb, var(--mx-link) 8%, transparent);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 8;
  line-clamp: 8;
}

.crate-card__meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 0.875rem;
  color: var(--mx-on-surface-muted);
}

.crate-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}
</style>
