<template>
  <div class="page page--narrow" data-testid="page-account">
    <header class="page-header">
      <RouterLink class="link-strong account__back" data-testid="page-account-back" :to="{ name: ROUTE.settings }">
        <VIcon aria-hidden="true" icon="mdi-arrow-left" size="18" />
        {{ t('settings.title') }}
      </RouterLink>

      <h1 class="page-header__title">{{ t('account.title') }}</h1>
      <p class="page-header__lead">{{ t('account.lead') }}</p>
    </header>

    <MxGlass
      v-if="session.user"
      aria-labelledby="account-data"
      class="panel-stack"
      tag="section"
      variant="panel"
    >
      <h2 id="account-data" class="panel-title">{{ t('account.data') }}</h2>
      <MxDescriptionList :columns="2" :items="accountItems" />

      <p class="muted account__note">
        <VIcon aria-hidden="true" icon="mdi-eye-off-outline" size="18" />
        {{ t('account.privateNote') }}
      </p>
    </MxGlass>

    <MxGlass aria-labelledby="account-password" class="panel-stack" tag="section" variant="panel">
      <h2 id="account-password" class="panel-title">{{ t('account.password') }}</h2>

      <p class="muted account__note">
        <VIcon aria-hidden="true" icon="mdi-email-lock-outline" size="18" />
        {{ t('account.passwordLead', { email: session.user?.email ?? '' }) }}
      </p>

      <p v-if="resetSent" class="account__sent" role="status">
        <VIcon aria-hidden="true" icon="mdi-email-check-outline" size="18" />
        {{ t('account.resetLinkSent', { email: resetSent.email, minutes: resetSent.expiresInMinutes }) }}
      </p>

      <p v-if="resetError" class="form-error" data-testid="page-account-reset-error" role="alert">{{ resetError }}</p>

      <div class="form-actions account__actions">
        <MxButton
          data-testid="page-account-send-reset-link"
          :disabled="countdown.remaining.value > 0"
          icon="mdi-lock-reset"
          :label="countdown.remaining.value > 0 ? t('account.resendIn', { seconds: countdown.remaining.value }) : t('account.sendResetLink')"
          :loading="sendingReset"
          @click="sendResetLink"
        />
      </div>
    </MxGlass>

    <MxGlass aria-labelledby="account-sessions" class="panel-stack" tag="section" variant="panel">
      <h2 id="account-sessions" class="panel-title">{{ t('account.sessions') }}</h2>
      <p class="muted account__note">{{ t('account.sessionsLead') }}</p>

      <div class="form-actions account__actions">
        <MxButton
          data-testid="page-account-sign-out"
          icon="mdi-logout"
          :label="t('account.signOut')"
          variant="ghost"
          @click="signOut"
        />

        <MxButton
          data-testid="page-account-sign-out-everywhere"
          icon="mdi-logout-variant"
          :label="t('account.signOutEverywhere')"
          variant="danger"
          @click="confirmingEverywhere = true"
        />
      </div>
    </MxGlass>

    <MxGlass aria-labelledby="account-deletion" class="panel-stack" tag="section" variant="panel">
      <h2 id="account-deletion" class="panel-title">{{ t('account.deletion.title') }}</h2>
      <p class="muted account__note">{{ t('account.deletion.lead') }}</p>

      <p class="muted account__note">
        <VIcon aria-hidden="true" icon="mdi-email-lock-outline" size="18" />
        {{ t('account.deletion.note', { email: session.user?.email ?? '' }) }}
      </p>

      <p v-if="deletionSent" class="account__sent" data-testid="page-account-deletion-sent" role="status">
        <VIcon aria-hidden="true" icon="mdi-email-check-outline" size="18" />
        {{ t('account.deletion.sent', { email: deletionSent.email, minutes: deletionSent.expiresInMinutes }) }}
      </p>

      <p v-if="deletionError" class="form-error" data-testid="page-account-deletion-error" role="alert">{{ deletionError }}</p>

      <div class="form-actions account__actions">
        <MxButton
          data-testid="page-account-send-deletion-link"
          :disabled="deletionCountdown.remaining.value > 0"
          icon="mdi-delete-forever-outline"
          :label="deletionCountdown.remaining.value > 0 ? t('account.resendIn', { seconds: deletionCountdown.remaining.value }) : t('account.deletion.button')"
          :loading="sendingDeletion"
          variant="danger"
          @click="sendDeletionLink"
        />
      </div>
    </MxGlass>

    <MxConfirmDialog
      v-model="confirmingEverywhere"
      :confirm-label="t('account.signOutEverywhere')"
      data-testid="page-account-sign-out-everywhere-confirm"
      destructive
      :error="everywhereError"
      :loading="signingOutEverywhere"
      :message="t('account.signOutEverywhereMessage')"
      :title="t('account.signOutEverywhereTitle')"
      @confirm="signOutEverywhere"
    />
  </div>
</template>

<script lang="ts" setup>
  import type { AccountDeletionSent, PasswordResetSent } from '@/types/api'
  import type { DescriptionItem } from '@pedrolucaslopes/mixtape-ui'
  import { formatDate, formatPartialDate, MxButton, MxConfirmDialog, MxDescriptionList, MxGlass, toast } from '@pedrolucaslopes/mixtape-ui'
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import { useCountdown } from '@/composables/useCountdown'
  import { useSeo } from '@/composables/useSeo'
  import { ACCOUNT_DELETION_RESEND_SECONDS, PASSWORD_RESET_RESEND_SECONDS } from '@/constants/api'
  import { ROUTE } from '@/router/routes'
  import { errorMessage } from '@/services/http'
  import { accountApi } from '@/services/mixtape'
  import { useSessionStore } from '@/stores/session'

  const { t, locale } = useI18n()
  const router = useRouter()
  const session = useSessionStore()
  const countdown = useCountdown()
  const deletionCountdown = useCountdown()

  const sendingReset = ref(false)
  const sendingDeletion = ref(false)
  const deletionSent = ref<AccountDeletionSent | null>(null)
  const deletionError = ref<string | null>(null)
  const resetSent = ref<PasswordResetSent | null>(null)
  const resetError = ref<string | null>(null)
  const confirmingEverywhere = ref(false)
  const signingOutEverywhere = ref(false)
  const everywhereError = ref<string | null>(null)

  const accountItems = computed<DescriptionItem[]>(() => {
    const user = session.user
    if (!user) return []
    return [
      { term: t('account.fields.email'), value: user.email },
      { term: t('account.fields.username'), value: `@${user.username}` },
      { term: t('account.fields.name'), value: user.fullName },
      { term: t('account.fields.birthDate'), value: formatPartialDate(user.birthDate, locale.value) },
      { term: t('account.fields.createdAt'), value: formatDate(user.createdAt, locale.value, { dateStyle: 'long' }) },
      { term: t('account.fields.role'), value: t(`account.roles.${user.role}`) },
    ]
  })

  async function sendResetLink (): Promise<void> {
    sendingReset.value = true
    resetError.value = null
    try {
      resetSent.value = await accountApi.requestPasswordReset()
      countdown.start(PASSWORD_RESET_RESEND_SECONDS)
    } catch (error) {
      resetError.value = errorMessage(error)
    } finally {
      sendingReset.value = false
    }
  }

  /** Só manda o link: a conta é apagada na página que ele abre, depois de mais uma confirmação. */
  async function sendDeletionLink (): Promise<void> {
    sendingDeletion.value = true
    deletionError.value = null
    try {
      deletionSent.value = await accountApi.requestAccountDeletion()
      deletionCountdown.start(ACCOUNT_DELETION_RESEND_SECONDS)
    } catch (error) {
      deletionError.value = errorMessage(error)
    } finally {
      sendingDeletion.value = false
    }
  }

  async function signOut (): Promise<void> {
    await session.logout()
    toast.info(t('auth.signedOut'))
    await router.replace({ name: ROUTE.home })
  }

  async function signOutEverywhere (): Promise<void> {
    signingOutEverywhere.value = true
    everywhereError.value = null
    try {
      await session.logoutEverywhere()
      confirmingEverywhere.value = false
      toast.info(t('account.signedOutEverywhere'))
      await router.replace({ name: ROUTE.home })
    } catch (error) {
      everywhereError.value = errorMessage(error)
    } finally {
      signingOutEverywhere.value = false
    }
  }

  useSeo(() => ({ title: t('account.title'), noindex: true }))
</script>

<style scoped>
.account__back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  justify-self: start;
  text-decoration: none;
}

.account__note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.account__actions {
  justify-content: flex-start;
}

.account__sent {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding: 12px 14px;
  font-size: 0.9375rem;
  font-weight: 700;
  line-height: 1.5;
  overflow-wrap: anywhere;
  background: var(--mx-surface-variant);
  border-radius: var(--mx-radius-md);
}
</style>
