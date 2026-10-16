<template>
  <div class="review-grid" data-testid="review-grid">
    <div v-if="!paged.loaded.value && paged.loading.value" aria-hidden="true" class="review-grid__skeleton">
      <MxSkeleton v-for="index in 8" :key="index" shape="square" />
    </div>

    <MxErrorState v-else-if="paged.error.value && paged.items.value.length === 0" compact :description="paged.error.value" @retry="paged.reset()" />

    <MxEmptyState
      v-else-if="paged.loaded.value && paged.items.value.length === 0"
      compact
      :description="emptyDescription"
      :heading-level="3"
      icon="mdi-album"
      :title="emptyTitle"
    />

    <template v-else>
      <MxGrid class="review-grid__grid" :label="label" min="150px">
        <TransitionGroup name="review-grid-stack" @before-leave="keepInPlace">
          <li
            v-for="tile in tiles"
            :key="tile.review.id"
            v-reveal="tile.member ? false : { variant: 'up', delay: tile.index % 8 * 50 }"
            :class="{ 'review-grid__item--member': tile.member, 'review-grid__item--stacked': tile.member || open.has(tile.review.id) }"
            :data-testid="`review-grid-${tile.member ? 'member' : 'entry'}`"
            :style="tile.style"
          >
            <article class="review-tile">
              <MxCoverStack
                v-if="tile.tracks.length > 0"
                class="review-tile__stack"
                :count="tile.tracks.length"
                data-testid="review-grid-stack"
                :expanded="open.has(tile.review.id)"
                icon="mdi-music-note"
                :label="t('library.stack.toggle', { title: tile.review.item.title, count: tile.tracks.length })"
                :priority="tile.index < 4"
                :seed="tile.review.item.id"
                sizes="(max-width: 600px) 45vw, 200px"
                :src="tile.review.item.coverUrl"
                :title="tile.review.item.title"
                @update:expanded="toggle(tile.review.id, $event)"
              />

              <MxCover
                v-else
                :priority="tile.index < 4"
                :seed="tile.review.item.id"
                sizes="(max-width: 600px) 45vw, 200px"
                :src="tile.review.item.coverUrl"
                :title="tile.review.item.title"
                :vinyl="tile.review.item.type === 'ALBUM'"
              />

              <MxRating show-value size="sm" :value="tile.review.rating" />

              <h3 class="review-tile__title">
                <RouterLink :aria-label="t('library.openReview', { title: tile.review.item.title })" class="review-tile__link" data-testid="review-grid-link" :to="reviewRoute(tile.review.id)">
                  {{ tile.review.item.title }}
                </RouterLink>
              </h3>

              <p v-if="tile.review.item.artistName" class="review-tile__artist">{{ tile.review.item.artistName }}</p>

              <span v-if="tile.member" class="review-tile__album">
                <VIcon aria-hidden="true" icon="mdi-album" size="14" />
                {{ t('library.stack.fromAlbum', { album: tile.album }) }}
              </span>

              <span v-if="tile.review.body" class="review-tile__written">
                <VIcon aria-hidden="true" icon="mdi-text" size="14" />
                {{ t('library.withReview') }}
              </span>

              <span v-if="tile.review.groupReview" class="review-tile__galera">
                <VIcon aria-hidden="true" icon="mdi-account-group" size="14" />
                {{ t('library.galera', { group: tile.review.groupReview.group.name }) }}
              </span>

              <span v-if="tile.review.visibility !== 'PUBLIC'" class="review-tile__lock">
                <VIcon aria-hidden="true" icon="mdi-lock-outline" size="14" />
                {{ tile.review.visibility === 'GROUP' ? t('library.visibility.group') : t('library.visibility.private') }}
              </span>
            </article>
          </li>
        </TransitionGroup>
      </MxGrid>

      <MxLoadMore data-testid="review-grid-load-more" :has-more="paged.hasMore.value" :loading="paged.loading.value" @load="paged.loadMore()" />
    </template>
  </div>
</template>

<script lang="ts" setup>
  import type { LibraryStack, Page, Review } from '@/types/api'
  import { MxCover, MxCoverStack, MxEmptyState, MxErrorState, MxGrid, MxLoadMore, MxRating, MxSkeleton, vReveal } from '@pedrolucaslopes/mixtape-ui'
  import { computed, shallowRef, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { usePaged } from '@/composables/usePaged'
  import { LIBRARY_GRID_PAGE_SIZE } from '@/constants/api'
  import { LIBRARY_STACK_STAGGER } from '@/constants/catalog'
  import { useComposerStore } from '@/stores/composer'
  import { reviewRoute } from '@/utils/items'

  interface GridTile {
    review: Review
    member: boolean
    tracks: Review[]
    album: string | null
    index: number
    style?: Record<string, string>
  }

  const props = defineProps<{
    loader: (page: number, limit: number) => Promise<Page<LibraryStack>>
    watchKey?: unknown
    label: string
    emptyTitle: string
    emptyDescription?: string
  }>()

  const { t } = useI18n()
  const composer = useComposerStore()
  const paged = usePaged<LibraryStack>((page, limit) => props.loader(page, limit), { limit: LIBRARY_GRID_PAGE_SIZE, watch: () => props.watchKey })
  const open = shallowRef(new Set<string>())

  const tiles = computed<GridTile[]>(() => paged.items.value.flatMap((entry, index) => {
    const lead: GridTile = { review: entry.review, member: false, tracks: entry.tracks, album: null, index }
    if (!open.value.has(entry.review.id)) {
      return [lead]
    }
    return [lead, ...entry.tracks.map((review, position): GridTile => ({
      review,
      member: true,
      tracks: [],
      album: entry.review.item.title,
      index,
      style: { '--review-grid-delay': `${Math.min(position, LIBRARY_STACK_STAGGER.maxSteps) * LIBRARY_STACK_STAGGER.stepMs}ms` },
    }))]
  }))

  function toggle (id: string, expanded: boolean): void {
    const next = new Set(open.value)
    if (expanded) {
      next.add(id)
    } else {
      next.delete(id)
    }
    open.value = next
  }

  function keepInPlace (element: Element): void {
    if (!(element instanceof HTMLElement)) {
      return
    }
    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = element
    Object.assign(element.style, {
      position: 'absolute',
      left: `${offsetLeft}px`,
      top: `${offsetTop}px`,
      width: `${offsetWidth}px`,
      height: `${offsetHeight}px`,
    })
  }

  watch(() => composer.version, () => void paged.reset())

  defineExpose({ reset: paged.reset })
</script>

<style scoped>
.review-grid {
  display: grid;
  gap: 16px;
}

.review-grid__skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.review-grid__grid {
  position: relative;
}

.review-grid__item--stacked {
  --review-grid-tint: color-mix(in srgb, var(--mx-primary) 12%, transparent);
  background: var(--review-grid-tint);
  border-radius: var(--mx-radius-sm);
  box-shadow: 0 0 0 8px var(--review-grid-tint);
}

.review-grid-stack-move {
  transition: transform var(--mx-spring-smooth-duration) var(--mx-spring-smooth);
}

.review-grid__item--member.review-grid-stack-enter-active {
  transition:
    opacity var(--mx-duration-normal) var(--mx-ease-out) var(--review-grid-delay, 0ms),
    transform var(--mx-spring-smooth-duration) var(--mx-spring-smooth) var(--review-grid-delay, 0ms);
}

.review-grid__item--member.review-grid-stack-leave-active {
  transition:
    opacity var(--mx-duration-fast) var(--mx-ease-in),
    transform var(--mx-duration-fast) var(--mx-ease-in);
}

.review-grid__item--member.review-grid-stack-enter-from,
.review-grid__item--member.review-grid-stack-leave-to {
  opacity: 0;
  transform: translateX(-24px) scale(0.92);
}

.review-tile {
  position: relative;
  display: grid;
  gap: 8px;
  min-width: 0;
}

.review-tile__galera,
.review-tile__lock {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  gap: 4px;
  max-width: 100%;
  padding: 2px 8px;
  overflow: hidden;
  font-size: 0.75rem;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: var(--mx-radius-pill);
}

.review-tile__galera {
  color: var(--mx-on-cta);
  background: var(--mx-cta);
}

.review-tile__lock {
  color: var(--mx-on-surface-muted);
  background: var(--mx-surface-variant);
}

.review-tile :deep(.mx-cover) {
  width: 100%;
}

.review-tile__title {
  display: -webkit-box;
  margin: 2px 0 0;
  overflow: hidden;
  font-size: 0.9375rem;
  font-weight: 800;
  line-height: 1.25;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.review-tile__link {
  color: inherit;
  text-decoration: none;
}

.review-tile__link::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: var(--mx-radius-md);
}

.review-tile__link:focus-visible {
  outline: none;
}

.review-tile__link:focus-visible::after {
  outline: 3px solid var(--mx-focus);
  outline-offset: 4px;
}

.review-tile:not(:has(.review-tile__stack:hover)):hover .review-tile__link {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

.review-tile__stack {
  z-index: 3;
}

.review-tile__album {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  margin-top: -4px;
  overflow: hidden;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--mx-on-surface-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-tile__artist {
  margin: -4px 0 0;
  overflow: hidden;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--mx-on-surface-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-tile__written {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  justify-self: start;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--mx-link);
}

@media (prefers-reduced-motion: reduce) {
  .review-grid-stack-move,
  .review-grid__item--member.review-grid-stack-enter-active,
  .review-grid__item--member.review-grid-stack-leave-active {
    transition: none;
  }
}
</style>
