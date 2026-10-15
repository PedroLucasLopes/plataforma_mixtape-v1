<template>
  <div class="page" data-testid="page-groups">
    <header class="page-header">
      <p class="page-header__eyebrow">{{ t('groups.eyebrow') }}</p>
      <h1 class="page-header__title">{{ t('groups.title') }}</h1>
      <p class="page-header__lead">{{ t('groups.lead') }}</p>
    </header>

    <div class="groups__actions">
      <MxGlass class="panel-stack" tint="lime" variant="panel">
        <h2 class="panel-title">{{ t('groups.createTitle') }}</h2>
        <p class="groups__text">{{ t('groups.createText') }}</p>
        <MxButton data-testid="page-groups-create" icon="mdi-account-multiple-plus" :label="t('groups.create')" @click="creating = true" />
      </MxGlass>

      <MxGlass class="panel-stack" variant="panel">
        <h2 class="panel-title">{{ t('groups.joinTitle') }}</h2>

        <form class="groups__join" data-testid="page-groups-join-form" novalidate @submit.prevent="join">
          <MxTextField
            v-model="code"
            autocomplete="off"
            data-testid="page-groups-code"
            :error-messages="codeError"
            :hint="t('groups.codeHint')"
            :label="t('groups.code')"
            :maxlength="INVITE_INPUT_MAX_LENGTH"
            prepend-icon="mdi-ticket-confirmation-outline"
          />

          <MxButton
            data-testid="page-groups-preview"
            icon="mdi-arrow-right"
            :label="t('groups.preview')"
            type="submit"
            variant="glass"
          />
        </form>
      </MxGlass>
    </div>

    <MxSection :title="t('groups.mine', { count: paged.total.value })">
      <div v-if="!paged.loaded.value && paged.loading.value" aria-hidden="true" class="groups__grid">
        <MxSkeleton v-for="index in 3" :key="index" height="180px" />
      </div>

      <MxErrorState v-else-if="paged.error.value && paged.items.value.length === 0" compact :description="paged.error.value" @retry="paged.reset()" />

      <MxEmptyState
        v-else-if="paged.loaded.value && paged.items.value.length === 0"
        :description="t('groups.emptyDescription')"
        duotone="green"
        :heading-level="3"
        icon="mdi-account-group-outline"
        :title="t('groups.empty')"
      />

      <template v-else>
        <ul class="groups__grid">
          <li v-for="(group, index) in paged.items.value" :key="group.id" v-reveal="{ variant: 'up', delay: index % 6 * 70 }">
            <article class="group-card" :style="cardStyle(group.id)">
              <span v-if="group.myRole === 'OWNER'" class="group-card__role">{{ t('groups.roles.OWNER') }}</span>

              <h3 class="group-card__name">
                <RouterLink class="group-card__link" data-testid="page-groups-group" :to="groupRoute(group.id)">{{ group.name }}</RouterLink>
              </h3>

              <p v-if="group.description" class="group-card__description">{{ group.description }}</p>

              <p class="group-card__meta">
                <VIcon aria-hidden="true" icon="mdi-account-multiple" size="16" />
                {{ t('groups.members', { count: group.membersCount }) }}
                · {{ t('groups.since', { date: formatDate(group.createdAt, locale) }) }}
              </p>
            </article>
          </li>
        </ul>

        <MxLoadMore data-testid="page-groups-load-more" :has-more="paged.hasMore.value" :loading="paged.loading.value" @load="paged.loadMore()" />
      </template>
    </MxSection>

    <GroupFormDialog v-model="creating" @saved="created" />
  </div>
</template>

<script lang="ts" setup>
  import type { Group, GroupSummary } from '@/types/api'
  import {
    duotoneFor,
    duotones,
    formatDate,
    MxButton,
    MxEmptyState,
    MxErrorState,
    MxGlass,
    MxLoadMore,
    MxSection,
    MxSkeleton,
    MxTextField,
    toast,
    vReveal,
  } from '@pedrolucaslopes/mixtape-ui'
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import GroupFormDialog from '@/components/GroupFormDialog.vue'
  import { usePaged } from '@/composables/usePaged'
  import { useSeo } from '@/composables/useSeo'
  import { INVITE_CODE_PATTERN, INVITE_INPUT_MAX_LENGTH } from '@/constants/validation'
  import { ROUTE } from '@/router/routes'
  import { groupsApi } from '@/services/mixtape'
  import { groupRoute } from '@/utils/items'

  const { t, locale } = useI18n()
  const router = useRouter()

  const paged = usePaged<GroupSummary>((page, limit) => groupsApi.mine({ page, limit }))
  const creating = ref(false)
  const code = ref('')
  const attempted = ref(false)

  const normalizedCode = computed(() => code.value.trim().replace(/^.*\/groups\/join\//, '').replace(/[^A-Z0-9]/gi, ''))
  const codeError = computed(() => (attempted.value && !INVITE_CODE_PATTERN.test(normalizedCode.value) ? t('groups.codeError') : undefined))

  function cardStyle (id: string) {
    const colors = duotones[duotoneFor(id)]
    return { '--group-bg': colors.background, '--group-ink': colors.ink }
  }

  function join (): void {
    attempted.value = true
    if (codeError.value) return
    void router.push({ name: ROUTE.groupInvite, params: { code: normalizedCode.value } })
  }

  async function created (group: Group): Promise<void> {
    toast.success(t('groups.created', { name: group.name }))
    await router.push(groupRoute(group.id))
  }

  useSeo(() => ({ title: t('groups.title'), description: t('groups.lead'), noindex: true }))
</script>

<style scoped>
.groups__actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 20px;
}

.groups__text {
  margin: 0;
  line-height: 1.5;
}

.groups__join {
  display: grid;
  gap: 12px;
  justify-items: start;
}

.groups__join > :first-child {
  width: 100%;
}

.groups__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.group-card {
  position: relative;
  display: grid;
  align-content: start;
  gap: 8px;
  min-height: 170px;
  padding: 22px;
  color: var(--group-ink);
  background: var(--group-bg);
  border-radius: var(--mx-radius-xl);
  transition: transform var(--mx-spring-bouncy-duration) var(--mx-spring-bouncy);
}

.group-card:hover {
  transform: translateY(-4px) rotate(-0.8deg);
}

.group-card__role {
  justify-self: start;
  padding: 4px 10px;
  font-size: 0.6875rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--group-bg);
  background: var(--group-ink);
  border-radius: var(--mx-radius-pill);
}

.group-card__name {
  margin: 0;
  font-family: var(--mx-font-display);
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: var(--mx-tracking-title);
  line-height: 1;
}

.group-card__link {
  color: inherit;
  text-decoration: none;
}

.group-card__link::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.group-card__link:focus-visible {
  outline: none;
}

.group-card__link:focus-visible::after {
  outline: 3px solid var(--mx-focus);
  outline-offset: 3px;
}

.group-card__description {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  font-weight: 600;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.group-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: auto 0 0;
  font-size: 0.875rem;
  font-weight: 700;
}

@media (prefers-reduced-motion: reduce) {
  .group-card,
  .group-card:hover {
    transition: none;
    transform: none;
  }
}
</style>
