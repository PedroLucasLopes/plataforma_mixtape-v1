<template>
  <MxDialog
    v-model="composer.open"
    data-testid="review-composer"
    :description="subtitle"
    :persistent="composer.saving"
    :title="composer.existing ? t('composer.editTitle', { title: target?.title }) : t('composer.title', { title: target?.title })"
  >
    <div v-if="composer.loading" class="composer__loading">
      <MxSkeleton height="64px" />
      <MxSkeleton height="140px" />
    </div>

    <form
      v-else
      id="review-composer"
      class="composer"
      data-testid="review-composer-form"
      @submit.prevent="submit"
    >
      <div class="composer__item">
        <MxCover :seed="target?.id" size="72px" :src="target?.cover" :title="target?.title" />

        <div>
          <p class="composer__item-title">{{ target?.title }}</p>
          <p class="composer__item-meta">{{ [target?.artist, target?.year].filter(Boolean).join(' · ') }}</p>
        </div>
      </div>

      <div v-if="composer.groupReview" class="composer__galera" :class="{ 'composer__galera--blocked': composer.blockedByOtherGroup }">
        <span class="composer__galera-flag">
          <VIcon aria-hidden="true" icon="mdi-account-group" size="16" />
          {{ t('composer.galera.flag', { group: composer.groupReview.groupName }) }}
        </span>

        <p>{{ galeraNotice }}</p>
      </div>

      <p v-else-if="composer.existing?.groupReview" class="composer__note">
        <VIcon aria-hidden="true" icon="mdi-account-group" size="16" />
        {{ t('composer.inGroupReview', { group: composer.existing.groupReview.group.name }) }}
      </p>

      <MxRatingInput v-model="rating" data-testid="review-composer-rating" :label="t('composer.ratingLabel')" />

      <MxTextarea
        v-model="body"
        data-testid="review-composer-body"
        :hint="writtenHint"
        :label="t('composer.bodyLabel')"
        :maxlength="MAX_REVIEW_BODY_LENGTH"
        :placeholder="t('composer.bodyPlaceholder')"
      />

      <p v-if="composer.error" class="composer__error" role="alert">
        <VIcon aria-hidden="true" icon="mdi-alert-circle" size="18" />
        {{ composer.error }}
      </p>
    </form>

    <template #actions>
      <MxButton
        v-if="composer.existing"
        class="composer__delete"
        data-testid="review-composer-delete"
        :disabled="composer.saving"
        icon="mdi-delete-outline"
        :label="t('composer.delete')"
        variant="ghost"
        @click="confirmDelete = true"
      />

      <MxButton
        data-testid="review-composer-cancel"
        :disabled="composer.saving"
        :label="t('common.cancel')"
        variant="ghost"
        @click="composer.open = false"
      />

      <MxButton
        data-testid="review-composer-submit"
        :disabled="rating === null || composer.blockedByOtherGroup"
        form="review-composer"
        icon="mdi-album"
        :label="composer.existing ? t('composer.update') : t('composer.publish')"
        :loading="composer.saving"
        type="submit"
      />
    </template>
  </MxDialog>

  <MxConfirmDialog
    v-model="confirmDelete"
    :confirm-label="t('composer.delete')"
    data-testid="review-composer-delete-confirm"
    destructive
    :error="composer.error"
    :loading="composer.saving"
    :message="t('composer.deleteMessage')"
    :title="t('composer.deleteTitle')"
    @confirm="remove"
  />
</template>

<script lang="ts" setup>
  import { MxButton, MxConfirmDialog, MxCover, MxDialog, MxRatingInput, MxSkeleton, MxTextarea } from '@pedrolucaslopes/mixtape-ui'
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { MAX_REVIEW_BODY_LENGTH } from '@/constants/validation'
  import { useComposerStore } from '@/stores/composer'
  import { useRulesStore } from '@/stores/rules'

  const { t } = useI18n()
  const composer = useComposerStore()
  const rules = useRulesStore()

  const rating = ref<number | null>(null)
  const body = ref('')
  const confirmDelete = ref(false)

  const target = computed(() => composer.target)
  const subtitle = computed(() => t(target.value?.type === 'TRACK' ? 'composer.trackSubtitle' : 'composer.albumSubtitle'))

  const galeraNotice = computed(() => {
    const context = composer.groupReview
    const existing = composer.existing
    if (!context) return ''
    if (composer.blockedByOtherGroup && existing?.groupReview) return t('composer.galera.blocked', { group: existing.groupReview.group.name })
    if (existing && !existing.groupReview) return t(context.isPublic ? 'composer.galera.bringPublic' : 'composer.galera.bringPrivate')
    return t(context.isPublic ? 'composer.galera.public' : 'composer.galera.private')
  })

  const writtenHint = computed(() => {
    const minimum = rules.writtenReviewMinLength
    const length = body.value.trim().length
    if (!minimum) return undefined
    return length >= minimum ? t('composer.writtenReady') : t('composer.writtenHint', { count: minimum - length, minimum })
  })

  watch(() => [composer.open, composer.existing, composer.loading] as const, ([open, existing, loading]) => {
    if (!open || loading) return
    rating.value = existing?.rating ?? null
    body.value = existing?.body ?? ''
  }, { immediate: true })

  watch(() => composer.open, open => {
    if (open) void rules.load()
  }, { immediate: true })

  async function submit (): Promise<void> {
    if (rating.value === null) return
    const text = body.value.trim()
    await composer.save(rating.value, text.length > 0 ? text : null)
  }

  async function remove (): Promise<void> {
    if (await composer.remove()) confirmDelete.value = false
  }
</script>

<style scoped>
.composer {
  display: grid;
  gap: 22px;
}

.composer__loading {
  display: grid;
  gap: 16px;
}

.composer__item {
  display: flex;
  align-items: center;
  gap: 14px;
}

.composer__item-title,
.composer__item-meta {
  margin: 0;
}

.composer__item-title {
  font-family: var(--mx-font-display);
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.15;
}

.composer__item-meta {
  color: var(--mx-on-surface-muted);
}

.composer__error {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin: 0;
  padding: 10px 12px;
  font-weight: 600;
  background: color-mix(in srgb, var(--mx-error) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--mx-error) 45%, transparent);
  border-radius: var(--mx-radius-sm);
}

.composer__galera {
  display: grid;
  gap: 8px;
  padding: 12px 14px;
  background: var(--mx-surface-variant);
  border-radius: var(--mx-radius-md);
}

.composer__galera p {
  margin: 0;
  font-weight: 600;
  line-height: 1.5;
}

.composer__galera--blocked {
  background: color-mix(in srgb, var(--mx-error) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--mx-error) 45%, transparent);
}

.composer__galera-flag {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  gap: 6px;
  min-height: 28px;
  padding: 0 12px;
  font-size: 0.75rem;
  font-weight: 900;
  color: var(--mx-on-cta);
  background: var(--mx-cta);
  border-radius: var(--mx-radius-pill);
}

.composer__note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  font-weight: 600;
  color: var(--mx-on-surface-muted);
}

.composer__delete {
  margin-inline-end: auto;
  color: var(--mx-error);
}
</style>
