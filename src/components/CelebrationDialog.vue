<template>
  <MxDialog
    v-model="open"
    data-testid="celebration-dialog"
    :sheet-on-mobile="false"
    :title="t('celebration.title')"
    :width="460"
  >
    <div v-if="celebration" class="celebration">
      <div aria-hidden="true" class="celebration__stage">
        <MxStarburst
          class="celebration__burst"
          :color="'var(--mx-cta)'"
          :points="18"
          shape="sun"
          :size="260"
          spin
        />

        <MxDiscTier
          class="celebration__disc"
          :show-label="false"
          :size="168"
          spinning
          :tier="celebration.tier"
        />
      </div>

      <p class="celebration__tier mx-display">{{ labels.tierLabel(celebration.tier) }}</p>
      <p class="celebration__text">{{ t('celebration.text', { count: celebration.reviews }) }}</p>
    </div>

    <template #actions>
      <MxButton
        data-testid="celebration-dialog-profile"
        :label="t('celebration.profile')"
        :to="{ name: ROUTE.myProfile }"
        variant="ghost"
        @click="open = false"
      />

      <MxButton data-testid="celebration-dialog-continue" :label="t('celebration.continue')" @click="open = false" />
    </template>
  </MxDialog>
</template>

<script lang="ts" setup>
  import { MxButton, MxDialog, MxDiscTier, MxStarburst } from '@pedrolucaslopes/mixtape-ui'
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useLabels } from '@/composables/useLabels'
  import { ROUTE } from '@/router/routes'
  import { useComposerStore } from '@/stores/composer'

  const { t } = useI18n()
  const labels = useLabels()
  const composer = useComposerStore()

  const celebration = computed(() => composer.celebration)
  const open = computed({
    get: () => composer.celebration !== null,
    set: value => {
      if (!value) composer.celebration = null
    },
  })
</script>

<style scoped>
.celebration {
  display: grid;
  justify-items: center;
  gap: 8px;
  text-align: center;
}

.celebration__stage {
  position: relative;
  display: grid;
  place-items: center;
  width: 260px;
  height: 260px;
}

.celebration__burst {
  position: absolute;
  inset: 0;
  animation: mx-pop-in var(--mx-spring-pop-duration) var(--mx-spring-pop) both;
}

.celebration__disc {
  position: relative;
  animation: mx-pop-in var(--mx-spring-pop-duration) var(--mx-spring-pop) 200ms both;
}

.celebration__tier {
  margin: 0;
  font-size: clamp(2rem, 6vw, 2.75rem);
}

.celebration__text {
  max-width: 34ch;
  margin: 0;
  line-height: 1.5;
  color: var(--mx-on-surface-muted);
}

@media (prefers-reduced-motion: reduce) {
  .celebration__burst,
  .celebration__disc {
    animation: none;
  }
}
</style>
