<template>
  <PageState
    data-testid="page-group-invite"
    :error="invite.error.value"
    :loading="invite.loading.value"
    :not-found="invite.notFound.value"
    :not-found-description="t('invite.notFoundDescription')"
    :not-found-title="t('invite.notFound')"
    :ready="Boolean(invite.data.value)"
    @retry="invite.reload()"
  >
    <section v-if="invite.data.value" aria-labelledby="invite-title" class="page page--narrow invite" :style="heroStyle">
      <div class="invite__card">
        <MxStarburst
          class="invite__burst"
          :color="colors.accent"
          :ink="colors.ink"
          :points="10"
          shape="flower"
          size="260px"
          spin
        />

        <p class="invite__eyebrow">{{ t('invite.eyebrow') }}</p>
        <h1 id="invite-title" class="invite__title mx-display">{{ invite.data.value.name }}</h1>
        <p v-if="invite.data.value.description" class="invite__description">{{ invite.data.value.description }}</p>

        <div class="invite__owner">
          <MxAvatar
            decorative
            :name="invite.data.value.owner.fullName"
            :seed="invite.data.value.owner.username"
            :size="48"
            :src="invite.data.value.owner.avatarUrl"
            :tier="invite.data.value.owner.disc.tier"
          />

          <p>
            <i18n-t keypath="invite.ownedBy" scope="global" tag="span">
              <template #name>
                <RouterLink class="hero-link" data-testid="page-group-invite-owner" :to="profileRoute(invite.data.value.owner.username)">{{ invite.data.value.owner.fullName }}</RouterLink>
              </template>
            </i18n-t>

            <br>
            {{ t('groups.members', { count: invite.data.value.membersCount }) }}
          </p>
        </div>

        <p v-if="error" class="form-error" data-testid="page-group-invite-error" role="alert">{{ error }}</p>

        <div class="invite__actions">
          <MxButton
            v-if="session.isAuthenticated"
            data-testid="page-group-invite-join"
            icon="mdi-account-multiple-plus"
            :label="t('invite.join')"
            :loading="joining"
            size="lg"
            variant="ink"
            @click="join"
          />

          <template v-else>
            <MxButton
              data-testid="page-group-invite-sign-in-to-join"
              icon="mdi-login"
              :label="t('invite.signInToJoin')"
              size="lg"
              :to="{ name: ROUTE.login, query: { redirect: route.fullPath } }"
              variant="ink"
            />

            <MxButton
              data-testid="page-group-invite-create-account"
              :label="t('auth.createAccount')"
              size="lg"
              :to="{ name: ROUTE.register, query: { redirect: route.fullPath } }"
              variant="ink-outline"
            />
          </template>

          <MxButton
            v-if="alreadyMember"
            data-testid="page-group-invite-my-groups"
            :label="t('invite.myGroups')"
            size="lg"
            :to="{ name: ROUTE.groups }"
            variant="ink-outline"
          />
        </div>
      </div>
    </section>
  </PageState>
</template>

<script lang="ts" setup>
  import { duotoneFor, duotones, MxAvatar, MxButton, MxStarburst, toast } from '@pedrolucaslopes/mixtape-ui'
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import PageState from '@/components/PageState.vue'
  import { useAsyncData } from '@/composables/useAsyncData'
  import { useSeo } from '@/composables/useSeo'
  import { ROUTE } from '@/router/routes'
  import { ApiError, errorMessage } from '@/services/http'
  import { groupsApi } from '@/services/mixtape'
  import { useSessionStore } from '@/stores/session'
  import { groupRoute, profileRoute } from '@/utils/items'

  const props = defineProps<{ code: string }>()

  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const session = useSessionStore()

  const invite = useAsyncData(() => groupsApi.invite(props.code), { watch: () => props.code })
  const joining = ref(false)
  const error = ref<string | null>(null)
  const alreadyMember = ref(false)

  const colors = computed(() => duotones[duotoneFor(props.code)])
  const heroStyle = computed(() => ({ '--invite-bg': colors.value.background, '--invite-ink': colors.value.ink }))

  async function join (): Promise<void> {
    joining.value = true
    error.value = null
    try {
      const group = await groupsApi.join(props.code)
      toast.success(t('invite.joined', { name: group.name }))
      await router.replace(groupRoute(group.id))
    } catch (error_) {
      alreadyMember.value = error_ instanceof ApiError && error_.code === 'ALREADY_GROUP_MEMBER'
      error.value = errorMessage(error_)
    } finally {
      joining.value = false
    }
  }

  useSeo(() => ({
    title: invite.data.value ? t('invite.seoTitle', { name: invite.data.value.name }) : t('invite.notFound'),
    description: invite.data.value?.description ?? t('invite.seoDescription'),
    noindex: true,
  }))
</script>

<style scoped>
.invite__card {
  position: relative;
  isolation: isolate;
  display: grid;
  justify-items: start;
  gap: 16px;
  padding: clamp(28px, 6vw, 64px);
  overflow: hidden;
  color: var(--invite-ink);
  background: var(--invite-bg);
  border-radius: var(--mx-radius-xl);
  --mx-hero-bg: var(--invite-bg);
  --mx-hero-ink: var(--invite-ink);
  animation: invite-in var(--mx-spring-bouncy-duration) var(--mx-spring-bouncy) both;
}

@keyframes invite-in {
  from { transform: translate3d(0, 18px, 0) scale(0.95); }
  to { transform: none; }
}

.invite__burst {
  position: absolute;
  top: -60px;
  right: -60px;
  z-index: -1;
}

.invite__eyebrow {
  margin: 0;
  font-size: var(--mx-text-overline);
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.invite__title {
  margin: 0;
  font-size: var(--mx-text-display-l);
  overflow-wrap: anywhere;
}

.invite__description {
  max-width: 52ch;
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 600;
  line-height: 1.55;
}

.invite__owner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.invite__owner p {
  margin: 0;
  line-height: 1.4;
}

.invite__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}

@media (prefers-reduced-motion: reduce) {
  .invite__card {
    animation: none;
  }
}
</style>
