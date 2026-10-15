<template>
  <div v-show="state !== 'off'" class="human-check" data-testid="human-check">
    <!-- O widget do Turnstile entra aqui; fica vazio (sem altura) a não ser que a Cloudflare peça interação. -->
    <div ref="container" class="human-check__widget" />

    <p v-if="state === 'error'" class="form-error" data-testid="human-check-error" role="alert">
      {{ t('auth.humanCheck.unavailable') }}
      <button class="link-strong human-check__retry" data-testid="human-check-retry" type="button" @click="controller.retry()">
        {{ t('auth.humanCheck.retry') }}
      </button>
    </p>
  </div>
</template>

<script lang="ts" setup>
  import type { HumanCheckAction } from '@/types/api'
  import { onBeforeUnmount, onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { HUMAN_CHECK } from '@/constants/api'
  import { currentLocale } from '@/plugins/i18n'
  import { HumanCheckController, type HumanCheckState } from '@/services/human-check'

  const props = defineProps<{ action: HumanCheckAction }>()

  const { t } = useI18n()
  const container = ref<HTMLElement | null>(null)
  const state = ref<HumanCheckState>('loading')
  const controller = new HumanCheckController(props.action, HUMAN_CHECK.languages[currentLocale()] ?? 'auto', next => {
    state.value = next
  })

  onMounted(() => {
    if (container.value) {
      void controller.mount(container.value)
    }
  })

  onBeforeUnmount(() => controller.destroy())

  /** `take()`: o token do próximo envio (nulo quando a prova está desligada). `reset()`: depois de um envio que falhou. */
  defineExpose({ take: () => controller.take(), reset: () => controller.reset() })
</script>

<style scoped>
.human-check {
  display: grid;
  gap: 8px;
}

.human-check__widget:empty {
  display: none;
}

.human-check__retry {
  margin-left: 4px;
  padding: 0;
  font: inherit;
  background: none;
  border: 0;
  cursor: pointer;
}
</style>
