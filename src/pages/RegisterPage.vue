<template>
  <div class="auth-page" data-testid="page-register">
    <header class="auth-page__header">
      <p class="auth-page__eyebrow">{{ t('auth.registerEyebrow') }}</p>
      <h1 class="auth-page__title mx-display">{{ t('auth.registerTitle') }}</h1>
      <p class="auth-page__lead">{{ t('auth.registerLead') }}</p>
    </header>

    <MxStepper
      v-model="step"
      data-testid="page-register-stepper"
      :label="t('auth.wizard.label')"
      :reachable="reachable"
      :steps="steps"
    >
      <template #account>
        <form class="form-grid" data-testid="page-register-account-form" novalidate @submit.prevent="next">
          <h2 class="register__title">{{ t('auth.wizard.accountTitle') }}</h2>

          <MxTextField
            v-model="form.email"
            autocomplete="email"
            data-testid="page-register-email"
            :error-messages="errors.email"
            inputmode="email"
            :label="t('auth.email')"
            :maxlength="EMAIL_MAX_LENGTH"
            name="email"
            prepend-icon="mdi-email-outline"
            required
            type="email"
            @blur="touched.email = true"
          />

          <MxTextField
            v-model="username"
            autocomplete="username"
            data-testid="page-register-username"
            :error-messages="errors.username"
            :hint="t('auth.usernameHint', { max: USERNAME_MAX_LENGTH })"
            :label="t('auth.username')"
            :maxlength="USERNAME_MAX_LENGTH"
            name="username"
            prefix="@"
            required
            @blur="touched.username = true"
          />

          <MxPasswordField
            v-model="form.password"
            autocomplete="new-password"
            data-testid="page-register-password"
            :error-messages="errors.password"
            :label="t('auth.createPassword')"
            :maxlength="PASSWORD_LENGTH.max"
            name="new-password"
            :rules="passwordRules"
            show-strength
          />

          <MxPasswordField
            v-model="form.passwordConfirmation"
            autocomplete="new-password"
            data-testid="page-register-confirm-password"
            :error-messages="errors.passwordConfirmation"
            :label="t('auth.confirmPassword')"
            :maxlength="PASSWORD_LENGTH.max"
            name="confirm-password"
            @blur="touched.passwordConfirmation = true"
          />

          <MxButton
            block
            data-testid="page-register-account-continue"
            icon="mdi-arrow-right"
            :label="t('auth.wizard.continue')"
            size="lg"
            type="submit"
          />
        </form>
      </template>

      <template #about>
        <form class="form-grid" data-testid="page-register-profile-form" novalidate @submit.prevent="next">
          <h2 class="register__title">{{ t('auth.wizard.aboutTitle') }}</h2>

          <MxTextField
            v-model="form.fullName"
            autocomplete="name"
            data-testid="page-register-full-name"
            :error-messages="errors.fullName"
            :label="t('auth.fullName')"
            :maxlength="FULL_NAME_LENGTH.max"
            name="name"
            prepend-icon="mdi-account-outline"
            required
            @blur="touched.fullName = true"
          />

          <MxTextField
            v-model="form.birthDate"
            autocomplete="bday"
            data-testid="page-register-birth-date"
            :error-messages="errors.birthDate"
            :hint="t('auth.birthDateHint', { age: DEFAULT_MIN_USER_AGE })"
            :label="t('auth.birthDate')"
            :max="latestBirthDate"
            :min="earliestBirthDate"
            name="bday"
            prepend-icon="mdi-cake-variant-outline"
            required
            type="date"
            @blur="touched.birthDate = true"
          />

          <div class="register__actions">
            <MxButton
              data-testid="page-register-profile-back"
              icon="mdi-arrow-left"
              :label="t('auth.wizard.back')"
              variant="ghost"
              @click="back"
            />

            <MxButton data-testid="page-register-profile-continue" icon="mdi-arrow-right" :label="t('auth.wizard.continue')" type="submit" />
          </div>
        </form>
      </template>

      <template #taste>
        <form class="form-grid" data-testid="page-register-taste-form" novalidate @submit.prevent="next">
          <div class="register__intro">
            <h2 class="register__title">{{ t('auth.wizard.tasteTitle') }}</h2>
            <p class="register__lead">{{ t('auth.wizard.tasteLead', { max: MAX_FAVORITE_GENRES }) }}</p>
          </div>

          <div v-if="showcaseFailed" class="register__notice" role="status">
            <p>{{ t('auth.wizard.tasteError') }}</p>

            <MxButton
              data-testid="page-register-taste-retry"
              icon="mdi-refresh"
              :label="t('auth.wizard.retry')"
              size="sm"
              variant="glass"
              @click="loadShowcase"
            />
          </div>

          <MxBalloonPicker
            v-else
            v-model="favoriteGenres"
            data-testid="page-register-taste"
            :label="t('auth.wizard.tasteLabel')"
            :loading="showcaseLoading"
            :max="MAX_FAVORITE_GENRES"
            :options="balloons"
            :skeleton-count="8"
          />

          <div class="register__actions">
            <MxButton
              data-testid="page-register-taste-back"
              icon="mdi-arrow-left"
              :label="t('auth.wizard.back')"
              variant="ghost"
              @click="back"
            />

            <MxButton
              data-testid="page-register-taste-continue"
              icon="mdi-arrow-right"
              :label="favoriteGenres.length > 0 ? t('auth.wizard.continue') : t('auth.wizard.skip')"
              type="submit"
              :variant="favoriteGenres.length > 0 ? 'cta' : 'glass'"
            />
          </div>
        </form>
      </template>

      <template #done>
        <form class="form-grid" data-testid="page-register-done-form" novalidate @submit.prevent="submit">
          <h2 class="register__title">{{ t('auth.wizard.doneTitle') }}</h2>

          <ul class="register__summary">
            <li v-for="group in summary" :key="group.key" class="register__group">
              <div class="register__group-text">
                <p class="register__group-label">{{ group.label }}</p>
                <p v-for="line in group.lines" :key="line" class="register__group-line">{{ line }}</p>

                <ul v-if="group.key === 'taste' && favoriteGenres.length > 0" :aria-label="t('auth.wizard.steps.taste')" class="register__chips">
                  <li v-for="genre in favoriteGenres" :key="genre">
                    <MxChip :duotone="duotoneFor(genre)" :label="genre" size="sm" variant="duotone" />
                  </li>
                </ul>
              </div>

              <MxButton
                :aria-label="t('auth.wizard.editStep', { step: group.label })"
                data-testid="page-register-edit-step"
                icon="mdi-pencil"
                :label="t('auth.wizard.edit')"
                size="sm"
                variant="ghost"
                @click="step = group.index"
              />
            </li>
          </ul>

          <p class="auth-page__consent">
            <i18n-t keypath="auth.consent" scope="global" tag="span">
              <template #terms>
                <RouterLink class="link-strong" data-testid="page-register-terms-link" target="_blank" :to="{ name: ROUTE.terms }">{{ t('nav.terms') }}</RouterLink>
              </template>

              <template #privacy>
                <RouterLink class="link-strong" data-testid="page-register-privacy-link" target="_blank" :to="{ name: ROUTE.privacy }">{{ t('nav.privacy') }}</RouterLink>
              </template>
            </i18n-t>
          </p>

          <HumanCheck ref="humanCheck" action="register" />

          <p v-if="error" class="form-error" data-testid="page-register-error" role="alert">{{ error }}</p>

          <MxButton
            block
            data-testid="page-register-submit"
            icon="mdi-account-plus"
            :label="t('auth.createAccount')"
            :loading="submitting"
            size="lg"
            type="submit"
          />
        </form>
      </template>
    </MxStepper>

    <p class="auth-page__switch">
      {{ t('auth.hasAccount') }}
      <RouterLink class="link-strong" data-testid="page-register-login-link" :to="{ name: ROUTE.login, query: route.query }">{{ t('auth.signIn') }}</RouterLink>
    </p>
  </div>
</template>

<script lang="ts" setup>
  import type { GenreShowcase } from '@/types/api'
  import type { BalloonOption, StepperStep } from '@pedrolucaslopes/mixtape-ui'
  import {
    duotoneFor,
    formatDate,
    MxBalloonPicker,
    MxButton,
    MxChip,
    MxPasswordField,
    MxStepper,
    MxTextField,
    toast,
  } from '@pedrolucaslopes/mixtape-ui'
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import HumanCheck from '@/components/HumanCheck.vue'
  import { usePasswordRules } from '@/composables/usePasswordRules'
  import { useSeo } from '@/composables/useSeo'
  import {
    DEFAULT_MIN_USER_AGE,
    EMAIL_MAX_LENGTH,
    FULL_NAME_LENGTH,
    MAX_AGE_YEARS,
    MAX_FAVORITE_GENRES,
    PASSWORD_LENGTH,
    USERNAME_MAX_LENGTH,
  } from '@/constants/validation'
  import { ROUTE } from '@/router/routes'
  import { ApiError, errorMessage } from '@/services/http'
  import { accountApi, catalogApi } from '@/services/mixtape'
  import { useSessionStore } from '@/stores/session'
  import {
    type AccountField,
    ageOn,
    ERROR_FIELDS,
    isoDateYearsAgo,
    isValidEmail,
    isValidFullName,
    isValidUsername,
    normalizeFullName,
    normalizeUsername,
  } from '@/utils/forms'
  import { safeRedirect } from '@/utils/navigation'

  type Field = AccountField | 'passwordConfirmation'
  type StepKey = 'account' | 'about' | 'taste' | 'done'

  const STEP_KEYS: readonly StepKey[] = ['account', 'about', 'taste', 'done']

  const STEP_FIELDS: Readonly<Record<StepKey, readonly Field[]>> = {
    account: ['email', 'username', 'password', 'passwordConfirmation'],
    about: ['fullName', 'birthDate'],
    taste: [],
    done: [],
  }

  const STEP_ICONS: Readonly<Record<StepKey, string>> = {
    account: 'mdi-account-outline',
    about: 'mdi-cake-variant-outline',
    taste: 'mdi-music-note',
    done: 'mdi-flag-checkered',
  }

  const { t, locale } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const session = useSessionStore()

  const step = ref(0)
  const humanCheck = ref<InstanceType<typeof HumanCheck> | null>(null)
  const reachable = ref(0)
  const form = reactive({ fullName: '', username: '', email: '', birthDate: '', password: '', passwordConfirmation: '' })
  const favoriteGenres = ref<string[]>([])
  const touched = reactive<Record<Field, boolean>>({
    fullName: false,
    username: false,
    email: false,
    birthDate: false,
    password: false,
    passwordConfirmation: false,
  })
  const attempted = reactive<Record<StepKey, boolean>>({ account: false, about: false, taste: false, done: false })
  const serverErrors = reactive<Partial<Record<Field, string>>>({})
  const submitting = ref(false)
  const error = ref<string | null>(null)

  const showcase = ref<GenreShowcase[]>([])
  const showcaseLoading = ref(true)
  const showcaseFailed = ref(false)

  const latestBirthDate = isoDateYearsAgo(DEFAULT_MIN_USER_AGE)
  const earliestBirthDate = isoDateYearsAgo(MAX_AGE_YEARS)

  const steps = computed<StepperStep[]>(() => STEP_KEYS.map(key => ({ key, label: t(`auth.wizard.steps.${key}`), icon: STEP_ICONS[key] })))

  const username = computed({
    get: () => form.username,
    set: value => {
      form.username = normalizeUsername(value)
    },
  })

  const { rules: passwordRules, accepted: passwordOk } = usePasswordRules(
    () => form.password,
    () => ({ email: form.email, username: form.username, fullName: form.fullName }),
  )

  const localErrors = computed<Record<Field, string | undefined>>(() => {
    const age = form.birthDate ? ageOn(form.birthDate) : null
    return {
      fullName: isValidFullName(form.fullName) ? undefined : t('auth.errors.fullName', FULL_NAME_LENGTH),
      username: isValidUsername(form.username) ? undefined : t('auth.errors.username'),
      email: isValidEmail(form.email) ? undefined : t('auth.errors.email'),
      birthDate: !form.birthDate || age === null
        ? t('auth.errors.birthDate')
        : (age < DEFAULT_MIN_USER_AGE ? t('errors.code.UNDERAGE', { minAge: DEFAULT_MIN_USER_AGE }) : undefined),
      password: passwordOk.value ? undefined : t('auth.errors.password'),
      passwordConfirmation: form.passwordConfirmation
        ? (form.passwordConfirmation === form.password ? undefined : t('auth.errors.passwordConfirmation'))
        : t('auth.errors.passwordConfirmationRequired'),
    }
  })

  function stepOf (field: Field): StepKey {
    return STEP_KEYS.find(key => STEP_FIELDS[key].includes(field)) ?? 'account'
  }

  function stepValid (key: StepKey): boolean {
    return STEP_FIELDS[key].every(field => !localErrors.value[field])
  }

  function confirmationVisible (): boolean {
    const typed = form.passwordConfirmation.length
    return typed > 0 && (touched.passwordConfirmation || typed >= form.password.length)
  }

  const errors = computed(() => {
    const visible = (field: Field) => {
      if (attempted[stepOf(field)]) return true
      if (field === 'password') return false
      if (field === 'passwordConfirmation') return confirmationVisible()
      return touched[field]
    }
    return Object.fromEntries((Object.keys(localErrors.value) as Field[]).map(field => [
      field,
      serverErrors[field] ?? (visible(field) ? localErrors.value[field] : undefined),
    ])) as Record<Field, string | undefined>
  })

  watch(() => ({ ...form }), (next, previous) => {
    for (const field of Object.keys(next) as Field[]) {
      if (next[field] !== previous[field]) delete serverErrors[field]
    }
  })

  const balloons = computed<BalloonOption[]>(() => showcase.value.map(entry => ({
    value: entry.genre,
    label: entry.genre,
    images: entry.albums.flatMap(album => (album.cover ? [album.cover.small] : [])),
  })))

  const summary = computed(() => [
    { key: 'account', index: 0, label: t('auth.wizard.steps.account'), lines: [form.email.trim().toLowerCase(), `@${form.username}`] },
    {
      key: 'about',
      index: 1,
      label: t('auth.wizard.steps.about'),
      lines: [normalizeFullName(form.fullName), form.birthDate ? formatDate(form.birthDate, locale.value, { dateStyle: 'long', timeZone: 'UTC' }) : ''],
    },
    { key: 'taste', index: 2, label: t('auth.wizard.steps.taste'), lines: favoriteGenres.value.length > 0 ? [] : [t('auth.wizard.noGenres')] },
  ])

  useSeo(() => ({ title: t('auth.signUp'), description: t('auth.registerLead'), noindex: true }))

  async function loadShowcase (): Promise<void> {
    showcaseLoading.value = true
    showcaseFailed.value = false
    try {
      showcase.value = await catalogApi.genreShowcase()
    } catch {
      showcaseFailed.value = true
    } finally {
      showcaseLoading.value = false
    }
  }

  onMounted(loadShowcase)

  function next (): void {
    const key = STEP_KEYS[step.value]
    if (!key) return
    attempted[key] = true
    if (!stepValid(key)) return
    step.value += 1
    reachable.value = Math.max(reachable.value, step.value)
  }

  function back (): void {
    step.value = Math.max(0, step.value - 1)
  }

  function clearServerErrors (): void {
    for (const key of Object.keys(serverErrors) as Field[]) delete serverErrors[key]
  }

  async function saveGenres (): Promise<void> {
    if (favoriteGenres.value.length === 0) return
    try {
      session.setAccount(await accountApi.updateProfile({ favoriteGenres: favoriteGenres.value }))
    } catch {
      toast.warning(t('auth.wizard.genresNotSaved'))
    }
  }

  async function submit (): Promise<void> {
    for (const key of STEP_KEYS) attempted[key] = true
    error.value = null
    clearServerErrors()
    const invalid = STEP_KEYS.findIndex(key => !stepValid(key))
    if (invalid !== -1) {
      step.value = invalid
      return
    }
    submitting.value = true
    try {
      const humanToken = await humanCheck.value?.take() ?? null
      await session.register({
        fullName: normalizeFullName(form.fullName),
        username: form.username,
        email: form.email.trim().toLowerCase(),
        birthDate: form.birthDate,
        password: form.password,
      }, humanToken)
    } catch (error_) {
      submitting.value = false
      humanCheck.value?.reset()
      const field = error_ instanceof ApiError && error_.code ? ERROR_FIELDS[error_.code] : undefined
      if (field) {
        serverErrors[field] = errorMessage(error_)
        step.value = STEP_KEYS.indexOf(stepOf(field))
      } else {
        error.value = errorMessage(error_)
      }
      return
    }
    await saveGenres()
    submitting.value = false
    toast.success(t('auth.welcome', { name: session.user?.fullName ?? '' }))
    await router.replace(safeRedirect(route.query.redirect) ?? { name: ROUTE.settings, query: { welcome: '1' } })
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

.auth-page__lead,
.auth-page__consent,
.register__lead {
  margin: 0;
  line-height: 1.5;
  color: var(--mx-on-surface-muted);
}

.auth-page__consent {
  font-size: 0.875rem;
}

.auth-page__switch {
  margin: 0;
  text-align: center;
}

.register__intro {
  display: grid;
  gap: 6px;
}

.register__title {
  margin: 0;
  font-family: var(--mx-font-display);
  font-size: 1.375rem;
  font-weight: 800;
  line-height: 1.1;
}

.register__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.register__notice {
  display: grid;
  justify-items: start;
  gap: 10px;
  padding: 14px 16px;
  background: color-mix(in srgb, var(--mx-on-surface) 6%, transparent);
  border-radius: var(--mx-radius-md);
}

.register__notice p {
  margin: 0;
  line-height: 1.5;
}

.register__summary {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.register__group {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: color-mix(in srgb, var(--mx-on-surface) 6%, transparent);
  border-radius: var(--mx-radius-md);
}

.register__group-text {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.register__group-label {
  margin: 0 0 4px;
  font-size: var(--mx-text-overline);
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--mx-link);
}

.register__group-line {
  margin: 0;
  font-weight: 650;
  overflow-wrap: anywhere;
}

.register__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
}
</style>
