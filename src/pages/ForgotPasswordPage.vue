<template>
  <div class="auth-page" data-testid="page-forgot-password">
    <header class="auth-page__header">
      <p class="auth-page__eyebrow">{{ t('auth.forgot.eyebrow') }}</p>

      <h1 ref="heading" class="auth-page__title mx-display" tabindex="-1">
        {{ sent ? t('auth.forgot.sentTitle') : t('auth.forgot.title') }}
      </h1>

      <p class="auth-page__lead">
        {{ sent ? t('auth.forgot.sent', { email: sent.email, minutes: sent.minutes }) : t('auth.forgot.lead') }}
      </p>
    </header>

    <form
      v-if="!sent"
      class="form-grid"
      data-testid="page-forgot-password-form"
      novalidate
      @submit.prevent="submit"
    >
      <MxTextField
        v-model="email"
        autocomplete="email"
        autofocus
        data-testid="page-forgot-password-email"
        :error-messages="emailError"
        inputmode="email"
        :label="t('auth.email')"
        :maxlength="EMAIL_MAX_LENGTH"
        name="email"
        prepend-icon="mdi-email-outline"
        required
        type="email"
        @blur="touched = true"
      />

      <p v-if="error" class="form-error" data-testid="page-forgot-password-error" role="alert">{{ error }}</p>

      <MxButton
        block
        data-testid="page-forgot-password-submit"
        icon="mdi-email-fast-outline"
        :label="t('auth.forgot.submit')"
        :loading="sending"
        size="lg"
        type="submit"
      />
    </form>

    <div v-else class="forgot__sent">
      <p class="auth-page__note">
        <VIcon aria-hidden="true" icon="mdi-email-search-outline" size="18" />
        {{ t('auth.forgot.spam') }}
      </p>

      <p v-if="error" class="form-error" data-testid="page-forgot-password-error" role="alert">{{ error }}</p>

      <MxButton
        block
        data-testid="page-forgot-password-resend"
        :disabled="countdown.remaining.value > 0"
        icon="mdi-email-fast-outline"
        :label="countdown.remaining.value > 0 ? t('auth.forgot.resendIn', { seconds: countdown.remaining.value }) : t('auth.forgot.resend')"
        :loading="sending"
        size="lg"
        variant="tonal"
        @click="send"
      />

      <MxButton
        block
        data-testid="page-forgot-password-other-email"
        icon="mdi-pencil-outline"
        :label="t('auth.forgot.otherEmail')"
        variant="ghost"
        @click="changeEmail"
      />
    </div>

    <p class="auth-page__switch">
      <RouterLink class="link-strong" data-testid="page-forgot-password-login-link" :to="{ name: ROUTE.login }">{{ t('auth.forgot.back') }}</RouterLink>
    </p>

    <p class="auth-page__note">
      <VIcon aria-hidden="true" icon="mdi-shield-lock-outline" size="18" />
      {{ t('auth.forgotNote') }}
    </p>
  </div>
</template>

<script lang="ts" setup>
  import { MxButton, MxTextField } from '@pedrolucaslopes/mixtape-ui'
  import { computed, nextTick, ref, useTemplateRef } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useCountdown } from '@/composables/useCountdown'
  import { useSeo } from '@/composables/useSeo'
  import { PASSWORD_RESET_RESEND_SECONDS } from '@/constants/api'
  import { EMAIL_MAX_LENGTH, EMAIL_PATTERN } from '@/constants/validation'
  import { ROUTE } from '@/router/routes'
  import { errorMessage } from '@/services/http'
  import { authApi } from '@/services/mixtape'

  const { t } = useI18n()
  const heading = useTemplateRef<HTMLElement>('heading')
  const countdown = useCountdown()

  const hinted = typeof window === 'undefined' ? null : (window.history.state as { email?: unknown } | null)?.email
  const email = ref(typeof hinted === 'string' ? hinted : '')
  const touched = ref(false)
  const attempted = ref(false)
  const sending = ref(false)
  const error = ref<string | null>(null)
  const sent = ref<{ email: string, minutes: number } | null>(null)

  const normalized = computed(() => email.value.trim().toLowerCase())

  const emailError = computed(() => {
    if (!attempted.value && !touched.value) {
      return undefined
    }
    return EMAIL_PATTERN.test(normalized.value) ? undefined : t('auth.errors.email')
  })

  async function send (): Promise<void> {
    sending.value = true
    error.value = null
    try {
      const { expiresInMinutes } = await authApi.requestPasswordReset(normalized.value)
      const first = sent.value === null
      sent.value = { email: normalized.value, minutes: expiresInMinutes }
      countdown.start(PASSWORD_RESET_RESEND_SECONDS)
      if (first) {
        await nextTick()
        heading.value?.focus()
      }
    } catch (error_) {
      error.value = errorMessage(error_)
    } finally {
      sending.value = false
    }
  }

  async function submit (): Promise<void> {
    attempted.value = true
    if (emailError.value) {
      return
    }
    await send()
  }

  function changeEmail (): void {
    sent.value = null
    error.value = null
    attempted.value = false
  }

  useSeo(() => ({ title: t('auth.forgot.title'), description: t('auth.forgot.lead'), noindex: true }))
</script>

<style scoped>
.auth-page {
  display: grid;
  gap: 22px;
}

.auth-page__header {
  display: grid;
  gap: 8px;
}

.auth-page__eyebrow {
  margin: 0;
  font-size: var(--mx-text-overline);
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--mx-link);
}

.auth-page__title {
  margin: 0;
  font-size: var(--mx-text-h1);
  outline: none;
}

.auth-page__lead {
  margin: 0;
  line-height: 1.5;
  color: var(--mx-on-surface-muted);
  overflow-wrap: anywhere;
}

.forgot__sent {
  display: grid;
  gap: 12px;
}

.auth-page__switch {
  margin: 0;
  text-align: center;
}

.auth-page__note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--mx-on-surface-muted);
}
</style>
