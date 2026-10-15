<template>
  <div class="auth-page" data-testid="page-delete-account">
    <MxLoader v-if="state === 'checking'" :label="t('account.deletePage.checking')" :size="56" />

    <template v-else-if="state === 'invalid'">
      <header class="auth-page__header">
        <p class="auth-page__eyebrow">{{ t('account.deletePage.eyebrow') }}</p>
        <h1 class="auth-page__title mx-display">{{ t('account.deletePage.invalidTitle') }}</h1>
        <p class="auth-page__lead">{{ t('account.deletePage.invalid') }}</p>
      </header>

      <MxButton
        block
        data-testid="page-delete-account-request-new"
        icon="mdi-email-fast-outline"
        :label="t('account.deletePage.requestNew')"
        size="lg"
        :to="{ name: ROUTE.account }"
      />
    </template>

    <MxErrorState v-else-if="state === 'error'" :description="error ?? undefined" :retrying="checking" @retry="check" />

    <template v-else-if="state === 'done'">
      <header class="auth-page__header" data-testid="page-delete-account-done">
        <p class="auth-page__eyebrow">{{ t('account.deletePage.eyebrow') }}</p>
        <h1 class="auth-page__title mx-display">{{ t('account.deletePage.doneTitle') }}</h1>
        <p class="auth-page__lead">{{ t('account.deletePage.done') }}</p>
      </header>

      <MxButton
        block
        data-testid="page-delete-account-home"
        icon="mdi-home-outline"
        :label="t('account.deletePage.home')"
        size="lg"
        :to="{ name: ROUTE.home }"
      />
    </template>

    <template v-else-if="account">
      <header class="auth-page__header">
        <p class="auth-page__eyebrow">{{ t('account.deletePage.eyebrow') }}</p>
        <h1 class="auth-page__title mx-display">{{ t('account.deletePage.title') }}</h1>

        <p class="auth-page__account" data-testid="page-delete-account-username">
          <VIcon aria-hidden="true" icon="mdi-account-circle-outline" size="18" />
          {{ t('account.deletePage.account', { username: account.username }) }}
        </p>

        <p class="auth-page__lead">{{ t('account.deletePage.lead') }}</p>
      </header>

      <ul class="delete-account__list">
        <li v-for="item in GONE" :key="item.key">
          <VIcon aria-hidden="true" :icon="item.icon" size="18" />
          {{ t(`account.deletePage.items.${item.key}`) }}
        </li>
      </ul>

      <p v-if="error" class="form-error" data-testid="page-delete-account-error" role="alert">{{ error }}</p>

      <div class="delete-account__actions">
        <MxButton
          block
          data-testid="page-delete-account-submit"
          icon="mdi-delete-forever-outline"
          :label="t('account.deletePage.submit')"
          :loading="deleting"
          size="lg"
          variant="danger"
          @click="confirmDeletion"
        />

        <MxButton
          block
          data-testid="page-delete-account-cancel"
          :label="t('account.deletePage.cancel')"
          :to="{ name: ROUTE.home }"
          variant="ghost"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { MxButton, MxErrorState, MxLoader } from '@pedrolucaslopes/mixtape-ui'
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import { useSeo } from '@/composables/useSeo'
  import { ROUTE } from '@/router/routes'
  import { ApiError, errorMessage } from '@/services/http'
  import { authApi } from '@/services/mixtape'
  import { useSessionStore } from '@/stores/session'

  type State = 'checking' | 'invalid' | 'error' | 'confirm' | 'done'

  /** O que some com a conta, na ordem em que a página lista. */
  const GONE = [
    { key: 'reviews', icon: 'mdi-star-outline' },
    { key: 'likes', icon: 'mdi-heart-outline' },
    { key: 'lists', icon: 'mdi-playlist-music' },
    { key: 'points', icon: 'mdi-trophy-outline' },
    { key: 'groups', icon: 'mdi-account-group-outline' },
  ] as const

  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const session = useSessionStore()

  const token = new URLSearchParams(route.hash.replace(/^#/, '')).get('token')
  if (route.hash) {
    void router.replace({ name: ROUTE.deleteAccount, hash: '' })
  }

  const state = ref<State>('checking')
  const checking = ref(false)
  const deleting = ref(false)
  const account = ref<{ username: string, email: string } | null>(null)
  const error = ref<string | null>(null)

  async function check (): Promise<void> {
    if (!token) {
      state.value = 'invalid'
      return
    }
    checking.value = true
    try {
      const result = await authApi.checkAccountDeletion(token)
      if (result.valid && result.username && result.email) {
        account.value = { username: result.username, email: result.email }
        state.value = 'confirm'
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

  async function confirmDeletion (): Promise<void> {
    if (!token) {
      return
    }
    deleting.value = true
    error.value = null
    try {
      await authApi.deleteAccount(token)
      // Se este navegador estava na conta excluída, ele sai dela (e as outras abas também).
      if (session.user?.username === account.value?.username) {
        await session.logout()
      }
      state.value = 'done'
    } catch (error_) {
      if (error_ instanceof ApiError && error_.code === 'ACCOUNT_DELETION_INVALID') {
        state.value = 'invalid'
      } else {
        error.value = errorMessage(error_)
      }
    } finally {
      deleting.value = false
    }
  }

  void check()

  useSeo(() => ({ title: t('account.deletePage.title'), noindex: true }))
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

.delete-account__list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.delete-account__list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.45;
}

.delete-account__actions {
  display: grid;
  gap: 10px;
}
</style>
