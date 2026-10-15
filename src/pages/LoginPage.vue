<template>
  <div class="auth-page" data-testid="page-login">
    <header class="auth-page__header">
      <p class="auth-page__eyebrow">{{ t('auth.loginEyebrow') }}</p>
      <h1 class="auth-page__title mx-display">{{ t('auth.loginTitle') }}</h1>
      <p class="auth-page__lead">{{ t('auth.loginLead') }}</p>
    </header>

    <form class="form-grid" data-testid="page-login-form" novalidate @submit.prevent="submit">
      <MxTextField
        v-model="login"
        autocomplete="username"
        autofocus
        data-testid="page-login-login"
        :error-messages="fieldErrors.login"
        :label="t('auth.loginField')"
        :maxlength="EMAIL_MAX_LENGTH"
        name="login"
        prepend-icon="mdi-account-outline"
        required
        @blur="touched.login = true"
      />

      <MxPasswordField
        v-model="password"
        autocomplete="current-password"
        data-testid="page-login-password"
        :error-messages="fieldErrors.password"
        :label="t('auth.password')"
        :maxlength="PASSWORD_LENGTH.max"
        name="password"
      />

      <RouterLink class="link-strong auth-page__forgot" data-testid="page-login-forgot" :to="forgotTarget">{{ t('auth.forgotLink') }}</RouterLink>

      <p v-if="error" class="form-error" data-testid="page-login-error" role="alert">{{ error }}</p>

      <MxButton
        block
        data-testid="page-login-submit"
        icon="mdi-login"
        :label="t('auth.signIn')"
        :loading="submitting"
        size="lg"
        type="submit"
      />
    </form>

    <p class="auth-page__switch">
      {{ t('auth.noAccount') }}
      <RouterLink class="link-strong" data-testid="page-login-register-link" :to="registerTarget">{{ t('auth.createAccount') }}</RouterLink>
    </p>

    <p class="auth-page__note">
      <VIcon aria-hidden="true" icon="mdi-shield-lock-outline" size="18" />
      {{ t('auth.forgotNote') }}
    </p>
  </div>
</template>

<script lang="ts" setup>
  import { MxButton, MxPasswordField, MxTextField, toast } from '@pedrolucaslopes/mixtape-ui'
  import { computed, reactive, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import { useSeo } from '@/composables/useSeo'
  import { EMAIL_MAX_LENGTH, EMAIL_PATTERN, PASSWORD_LENGTH } from '@/constants/validation'
  import { ROUTE } from '@/router/routes'
  import { errorMessage } from '@/services/http'
  import { useSessionStore } from '@/stores/session'
  import { safeRedirect } from '@/utils/navigation'

  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const session = useSessionStore()

  const login = ref('')
  const password = ref('')
  const submitting = ref(false)
  const attempted = ref(false)
  const error = ref<string | null>(null)
  const touched = reactive({ login: false })

  const redirect = computed(() => safeRedirect(route.query.redirect))
  const registerTarget = computed(() => ({ name: ROUTE.register, query: redirect.value ? { redirect: redirect.value } : {} }))

  const forgotTarget = computed(() => {
    const typed = login.value.trim().toLowerCase()
    return { name: ROUTE.forgotPassword, state: EMAIL_PATTERN.test(typed) ? { email: typed } : {} }
  })

  const fieldErrors = computed(() => ({
    login: (attempted.value || touched.login) && !login.value.trim() ? t('auth.errors.loginRequired') : undefined,
    password: attempted.value && !password.value ? t('auth.errors.passwordRequired') : undefined,
  }))

  useSeo(() => ({ title: t('auth.signIn'), description: t('auth.loginLead'), noindex: true }))

  async function submit (): Promise<void> {
    attempted.value = true
    error.value = null
    if (fieldErrors.value.login || fieldErrors.value.password) return
    submitting.value = true
    try {
      await session.login(login.value.trim(), password.value)
      toast.success(t('auth.welcomeBack', { name: session.user?.fullName ?? '' }))
      await router.replace(redirect.value ?? { name: ROUTE.home })
    } catch (error_) {
      error.value = errorMessage(error_)
      password.value = ''
    } finally {
      submitting.value = false
    }
  }
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

.auth-page__switch {
  margin: 0;
  text-align: center;
}

.auth-page__forgot {
  justify-self: end;
  margin-top: -10px;
  font-size: 0.875rem;
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
