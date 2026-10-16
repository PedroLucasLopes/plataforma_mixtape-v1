<template>
  <div class="auth-page" data-testid="page-reset-password">
    <MxLoader v-if="state === 'checking'" :label="t('auth.reset.checking')" :size="56" />

    <template v-else-if="state === 'invalid'">
      <header class="auth-page__header">
        <p class="auth-page__eyebrow">{{ t('auth.forgot.eyebrow') }}</p>
        <h1 class="auth-page__title mx-display">{{ t('auth.reset.invalidTitle') }}</h1>
        <p class="auth-page__lead">{{ t('auth.reset.invalid') }}</p>
      </header>

      <MxButton
        block
        data-testid="page-reset-password-request-new"
        icon="mdi-email-fast-outline"
        :label="t('auth.reset.requestNew')"
        size="lg"
        :to="{ name: ROUTE.forgotPassword }"
      />
    </template>

    <MxErrorState v-else-if="state === 'error'" :description="error ?? undefined" :retrying="checking" @retry="check" />

    <template v-else-if="account">
      <header class="auth-page__header">
        <p class="auth-page__eyebrow">{{ t('auth.reset.eyebrow') }}</p>
        <h1 class="auth-page__title mx-display">{{ t('auth.reset.title') }}</h1>

        <p class="auth-page__account">
          <VIcon aria-hidden="true" icon="mdi-account-circle-outline" size="18" />
          {{ t('auth.reset.account', { username: account.username }) }}
        </p>

        <p class="auth-page__lead">{{ t('auth.reset.lead') }}</p>
      </header>

      <form class="form-grid" data-testid="page-reset-password-form" novalidate @submit.prevent="submit">
        <input
          aria-hidden="true"
          autocomplete="username"
          class="mx-sr-only"
          data-testid="page-reset-password-username"
          readonly
          tabindex="-1"
          type="text"
          :value="account.email"
        >

        <MxPasswordField
          v-model="password"
          autocomplete="new-password"
          data-testid="page-reset-password-new-password"
          :error-messages="errors.password"
          :label="t('auth.reset.newPassword')"
          :maxlength="PASSWORD_LENGTH.max"
          name="new-password"
          :rules="passwordRules"
          show-strength
        />

        <MxPasswordField
          v-model="confirmation"
          autocomplete="new-password"
          data-testid="page-reset-password-confirm"
          :error-messages="errors.confirmation"
          :label="t('auth.reset.confirm')"
          :maxlength="PASSWORD_LENGTH.max"
          name="confirm-password"
          @blur="confirmationTouched = true"
        />

        <p v-if="error" class="form-error" data-testid="page-reset-password-error" role="alert">{{ error }}</p>

        <MxButton
          block
          data-testid="page-reset-password-submit"
          icon="mdi-lock-reset"
          :label="t('auth.reset.submit')"
          :loading="saving"
          size="lg"
          type="submit"
        />
      </form>
    </template>

    <p class="auth-page__switch">
      <RouterLink class="link-strong" data-testid="page-reset-password-login-link" :to="{ name: ROUTE.login }">{{ t('auth.forgot.back') }}</RouterLink>
    </p>
  </div>
</template>

<script lang="ts" setup>
  import { MxButton, MxErrorState, MxLoader, MxPasswordField, toast } from '@pedrolucaslopes/mixtape-ui'
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import { usePasswordRules } from '@/composables/usePasswordRules'
  import { useSeo } from '@/composables/useSeo'
  import { PASSWORD_LENGTH } from '@/constants/validation'
  import { ROUTE } from '@/router/routes'
  import { ApiError, errorMessage } from '@/services/http'
  import { authApi } from '@/services/mixtape'
  import { useSessionStore } from '@/stores/session'
  import { ERROR_FIELDS } from '@/utils/forms'

  type State = 'checking' | 'invalid' | 'error' | 'form'

  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const session = useSessionStore()

  const token = new URLSearchParams(route.hash.replace(/^#/, '')).get('token')
  if (route.hash) {
    void router.replace({ name: ROUTE.resetPassword, hash: '' })
  }

  const state = ref<State>('checking')
  const checking = ref(false)
  const account = ref<{ username: string, email: string, fullName: string } | null>(null)
  const password = ref('')
  const confirmation = ref('')
  const confirmationTouched = ref(false)
  const attempted = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const serverPasswordError = ref<string | null>(null)

  watch(password, () => {
    serverPasswordError.value = null
  })

  const { rules: passwordRules, accepted } = usePasswordRules(password, () => ({
    email: account.value?.email ?? '',
    username: account.value?.username ?? '',
    fullName: account.value?.fullName ?? '',
  }))

  const errors = computed(() => {
    const typed = confirmation.value.length
    const showMismatch = typed > 0 && (attempted.value || confirmationTouched.value || typed >= password.value.length)
    return {
      password: serverPasswordError.value ?? (attempted.value && !accepted.value ? t('auth.errors.password') : undefined),
      confirmation: showMismatch && confirmation.value !== password.value
        ? t('auth.errors.passwordConfirmation')
        : (attempted.value && !typed ? t('auth.errors.passwordConfirmationRequired') : undefined),
    }
  })

  async function check (): Promise<void> {
    if (!token) {
      state.value = 'invalid'
      return
    }
    checking.value = true
    try {
      const result = await authApi.checkPasswordReset(token)
      if (result.valid && result.username && result.email) {
        account.value = { username: result.username, email: result.email, fullName: result.fullName ?? '' }
        state.value = 'form'
      } else {
        state.value = 'invalid'
      }
    } catch (error_) {
      error.value = errorMessage(error_)
      state.value = 'error'
    } finally {
      checking.value = false
    }
  }

  async function submit (): Promise<void> {
    attempted.value = true
    error.value = null
    if (!token || errors.value.password || errors.value.confirmation) {
      return
    }
    saving.value = true
    try {
      await authApi.resetPassword(token, password.value)
      if (session.user?.username === account.value?.username) {
        await session.logout()
      }
      toast.success(t('auth.reset.done'))
      await router.replace({ name: ROUTE.login })
    } catch (error_) {
      const code = error_ instanceof ApiError ? error_.code : null
      if (code === 'PASSWORD_RESET_INVALID') {
        state.value = 'invalid'
      } else if (code && ERROR_FIELDS[code] === 'password') {
        serverPasswordError.value = errorMessage(error_)
      } else {
        error.value = errorMessage(error_)
      }
    } finally {
      saving.value = false
    }
  }

  void check()

  useSeo(() => ({ title: t('auth.reset.title'), noindex: true }))
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
}

.auth-page__lead {
  margin: 0;
  line-height: 1.5;
  color: var(--mx-on-surface-muted);
}

.auth-page__account {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-self: start;
  margin: 4px 0 0;
  padding: 6px 12px;
  font-weight: 800;
  background: var(--mx-surface-variant);
  border-radius: var(--mx-radius-pill);
}

.auth-page__switch {
  margin: 0;
  text-align: center;
}
</style>
