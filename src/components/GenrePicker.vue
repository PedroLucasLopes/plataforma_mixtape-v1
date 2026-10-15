<template>
  <VAutocomplete
    v-model="model"
    :chips="multiple"
    :clearable="!multiple"
    :closable-chips="multiple"
    :counter="multiple ? max : undefined"
    data-testid="genre-picker"
    :hint="hint"
    :items="genres.genres"
    :label="label"
    :loading="loading"
    :multiple="multiple"
    :no-data-text="t('genres.noData')"
    persistent-hint
    @update:model-value="limit"
  />
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useGenresStore } from '@/stores/genres'

  const model = defineModel<string[] | string | null>({ required: true })

  const props = withDefaults(defineProps<{ label: string, hint?: string, multiple?: boolean, max?: number }>(), {
    multiple: true,
    max: 10,
  })

  const { t } = useI18n()
  const genres = useGenresStore()
  const loading = ref(true)

  onMounted(async () => {
    await genres.load().catch(() => undefined)
    loading.value = false
  })

  function limit (value: unknown): void {
    if (props.multiple && Array.isArray(value) && value.length > props.max) {
      model.value = value.slice(0, props.max) as string[]
    }
  }
</script>
