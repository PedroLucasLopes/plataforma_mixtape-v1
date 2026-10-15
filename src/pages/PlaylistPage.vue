<template>
  <PageState
    data-testid="page-playlist"
    :error="playlist.error.value"
    :loading="playlist.loading.value"
    :not-found="playlist.notFound.value"
    :not-found-description="t('playlist.notFoundDescription')"
    :not-found-title="t('playlist.notFound')"
    :ready="Boolean(playlist.data.value)"
    @retry="playlist.reload()"
  >
    <article v-if="playlist.data.value" class="page">
      <MxPageHero
        decoration="sun"
        :duotone="duotone"
        :eyebrow="playlist.data.value.visibility === 'PRIVATE' ? t('playlist.eyebrowPrivate') : t('playlist.eyebrow')"
        layout="split"
        :title="playlist.data.value.title"
      >
        <template #media>
          <div v-tilt="{ max: 8, glare: true }" class="hero-cover hero-cover--float">
            <MxMosaic :covers="playlist.data.value.coverUrls" :seed="playlist.data.value.id" />
          </div>
        </template>

        <template #subtitle>
          <i18n-t keypath="playlist.by" scope="global" tag="span">
            <template #name>
              <RouterLink class="hero-link" data-testid="page-playlist-owner" :to="profileRoute(playlist.data.value.owner.username)">{{ playlist.data.value.owner.fullName }}</RouterLink>
            </template>
          </i18n-t>
        </template>

        <template #story>
          <p v-if="playlist.data.value.description" class="playlist__description">{{ playlist.data.value.description }}</p>

          <ul class="hero-facts">
            <li>
              <VIcon aria-hidden="true" :icon="playlist.data.value.visibility === 'PRIVATE' ? 'mdi-lock' : 'mdi-earth'" size="16" />
              {{ playlist.data.value.visibility === 'PRIVATE' ? t('playlists.private') : t('playlists.public') }}
            </li>

            <li>
              <VIcon aria-hidden="true" icon="mdi-calendar-plus" size="16" />
              {{ t('playlist.createdAt', { date: formatDate(playlist.data.value.createdAt, locale) }) }}
            </li>

            <li>
              <VIcon aria-hidden="true" icon="mdi-update" size="16" />
              {{ t('playlist.updatedAt', { date: relativeTime(playlist.data.value.updatedAt, locale) }) }}
            </li>
          </ul>
        </template>

        <template #stats>
          <MxStat :label="t('playlist.stats.items')" :value="playlist.data.value.itemsCount" />
          <MxStat v-for="entry in kindCounts" :key="entry.kind" :label="t(`playlist.kinds.${entry.kind}`, entry.count)" :value="entry.count" />
        </template>

        <template #actions>
          <template v-if="isOwner">
            <MxButton
              data-testid="page-playlist-edit"
              icon="mdi-pencil"
              :label="t('playlist.edit')"
              variant="ink"
              @click="editing = true"
            />

            <MxButton
              data-testid="page-playlist-delete"
              icon="mdi-delete-outline"
              :label="t('playlist.delete')"
              variant="ink-outline"
              @click="confirmingDelete = true"
            />
          </template>

          <MxIconButton
            data-testid="page-playlist-share"
            icon="mdi-share-variant"
            :label="t('playlist.share')"
            variant="ink"
            @click="sharePlaylist"
          />
        </template>
      </MxPageHero>

      <section aria-labelledby="playlist-items-title" class="playlist__items">
        <div class="toolbar">
          <h2 id="playlist-items-title" class="panel-title">{{ t('playlist.items', { count: playlist.data.value.itemsCount }) }}</h2>
          <span class="toolbar__spacer" />
          <p v-if="isOwner && playlist.data.value.items.length > 1" class="muted playlist__hint">{{ t('playlist.reorderHint') }}</p>
        </div>

        <MxEmptyState
          v-if="playlist.data.value.items.length === 0"
          :description="isOwner ? t('playlist.emptyOwnerDescription') : t('playlist.emptyDescription')"
          duotone="lime"
          :heading-level="3"
          icon="mdi-playlist-music"
          :title="t('playlist.empty')"
        >
          <MxButton
            v-if="isOwner"
            data-testid="page-playlist-find-something"
            icon="mdi-magnify"
            :label="t('playlist.findSomething')"
            :to="{ name: ROUTE.search }"
          />
        </MxEmptyState>

        <TransitionGroup v-else class="playlist__list" name="playlist-item" tag="ol">
          <li v-for="(entry, index) in visibleItems" :key="entry.id" class="playlist-item">
            <span aria-hidden="true" class="playlist-item__position">{{ entry.position }}</span>

            <template v-if="entry.kind === 'REVIEW' && entry.review">
              <MxCover
                class="playlist-item__cover"
                :seed="entry.review.item.id"
                size="72px"
                sizes="72px"
                :src="entry.review.item.coverUrl"
                :title="entry.review.item.title"
              />

              <div class="playlist-item__body">
                <p class="playlist-item__kind">{{ t('playlist.kindLabels.REVIEW') }}</p>

                <h3 class="playlist-item__title">
                  <RouterLink data-testid="page-playlist-review" :to="reviewRoute(entry.review.id)">
                    {{ t('playlist.reviewTitle', { username: entry.review.author.username, title: entry.review.item.title }) }}
                  </RouterLink>
                </h3>

                <p class="playlist-item__meta">
                  <MxRating show-value size="xs" :value="entry.review.rating" />
                  <span>{{ entry.review.item.artistName }}</span>
                  <span><VIcon aria-hidden="true" icon="mdi-heart-outline" size="14" /> {{ formatNumber(entry.review.likes, locale) }}</span>
                </p>

                <p v-if="entry.review.body" class="playlist-item__excerpt">“{{ excerpt(entry.review.body) }}”</p>
              </div>
            </template>

            <template v-else-if="entry.item">
              <MxCover
                class="playlist-item__cover"
                :seed="entry.item.id"
                :shape="entry.kind === 'ARTIST' ? 'circle' : 'square'"
                size="72px"
                sizes="72px"
                :src="entry.item.coverUrl"
                :title="entry.item.title"
              />

              <div class="playlist-item__body">
                <p class="playlist-item__kind">{{ t(`playlist.kindLabels.${entry.kind}`) }}</p>

                <h3 class="playlist-item__title">
                  <RouterLink data-testid="page-playlist-item" :to="itemRoute(entry.item.type, entry.item.id)">{{ entry.item.title }}</RouterLink>
                </h3>

                <p class="playlist-item__meta">{{ cards.join([entry.item.artistName, entry.kind === 'TRACK' ? entry.item.albumTitle : null, yearOf(entry.item.releaseDate)]) }}</p>
              </div>
            </template>

            <div v-else class="playlist-item__body playlist-item__body--missing">
              <p class="playlist-item__kind">{{ t(`playlist.kindLabels.${entry.kind}`) }}</p>
              <p class="playlist-item__title">{{ t('playlist.unavailable') }}</p>
            </div>

            <div class="playlist-item__side">
              <p v-if="entry.note" class="playlist-item__note">
                <VIcon aria-hidden="true" icon="mdi-format-quote-open" size="16" />
                {{ entry.note }}
              </p>

              <p class="playlist-item__added">{{ t('playlist.addedAt', { date: relativeTime(entry.addedAt, locale) }) }}</p>

              <div v-if="isOwner" class="playlist-item__actions">
                <MxIconButton
                  data-testid="page-playlist-move-up"
                  :disabled="index === 0 || busy"
                  icon="mdi-arrow-up"
                  :label="t('playlist.moveUp')"
                  size="sm"
                  variant="ghost"
                  @click="move(entry, -1)"
                />

                <MxIconButton
                  data-testid="page-playlist-move-down"
                  :disabled="index === playlist.data.value.items.length - 1 || busy"
                  icon="mdi-arrow-down"
                  :label="t('playlist.moveDown')"
                  size="sm"
                  variant="ghost"
                  @click="move(entry, 1)"
                />

                <MxIconButton
                  data-testid="page-playlist-edit-note"
                  :disabled="busy"
                  icon="mdi-note-edit-outline"
                  :label="t('playlist.editNote')"
                  size="sm"
                  variant="ghost"
                  @click="openNote(entry)"
                />

                <MxIconButton
                  data-testid="page-playlist-remove-item"
                  :disabled="busy"
                  icon="mdi-close"
                  :label="t('playlist.removeItem')"
                  size="sm"
                  variant="ghost"
                  @click="removeItem(entry)"
                />
              </div>
            </div>
          </li>
        </TransitionGroup>

        <MxButton
          v-if="hiddenCount > 0"
          class="playlist__more"
          data-testid="page-playlist-more"
          icon="mdi-chevron-down"
          :label="t('playlist.showMore', { count: hiddenCount })"
          variant="glass"
          @click="renderCount += PLAYLIST_RENDER_STEP"
        />
      </section>

      <PlaylistFormDialog v-if="isOwner" v-model="editing" :playlist="playlist.data.value" @saved="saved" />

      <MxDialog v-model="noteOpen" data-testid="page-playlist-note-dialog" :description="t('playlist.noteDescription')" :title="t('playlist.editNote')">
        <form :id="noteFormId" class="form-grid" data-testid="page-playlist-note-form" @submit.prevent="saveNote">
          <MxTextarea
            v-model="noteDraft"
            autofocus
            data-testid="page-playlist-note"
            :label="t('playlist.note')"
            :maxlength="MAX_PLAYLIST_NOTE_LENGTH"
            :rows="3"
          />

          <p v-if="noteError" class="form-error" data-testid="page-playlist-note-error" role="alert">{{ noteError }}</p>
        </form>

        <template #actions>
          <MxButton data-testid="page-playlist-note-cancel" :label="t('common.cancel')" variant="ghost" @click="noteOpen = false" />

          <MxButton
            data-testid="page-playlist-note-save"
            :form="noteFormId"
            icon="mdi-check"
            :label="t('common.save')"
            :loading="busy"
            type="submit"
          />
        </template>
      </MxDialog>

      <MxConfirmDialog
        v-model="confirmingDelete"
        :confirm-label="t('playlist.delete')"
        data-testid="page-playlist-delete-confirm"
        destructive
        :error="deleteError"
        :loading="deleting"
        :message="t('playlist.deleteMessage', { title: playlist.data.value.title })"
        :title="t('playlist.deleteTitle')"
        @confirm="removePlaylist"
      />
    </article>
  </PageState>
</template>

<script lang="ts" setup>
  import type { Playlist, PlaylistItem } from '@/types/api'
  import {
    duotoneFor,
    formatDate,
    formatNumber,
    MxButton,
    MxConfirmDialog,
    MxCover,
    MxDialog,
    MxEmptyState,
    MxIconButton,
    MxMosaic,
    MxPageHero,
    MxRating,
    MxStat,
    MxTextarea,
    relativeTime,
    toast,
    vTilt,
    yearOf,
  } from '@pedrolucaslopes/mixtape-ui'
  import { computed, ref, useId, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import PageState from '@/components/PageState.vue'
  import PlaylistFormDialog from '@/components/PlaylistFormDialog.vue'
  import { useAsyncData } from '@/composables/useAsyncData'
  import { useCatalogCards } from '@/composables/useCatalogCards'
  import { useSeo } from '@/composables/useSeo'
  import { PLAYLIST_RENDER_STEP, REVIEW_PREVIEW_LENGTH } from '@/constants/api'
  import { MAX_PLAYLIST_NOTE_LENGTH } from '@/constants/validation'
  import { ROUTE } from '@/router/routes'
  import { errorMessage } from '@/services/http'
  import { playlistsApi } from '@/services/mixtape'
  import { useSessionStore } from '@/stores/session'
  import { useShareStore } from '@/stores/share'
  import { itemRoute, profileRoute, reviewRoute } from '@/utils/items'

  const props = defineProps<{ id: string }>()

  const { t, locale } = useI18n()
  const router = useRouter()
  const cards = useCatalogCards()
  const session = useSessionStore()
  const share = useShareStore()
  const noteFormId = useId()

  const playlist = useAsyncData(() => playlistsApi.get(props.id), { watch: () => [props.id, session.isAuthenticated] })

  const renderCount = ref(PLAYLIST_RENDER_STEP)
  const visibleItems = computed(() => (playlist.data.value?.items ?? []).slice(0, renderCount.value))
  const hiddenCount = computed(() => Math.max(0, (playlist.data.value?.items.length ?? 0) - renderCount.value))

  watch(() => props.id, () => {
    renderCount.value = PLAYLIST_RENDER_STEP
  })

  const duotone = computed(() => duotoneFor(props.id))
  const isOwner = computed(() => Boolean(session.user && playlist.data.value?.owner.id === session.user.id))

  const busy = ref(false)
  const editing = ref(false)
  const noteOpen = ref(false)
  const noteDraft = ref('')
  const noteTarget = ref<PlaylistItem | null>(null)
  const noteError = ref<string | null>(null)
  const confirmingDelete = ref(false)
  const deleting = ref(false)
  const deleteError = ref<string | null>(null)

  const kindCounts = computed(() => {
    const counts = new Map<string, number>()
    for (const entry of playlist.data.value?.items ?? []) counts.set(entry.kind, (counts.get(entry.kind) ?? 0) + 1)
    return [...counts.entries()].map(([kind, count]) => ({ kind, count }))
  })

  const excerpt = (body: string) => (body.length > REVIEW_PREVIEW_LENGTH ? `${body.slice(0, REVIEW_PREVIEW_LENGTH).trimEnd()}…` : body)

  function apply (next: Playlist): void {
    playlist.data.value = next
  }

  async function run (task: () => Promise<Playlist>): Promise<boolean> {
    busy.value = true
    try {
      apply(await task())
      return true
    } catch (error) {
      toast.error(errorMessage(error))
      return false
    } finally {
      busy.value = false
    }
  }

  function move (entry: PlaylistItem, delta: -1 | 1): void {
    void run(() => playlistsApi.updateItem(props.id, entry.id, { position: entry.position + delta }))
  }

  function openNote (entry: PlaylistItem): void {
    noteTarget.value = entry
    noteDraft.value = entry.note ?? ''
    noteError.value = null
    noteOpen.value = true
  }

  async function saveNote (): Promise<void> {
    const target = noteTarget.value
    if (!target) return
    busy.value = true
    noteError.value = null
    try {
      apply(await playlistsApi.updateItem(props.id, target.id, { note: noteDraft.value.trim() || null }))
      noteOpen.value = false
      toast.success(t('playlist.noteSaved'))
    } catch (error) {
      noteError.value = errorMessage(error)
    } finally {
      busy.value = false
    }
  }

  async function removeItem (entry: PlaylistItem): Promise<void> {
    const label = entry.review ? entry.review.item.title : (entry.item?.title ?? t('playlist.unavailable'))
    const removed = await run(() => playlistsApi.removeItem(props.id, entry.id))
    if (!removed) return
    const refId = entry.review?.id ?? entry.item?.id
    toast.success(t('playlist.itemRemoved', { title: label }), refId
      ? {
        action: {
          label: t('common.undo'),
          handler: () => void run(async () => {
            const restored = await playlistsApi.addItem(props.id, entry.kind, refId, entry.note)
            const added = restored.items.at(-1)
            return added && added.position !== entry.position
              ? playlistsApi.updateItem(props.id, added.id, { position: entry.position })
              : restored
          }),
        },
      }
      : undefined)
  }

  function saved (next: Playlist): void {
    apply(next)
    toast.success(t('playlist.saved'))
  }

  function sharePlaylist (): void {
    void share.start({ kind: 'playlist', id: props.id }, t('playlist.shareTitle'))
  }

  async function removePlaylist (): Promise<void> {
    deleting.value = true
    deleteError.value = null
    try {
      await playlistsApi.remove(props.id)
      confirmingDelete.value = false
      toast.success(t('playlist.deleted'))
      await router.replace(session.username ? { name: ROUTE.userPlaylists, params: { username: session.username } } : { name: ROUTE.playlists })
    } catch (error) {
      deleteError.value = errorMessage(error)
    } finally {
      deleting.value = false
    }
  }

  useSeo(() => {
    const value = playlist.data.value
    if (!value) return { title: playlist.notFound.value ? t('playlist.notFound') : t('playlist.loading'), noindex: true }
    return {
      title: value.title,
      description: value.description ?? t('playlist.seoDescription', { username: value.owner.username, count: value.itemsCount }),
      image: value.coverUrls[0] ?? null,
      noindex: value.visibility === 'PRIVATE',
    }
  })
</script>

<style scoped>
.playlist__description {
  margin: 0 0 12px;
  white-space: pre-line;
}

.playlist__items {
  display: grid;
  gap: 16px;
}

.playlist__hint {
  margin: 0;
  font-size: 0.875rem;
}

.playlist__more {
  justify-self: center;
}

.playlist__list {
  position: relative;
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.playlist-item {
  display: grid;
  grid-template-columns: 3ch 72px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  padding: 14px;
  background: var(--mx-surface);
  border-radius: var(--mx-radius-lg);
}

@media (min-width: 840px) {
  .playlist-item {
    grid-template-columns: 3ch 72px minmax(0, 1fr) minmax(200px, 0.6fr);
    align-items: center;
  }
}

.playlist-item__position {
  font-family: var(--mx-font-display);
  font-size: 2rem;
  font-weight: 800;
  font-stretch: 78%;
  line-height: 1;
  text-align: end;
  color: var(--mx-primary);
}

.playlist-item__body {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.playlist-item__body--missing {
  grid-column: span 2;
}

.playlist-item__kind {
  margin: 0;
  font-size: var(--mx-text-overline);
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--mx-link);
}

.playlist-item__title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 800;
  line-height: 1.3;
}

.playlist-item__title a {
  color: inherit;
  text-decoration: none;
}

.playlist-item__title a:hover {
  text-decoration: underline;
}

.playlist-item__title a:focus-visible {
  outline: 3px solid var(--mx-focus);
  outline-offset: 2px;
  border-radius: 4px;
}

.playlist-item__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
  margin: 0;
  font-size: 0.875rem;
  color: var(--mx-on-surface-muted);
}

.playlist-item__excerpt {
  margin: 4px 0 0;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.playlist-item__side {
  display: grid;
  gap: 6px;
  grid-column: 2 / -1;
}

@media (min-width: 840px) {
  .playlist-item__side {
    grid-column: auto;
    justify-items: end;
    text-align: end;
  }
}

.playlist-item__note {
  display: flex;
  gap: 6px;
  margin: 0;
  font-size: 0.9375rem;
  font-style: italic;
  line-height: 1.45;
}

.playlist-item__added {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--mx-on-surface-muted);
}

.playlist-item__actions {
  display: flex;
  gap: 2px;
}

.playlist-item-move,
.playlist-item-enter-active,
.playlist-item-leave-active {
  transition:
    transform var(--mx-spring-smooth-duration) var(--mx-spring-smooth),
    opacity var(--mx-duration-normal) var(--mx-ease-out);
}

.playlist-item-enter-from,
.playlist-item-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

.playlist-item-leave-active {
  position: absolute;
  width: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .playlist-item-move,
  .playlist-item-enter-active,
  .playlist-item-leave-active {
    transition: none;
  }
}
</style>
