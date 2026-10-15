<template>
  <MxDialog v-model="open" data-testid="group-form-dialog" :description="group ? t('groups.form.editDescription') : t('groups.form.createDescription')" :title="group ? t('groups.form.editTitle') : t('groups.form.createTitle')">
    <form
      :id="formId"
      class="form-grid"
      data-testid="group-form-dialog-form"
      novalidate
      @submit.prevent="submit"
    >
      <MxTextField
        v-model="name"
        autofocus
        counter
        data-testid="group-form-dialog-name"
        :error-messages="attempted && !nameValid ? t('groups.form.nameError', GROUP_NAME_LENGTH) : undefined"
        :label="t('groups.form.name')"
        :maxlength="GROUP_NAME_LENGTH.max"
        required
      />

      <MxTextarea
        v-model="description"
        data-testid="group-form-dialog-description"
        :label="t('groups.form.description')"
        :maxlength="MAX_GROUP_DESCRIPTION_LENGTH"
        :rows="3"
      />

      <div class="group-form__visibility">
        <MxSegmented
          v-model="visibility"
          block
          data-testid="group-form-dialog-visibility"
          :label="t('groups.form.visibilityLabel')"
          :options="visibilityOptions"
        />

        <p class="group-form__hint">{{ visibility === 'PUBLIC' ? t('groups.form.publicHint') : t('groups.form.privateHint') }}</p>
        <p v-if="exposing" class="group-form__warning" role="status">{{ t('groups.form.exposeWarning') }}</p>
      </div>

      <p v-if="error" class="form-error" data-testid="group-form-dialog-error" role="alert">{{ error }}</p>
    </form>

    <template #actions>
      <MxButton data-testid="group-form-dialog-cancel" :label="t('common.cancel')" variant="ghost" @click="open = false" />

      <MxButton
        data-testid="group-form-dialog-save"
        :form="formId"
        icon="mdi-check"
        :label="group ? t('common.save') : t('groups.form.create')"
        :loading="saving"
        type="submit"
      />
    </template>
  </MxDialog>
</template>

<script lang="ts" setup>
  import type { Group, GroupVisibility } from '@/types/api'
  import { MxButton, MxDialog, MxSegmented, MxTextarea, MxTextField, type SegmentedOption } from '@pedrolucaslopes/mixtape-ui'
  import { computed, ref, useId, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { GROUP_NAME_LENGTH, MAX_GROUP_DESCRIPTION_LENGTH } from '@/constants/validation'
  import { errorMessage } from '@/services/http'
  import { groupsApi } from '@/services/mixtape'

  const open = defineModel<boolean>({ default: false })
  const props = defineProps<{ group?: Group | null }>()
  const emit = defineEmits<{ saved: [group: Group] }>()

  const { t } = useI18n()
  const formId = useId()

  const name = ref('')
  const description = ref('')
  const visibility = ref<GroupVisibility>('PRIVATE')
  const saving = ref(false)
  const attempted = ref(false)
  const error = ref<string | null>(null)

  watch(open, value => {
    if (!value) return
    name.value = props.group?.name ?? ''
    description.value = props.group?.description ?? ''
    visibility.value = props.group?.visibility ?? 'PRIVATE'
    attempted.value = false
    error.value = null
  }, { immediate: true })

  const visibilityOptions = computed<SegmentedOption<GroupVisibility>[]>(() => [
    { value: 'PRIVATE', label: t('groups.visibility.private'), icon: 'mdi-lock-outline' },
    { value: 'PUBLIC', label: t('groups.visibility.public'), icon: 'mdi-earth' },
  ])

  // Abrir um grupo privado expõe as reviews da galera que já existem: o dono vê o aviso antes de salvar.
  const exposing = computed(() => props.group?.visibility === 'PRIVATE' && visibility.value === 'PUBLIC')

  const nameValid = computed(() => {
    const length = name.value.trim().length
    return length >= GROUP_NAME_LENGTH.min && length <= GROUP_NAME_LENGTH.max
  })

  async function submit (): Promise<void> {
    attempted.value = true
    error.value = null
    if (!nameValid.value) return
    saving.value = true
    try {
      const text = description.value.trim() || null
      const input = { name: name.value.trim(), description: text, visibility: visibility.value }
      const saved = props.group ? await groupsApi.update(props.group.id, input) : await groupsApi.create(input)
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
.group-form__visibility {
  display: grid;
  gap: 8px;
}

.group-form__hint,
.group-form__warning {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.group-form__hint {
  color: var(--mx-on-surface-muted);
}

.group-form__warning {
  padding: 10px 12px;
  font-weight: 700;
  background: color-mix(in srgb, var(--mx-warning) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--mx-warning) 45%, transparent);
  border-radius: var(--mx-radius-sm);
}
</style>
