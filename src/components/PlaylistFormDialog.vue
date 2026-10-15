<template>
  <MxDialog v-model="open" data-testid="playlist-form-dialog" :description="playlist ? t('playlists.form.editDescription') : t('playlists.form.createDescription')" :title="playlist ? t('playlists.form.editTitle') : t('playlists.form.createTitle')">
    <form
      :id="formId"
      class="form-grid"
      data-testid="playlist-form-dialog-form"
      novalidate
      @submit.prevent="submit"
    >
      <MxTextField
        v-model="title"
        autofocus
        counter
        data-testid="playlist-form-dialog-title"
        :error-messages="attempted && !titleValid ? t('playlists.form.titleError', PLAYLIST_TITLE_LENGTH) : undefined"
        :label="t('playlists.form.title')"
        :maxlength="PLAYLIST_TITLE_LENGTH.max"
        required
      />

      <MxTextarea
        v-model="description"
        data-testid="playlist-form-dialog-description"
        :label="t('playlists.form.description')"
        :maxlength="MAX_PLAYLIST_DESCRIPTION_LENGTH"
        :rows="3"
      />

      <div class="playlist-form__visibility">
        <MxSegmented
          v-model="visibility"
          block
          data-testid="playlist-form-dialog-visibility"
          :label="t('playlists.form.visibility')"
          :options="visibilityOptions"
        />

        <p class="muted">{{ visibility === 'PUBLIC' ? t('playlists.form.publicHint') : t('playlists.form.privateHint') }}</p>
      </div>

      <p v-if="error" class="form-error" data-testid="playlist-form-dialog-error" role="alert">{{ error }}</p>
    </form>

    <template #actions>
      <MxButton data-testid="playlist-form-dialog-cancel" :label="t('common.cancel')" variant="ghost" @click="open = false" />

      <MxButton
        data-testid="playlist-form-dialog-save"
        :form="formId"
        icon="mdi-check"
        :label="playlist ? t('common.save') : t('playlists.form.create')"
        :loading="saving"
        type="submit"
      />
    </template>
  </MxDialog>
</template>

<script lang="ts" setup>
  import type { Playlist, PlaylistSummary, PlaylistVisibility } from '@/types/api'
  import type { SegmentedOption } from '@pedrolucaslopes/mixtape-ui'
  import { MxButton, MxDialog, MxSegmented, MxTextarea, MxTextField } from '@pedrolucaslopes/mixtape-ui'
  import { computed, ref, useId, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { MAX_PLAYLIST_DESCRIPTION_LENGTH, PLAYLIST_TITLE_LENGTH } from '@/constants/validation'
  import { errorMessage } from '@/services/http'
  import { playlistsApi } from '@/services/mixtape'

  const open = defineModel<boolean>({ default: false })
  const props = defineProps<{ playlist?: Playlist | PlaylistSummary | null }>()
  const emit = defineEmits<{ saved: [playlist: Playlist] }>()

  const { t } = useI18n()
  const formId = useId()

  const title = ref('')
  const description = ref('')
  const visibility = ref<PlaylistVisibility>('PUBLIC')
  const saving = ref(false)
  const attempted = ref(false)
  const error = ref<string | null>(null)

  watch(open, value => {
    if (!value) return
    title.value = props.playlist?.title ?? ''
    description.value = props.playlist?.description ?? ''
    visibility.value = props.playlist?.visibility ?? 'PUBLIC'
    attempted.value = false
    error.value = null
  }, { immediate: true })

  const titleValid = computed(() => {
    const length = title.value.trim().length
    return length >= PLAYLIST_TITLE_LENGTH.min && length <= PLAYLIST_TITLE_LENGTH.max
  })

  const visibilityOptions = computed<SegmentedOption<PlaylistVisibility>[]>(() => [
    { value: 'PUBLIC', label: t('playlists.public'), icon: 'mdi-earth' },
    { value: 'PRIVATE', label: t('playlists.private'), icon: 'mdi-lock' },
  ])

  async function submit (): Promise<void> {
    attempted.value = true
    error.value = null
    if (!titleValid.value) return
    saving.value = true
    const input = { title: title.value.trim(), description: description.value.trim() || null, visibility: visibility.value }
    try {
      const saved = props.playlist ? await playlistsApi.update(props.playlist.id, input) : await playlistsApi.create(input)
      open.value = false
      emit('saved', saved)
    } catch (error_) {
      error.value = errorMessage(error_)
    } finally {
      saving.value = false
    }
  }
</script>

<style scoped>
.playlist-form__visibility {
  display: grid;
  gap: 8px;
}

.playlist-form__visibility p {
  margin: 0;
  font-size: 0.875rem;
}
</style>
