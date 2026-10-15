<template>
  <div class="page page--narrow settings" data-testid="page-settings">
    <header class="page-header">
      <p class="page-header__eyebrow">{{ t('settings.eyebrow') }}</p>
      <h1 class="page-header__title">{{ t('settings.title') }}</h1>
      <p class="page-header__lead">{{ t('settings.lead') }}</p>
    </header>

    <MxGlass v-if="welcome" class="settings__welcome" tint="cta" variant="panel">
      <VIcon aria-hidden="true" icon="mdi-party-popper" size="28" />

      <div>
        <h2 class="panel-title">{{ t('settings.welcomeTitle', { name: firstName }) }}</h2>
        <p>{{ t('settings.welcomeText') }}</p>
      </div>
    </MxGlass>

    <MxGlass aria-labelledby="settings-profile" class="panel-stack" tag="section" variant="panel">
      <div class="settings__profile-head">
        <MxAvatar
          :name="form.fullName || session.user?.fullName || '?'"
          :seed="session.user?.username"
          :size="72"
          :src="avatarPreview"
          :tier="null"
        />

        <div>
          <h2 id="settings-profile" class="panel-title">{{ t('settings.profile') }}</h2>
          <p class="muted">{{ t('settings.profileHint') }}</p>
        </div>
      </div>

      <form class="form-grid" data-testid="page-settings-form" novalidate @submit.prevent="saveProfile">
        <MxTextField
          v-model="form.fullName"
          autocomplete="name"
          data-testid="page-settings-full-name"
          :error-messages="errors.fullName"
          :label="t('auth.fullName')"
          :maxlength="FULL_NAME_LENGTH.max"
          required
        />

        <MxTextarea
          v-model="form.bio"
          data-testid="page-settings-bio"
          :hint="t('settings.bioHint')"
          :label="t('settings.bio')"
          :maxlength="MAX_BIO_LENGTH"
          :placeholder="t('settings.bioPlaceholder')"
          :rows="3"
        />

        <MxTextField
          v-model="form.avatarUrl"
          autocomplete="photo"
          data-testid="page-settings-avatar"
          :error-messages="errors.avatarUrl"
          :hint="t('settings.avatarHint')"
          inputmode="url"
          :label="t('settings.avatar')"
          :maxlength="MAX_AVATAR_URL_LENGTH"
          prepend-icon="mdi-image-outline"
          type="url"
        />

        <GenrePicker
          v-model="form.favoriteGenres"
          :class="{ 'settings__genres--highlight': welcome }"
          :hint="t('settings.genresHint', { max: MAX_FAVORITE_GENRES })"
          :label="t('settings.genres')"
          :max="MAX_FAVORITE_GENRES"
        />

        <p v-if="profileError" class="form-error" data-testid="page-settings-profile-error" role="alert">{{ profileError }}</p>

        <div class="form-actions">
          <MxButton
            v-if="session.username"
            data-testid="page-settings-view-profile"
            :label="t('settings.viewProfile')"
            :to="profileRoute(session.username)"
            variant="ghost"
          />

          <MxButton
            data-testid="page-settings-save"
            :disabled="!dirty"
            icon="mdi-content-save"
            :label="t('common.save')"
            :loading="savingProfile"
            type="submit"
          />
        </div>
      </form>
    </MxGlass>

    <MxGlass aria-labelledby="settings-appearance" class="panel-stack" tag="section" variant="panel">
      <h2 id="settings-appearance" class="panel-title">{{ t('settings.appearance') }}</h2>

      <div class="settings__row">
        <div>
          <p class="settings__label">{{ t('settings.theme') }}</p>
          <p class="muted settings__hint">{{ t('settings.themeHint') }}</p>
        </div>

        <MxSegmented
          data-testid="page-settings-theme"
          :label="t('settings.theme')"
          :model-value="preferences.themeMode"
          :options="themeOptions"
          size="sm"
          @update:model-value="preferences.setThemeMode"
        />
      </div>

      <div class="settings__row">
        <div>
          <p class="settings__label">{{ t('settings.language') }}</p>
          <p class="muted settings__hint">{{ t('settings.languageHint') }}</p>
        </div>

        <MxSegmented
          data-testid="page-settings-language"
          :label="t('settings.language')"
          :model-value="languages.locale.value"
          :options="languageOptions"
          size="sm"
          @update:model-value="changeLanguage"
        />
      </div>
    </MxGlass>

    <MxGlass
      v-if="ads.enabled"
      aria-labelledby="settings-privacy"
      class="panel-stack"
      tag="section"
      variant="panel"
    >
      <h2 id="settings-privacy" class="panel-title">{{ t('settings.privacy') }}</h2>

      <div class="settings__row">
        <div>
          <p class="settings__label">{{ t('settings.adsPersonalization') }}</p>
          <p class="muted settings__hint">{{ consent.choice === 'all' ? t('settings.adsAll') : (consent.choice === 'essential' ? t('settings.adsEssential') : t('settings.adsUndecided')) }}</p>
        </div>

        <MxSegmented
          data-testid="page-settings-ads-personalization"
          :label="t('settings.adsPersonalization')"
          :model-value="consent.choice ?? 'essential'"
          :options="consentOptions"
          size="sm"
          @update:model-value="changeConsent"
        />
      </div>

      <RouterLink class="link-strong" data-testid="page-settings-privacy-link" :to="{ name: ROUTE.privacy }">{{ t('settings.readPrivacy') }}</RouterLink>
    </MxGlass>

    <RouterLink class="settings__account" data-testid="page-settings-account" :to="{ name: ROUTE.account }">
      <VIcon aria-hidden="true" icon="mdi-shield-account-outline" size="28" />

      <span>
        <strong>{{ t('settings.account') }}</strong>
        <span>{{ t('settings.accountHint') }}</span>
      </span>

      <VIcon aria-hidden="true" icon="mdi-chevron-right" />
    </RouterLink>
  </div>
</template>

<script lang="ts" setup>
  import type { ConsentChoice } from '@/constants/ads'
  import type { SegmentedOption, ThemeMode } from '@pedrolucaslopes/mixtape-ui'
  import { MxAvatar, MxButton, MxGlass, MxSegmented, MxTextarea, MxTextField, toast, useLanguages } from '@pedrolucaslopes/mixtape-ui'
  import { computed, reactive, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import GenrePicker from '@/components/GenrePicker.vue'
  import { useSeo } from '@/composables/useSeo'
  import { FULL_NAME_LENGTH, MAX_AVATAR_URL_LENGTH, MAX_BIO_LENGTH, MAX_FAVORITE_GENRES } from '@/constants/validation'
  import { loadLocale } from '@/plugins/i18n'
  import { ROUTE } from '@/router/routes'
  import { ApiError, errorMessage } from '@/services/http'
  import { accountApi } from '@/services/mixtape'
  import { useAdsStore } from '@/stores/ads'
  import { useConsentStore } from '@/stores/consent'
  import { usePreferencesStore } from '@/stores/preferences'
  import { useSessionStore } from '@/stores/session'
  import { avatarUrlProblem, isValidFullName, normalizeFullName } from '@/utils/forms'
  import { profileRoute } from '@/utils/items'

  const { t } = useI18n()
  const route = useRoute()
  const session = useSessionStore()
  const preferences = usePreferencesStore()
  const consent = useConsentStore()
  const ads = useAdsStore()
  const languages = useLanguages()

  const welcome = computed(() => route.query.welcome === '1')
  const firstName = computed(() => session.user?.fullName.split(' ', 1)[0] ?? '')

  const form = reactive({ fullName: '', bio: '', avatarUrl: '', favoriteGenres: [] as string[] })
  const attempted = ref(false)
  const savingProfile = ref(false)
  const profileError = ref<string | null>(null)
  const serverAvatarError = ref<string | null>(null)

  function reset (): void {
    form.fullName = session.user?.fullName ?? ''
    form.bio = session.user?.bio ?? ''
    form.avatarUrl = session.user?.avatarUrl ?? ''
    form.favoriteGenres = [...(session.user?.favoriteGenres ?? [])]
  }

  watch(() => session.user, reset, { immediate: true })
  watch(() => form.avatarUrl, () => {
    serverAvatarError.value = null
  })

  const avatarProblem = computed(() => avatarUrlProblem(form.avatarUrl))

  const avatarPreview = computed(() => (avatarProblem.value === null && form.avatarUrl.trim() ? form.avatarUrl.trim() : null))

  const avatarProblemText = computed(() => {
    if (avatarProblem.value === 'url') return t('settings.avatarError')
    if (avatarProblem.value === 'host') return t('errors.code.AVATAR_HOST_NOT_ALLOWED')
    return undefined
  })

  const errors = computed(() => ({
    fullName: attempted.value && !isValidFullName(form.fullName) ? t('auth.errors.fullName', FULL_NAME_LENGTH) : undefined,
    avatarUrl: serverAvatarError.value ?? avatarProblemText.value,
  }))

  const dirty = computed(() => {
    const user = session.user
    if (!user) return false
    return normalizeFullName(form.fullName) !== user.fullName
      || (form.bio.trim() || null) !== (user.bio ?? null)
      || (form.avatarUrl.trim() || null) !== (user.avatarUrl ?? null)
      || form.favoriteGenres.join('|') !== user.favoriteGenres.join('|')
  })

  const themeOptions = computed<SegmentedOption<ThemeMode>[]>(() => [
    { value: 'system', label: t('settings.themes.system'), icon: 'mdi-theme-light-dark' },
    { value: 'light', label: t('settings.themes.light'), icon: 'mdi-white-balance-sunny' },
    { value: 'dark', label: t('settings.themes.dark'), icon: 'mdi-weather-night' },
  ])

  const languageOptions = computed<SegmentedOption<string>[]>(() => languages.languages.value.map(language => ({
    value: language.code,
    label: language.name,
  })))

  async function changeLanguage (code: string): Promise<void> {
    await loadLocale(code)
    languages.setLocale(code)
  }

  const consentOptions = computed<SegmentedOption<ConsentChoice>[]>(() => [
    { value: 'essential', label: t('settings.consent.essential') },
    { value: 'all', label: t('settings.consent.all') },
  ])

  async function saveProfile (): Promise<void> {
    attempted.value = true
    profileError.value = null
    if (errors.value.fullName || errors.value.avatarUrl) return
    savingProfile.value = true
    try {
      const account = await accountApi.updateProfile({
        fullName: normalizeFullName(form.fullName),
        bio: form.bio.trim() || null,
        avatarUrl: form.avatarUrl.trim() || null,
        favoriteGenres: form.favoriteGenres,
      })
      session.setAccount(account)
      toast.success(t('settings.saved'))
    } catch (error) {
      if (error instanceof ApiError && (error.code === 'INVALID_AVATAR_URL' || error.code === 'AVATAR_HOST_NOT_ALLOWED')) serverAvatarError.value = errorMessage(error)
      else profileError.value = errorMessage(error)
    } finally {
      savingProfile.value = false
    }
  }

  function changeConsent (choice: ConsentChoice): void {
    const reload = consent.choice !== null && consent.choice !== choice
    consent.decide(choice)
    if (reload) toast.info(t('settings.consentReload'))
  }

  useSeo(() => ({ title: t('settings.title'), noindex: true }))
</script>

<style scoped>
.settings__welcome {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  animation: mx-pop-in var(--mx-spring-pop-duration) var(--mx-spring-pop) both;
}

.settings__welcome p {
  margin: 4px 0 0;
  line-height: 1.5;
}

.settings__profile-head {
  display: flex;
  align-items: center;
  gap: 16px;
}

.settings__profile-head p {
  margin: 4px 0 0;
  font-size: 0.9375rem;
}

.settings__genres--highlight :deep(.v-field) {
  box-shadow: 0 0 0 3px var(--mx-cta);
}

.settings__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
}

.settings__label {
  margin: 0;
  font-weight: 800;
}

.settings__hint {
  margin: 2px 0 0;
  font-size: 0.875rem;
}

.settings__account {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  color: inherit;
  text-decoration: none;
  background: var(--mx-surface);
  border-radius: var(--mx-radius-lg);
  transition: transform var(--mx-spring-bouncy-duration) var(--mx-spring-bouncy);
}

.settings__account:hover {
  transform: translateX(4px);
}

.settings__account:focus-visible {
  outline: 3px solid var(--mx-focus);
  outline-offset: 2px;
}

.settings__account > span {
  display: grid;
}

.settings__account > span > span {
  font-size: 0.875rem;
  color: var(--mx-on-surface-muted);
}

@media (prefers-reduced-motion: reduce) {
  .settings__welcome {
    animation: none;
  }

  .settings__account,
  .settings__account:hover {
    transition: none;
    transform: none;
  }
}
</style>
