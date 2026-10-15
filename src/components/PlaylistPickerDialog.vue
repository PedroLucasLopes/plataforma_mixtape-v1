<template>
  <MxDialog
    v-model="picker.open"
    data-testid="playlist-picker-dialog"
    :description="picker.target?.label"
    :persistent="picker.saving"
    :title="t('picker.title')"
  >
    <div class="picker">
      <div v-if="picker.loading" class="picker__list">
        <MxSkeleton v-for="index in 3" :key="index" height="64px" />
      </div>

      <template v-else>
        <ul v-if="picker.playlists.length > 0" :aria-label="t('picker.yours')" class="picker__list">
          <li v-for="playlist in picker.playlists" :key="playlist.id">
            <button
              class="picker__option"
              data-testid="playlist-picker-dialog-option"
              :disabled="picker.saving"
              type="button"
              @click="picker.add(playlist, note.trim() || null)"
            >
              <MxMosaic :covers="playlist.coverUrls" :seed="playlist.id" size="48px" />

              <span class="picker__option-text">
                <span class="picker__option-title">{{ playlist.title }}</span>

                <span class="picker__option-meta">
                  {{ t('playlists.items', { count: playlist.itemsCount }) }} ·
                  {{ playlist.visibility === 'PUBLIC' ? t('playlists.public') : t('playlists.private') }}
                </span>
              </span>

              <VIcon aria-hidden="true" icon="mdi-plus-circle-outline" />
            </button>
          </li>
        </ul>

        <p v-else class="picker__empty">{{ t('picker.empty') }}</p>

        <MxTextField
          v-model="note"
          data-testid="playlist-picker-dialog-note"
          :hint="t('picker.noteHint')"
          :label="t('picker.note')"
          :maxlength="MAX_PLAYLIST_NOTE_LENGTH"
        />

        <form class="picker__create" data-testid="playlist-picker-dialog-create-form" @submit.prevent="create">
          <p class="picker__create-title">{{ t('picker.create') }}</p>
          <MxTextField v-model="title" data-testid="playlist-picker-dialog-title" :label="t('playlists.titleLabel')" :maxlength="PLAYLIST_TITLE_LENGTH.max" />

          <MxSegmented
            v-model="visibility"
            data-testid="playlist-picker-dialog-visibility"
            :label="t('playlists.visibility')"
            :options="visibilityOptions"
            size="sm"
          />

          <MxButton
            data-testid="playlist-picker-dialog-create-and-add"
            :disabled="!title.trim()"
            icon="mdi-playlist-plus"
            :label="t('picker.createAndAdd')"
            :loading="picker.saving"
            type="submit"
            variant="tonal"
          />
        </form>

        <p v-if="picker.error" class="picker__error" role="alert">{{ picker.error }}</p>
      </template>
    </div>
  </MxDialog>
</template>

<script lang="ts" setup>
  import type { PlaylistVisibility } from '@/types/api'
  import { MxButton, MxDialog, MxMosaic, MxSegmented, MxSkeleton, MxTextField } from '@pedrolucaslopes/mixtape-ui'
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { MAX_PLAYLIST_NOTE_LENGTH, PLAYLIST_TITLE_LENGTH } from '@/constants/validation'
  import { usePlaylistPickerStore } from '@/stores/playlistPicker'

  const { t } = useI18n()
  const picker = usePlaylistPickerStore()

  const note = ref('')
  const title = ref('')
  const visibility = ref<PlaylistVisibility>('PUBLIC')

  const visibilityOptions = computed(() => [
    { value: 'PUBLIC' as const, label: t('playlists.public'), icon: 'mdi-earth' },
    { value: 'PRIVATE' as const, label: t('playlists.private'), icon: 'mdi-lock-outline' },
  ])

  watch(() => picker.open, open => {
    if (!open) return
    note.value = ''
    title.value = ''
    visibility.value = 'PUBLIC'
  })

  function create (): void {
    const value = title.value.trim()
    if (value) void picker.createAndAdd(value, visibility.value, note.value.trim() || null)
  }
</script>

<style scoped>
.picker {
  display: grid;
  gap: 18px;
}

.picker__list {
  display: grid;
  gap: 6px;
  max-height: 300px;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.picker__option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px;
  font: inherit;
  color: inherit;
  text-align: start;
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--mx-outline);
  border-radius: var(--mx-radius-md);
  transition: background-color var(--mx-duration-fast) var(--mx-ease-out), transform var(--mx-spring-bouncy-duration) var(--mx-spring-bouncy);
}

.picker__option:hover:not(:disabled) {
  background: var(--mx-surface-variant);
  transform: translateX(4px);
}

.picker__option:focus-visible {
  outline: 3px solid var(--mx-focus);
  outline-offset: 2px;
}

.picker__option-text {
  display: grid;
  flex: 1;
  min-width: 0;
}

.picker__option-title {
  overflow: hidden;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.picker__option-meta {
  font-size: 0.8125rem;
  color: var(--mx-on-surface-muted);
}

.picker__empty {
  margin: 0;
  color: var(--mx-on-surface-muted);
}

.picker__create {
  display: grid;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--mx-outline);
}

.picker__create-title {
  margin: 0;
  font-weight: 800;
}

.picker__error {
  margin: 0;
  padding: 10px 12px;
  font-weight: 600;
  background: color-mix(in srgb, var(--mx-error) 14%, transparent);
  border-radius: var(--mx-radius-sm);
}
</style>
