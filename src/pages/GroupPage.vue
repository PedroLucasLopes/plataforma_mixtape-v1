<template>
  <PageState
    data-testid="page-group"
    :error="group.error.value"
    :loading="group.loading.value"
    :not-found="group.notFound.value || group.errorCode.value === 'NOT_GROUP_MEMBER'"
    :not-found-description="t('group.notFoundDescription')"
    :not-found-title="t('group.notFound')"
    :ready="Boolean(group.data.value)"
    @retry="group.reload()"
  >
    <article v-if="group.data.value" class="page">
      <section aria-labelledby="group-title" class="group-hero" :style="heroStyle">
        <MxBlob class="group-hero__blob" :color="colors.accent" :size="BLOB_SIZE.groupHero" />
        <p class="group-hero__eyebrow">{{ isOwner ? t('group.eyebrowOwner') : t('group.eyebrow') }}</p>
        <h1 id="group-title" class="group-hero__title mx-display">{{ group.data.value.name }}</h1>
        <p v-if="group.data.value.description" class="group-hero__description">{{ group.data.value.description }}</p>

        <ul :aria-label="t('group.membersLabel', { count: group.data.value.membersCount })" class="group-hero__avatars">
          <li v-for="(member, index) in group.data.value.members.slice(0, AVATAR_STACK)" :key="member.user.id" :style="{ '--index': index }">
            <MxAvatar
              :name="member.user.fullName"
              :seed="member.user.username"
              :size="44"
              :src="member.user.avatarUrl"
              :tier="member.user.disc.tier"
            />
          </li>

          <li v-if="group.data.value.membersCount > AVATAR_STACK" class="group-hero__more">+{{ group.data.value.membersCount - AVATAR_STACK }}</li>
        </ul>

        <ul class="hero-facts">
          <li><VIcon aria-hidden="true" icon="mdi-account-multiple" size="16" /> {{ t('groups.members', { count: group.data.value.membersCount }) }}</li>
          <li><VIcon aria-hidden="true" icon="mdi-crown" size="16" /> {{ t('group.owner', { name: group.data.value.owner.fullName }) }}</li>
          <li><VIcon aria-hidden="true" icon="mdi-calendar" size="16" /> {{ t('groups.since', { date: formatDate(group.data.value.createdAt, locale) }) }}</li>

          <li>
            <VIcon aria-hidden="true" :icon="isPublic ? 'mdi-earth' : 'mdi-lock-outline'" size="16" />
            {{ isPublic ? t('groups.visibility.public') : t('groups.visibility.private') }}
          </li>
        </ul>

        <div class="group-hero__actions">
          <MxButton
            data-testid="page-group-start"
            icon="mdi-account-group"
            :label="t('galera.start')"
            variant="ink"
            @click="proposing = true"
          />

          <MxButton
            data-testid="page-group-invite"
            icon="mdi-account-plus"
            :label="t('group.invite')"
            variant="ink-outline"
            @click="inviteFriends"
          />

          <MxButton
            data-testid="page-group-copy-code"
            icon="mdi-content-copy"
            :label="t('group.copyCode', { code: group.data.value.inviteCode })"
            variant="ink-outline"
            @click="copyCode"
          />

          <template v-if="isOwner">
            <MxIconButton
              data-testid="page-group-edit"
              icon="mdi-pencil"
              :label="t('group.edit')"
              variant="ink"
              @click="editing = true"
            />

            <MxIconButton
              data-testid="page-group-regenerate"
              icon="mdi-refresh"
              :label="t('group.regenerate')"
              variant="ink"
              @click="confirm = 'regenerate'"
            />

            <MxIconButton
              data-testid="page-group-delete"
              icon="mdi-delete-outline"
              :label="t('group.delete')"
              variant="ink"
              @click="confirm = 'delete'"
            />
          </template>

          <MxButton
            v-else
            data-testid="page-group-leave"
            icon="mdi-exit-run"
            :label="t('group.leave')"
            variant="ink-outline"
            @click="confirm = 'leave'"
          />
        </div>
      </section>

      <MxSegmented
        v-model="tab"
        block
        data-testid="page-group-tabs"
        :label="t('group.tabsLabel')"
        :options="tabOptions"
      />

      <div class="group__panel">
        <section v-if="tab === 'galera'" aria-labelledby="group-galera-title" class="panel-stack">
          <div class="toolbar">
            <h2 id="group-galera-title" class="panel-title">{{ t('galera.title') }}</h2>
            <span class="toolbar__spacer" />

            <MxButton
              data-testid="page-group-propose"
              icon="mdi-account-group"
              :label="t('galera.start')"
              size="sm"
              @click="proposing = true"
            />
          </div>

          <p class="muted group__hint">{{ isPublic ? t('galera.hintPublic') : t('galera.hintPrivate') }}</p>

          <GroupReviewList
            ref="galeraList"
            :empty-description="t('galera.emptyDescription')"
            :empty-title="t('galera.emptyTitle')"
            :loader="loadGalera"
            :watch-key="id"
          />
        </section>

        <RankingBoard
          v-else-if="tab === 'ranking'"
          v-model:category="category"
          v-model:period="period"
          :loader="loadRanking"
        />

        <ReviewList
          v-else-if="tab === 'feed'"
          :empty-description="t('group.feedEmptyDescription')"
          :empty-title="t('group.feedEmpty')"
          :loader="loadFeed"
          :watch-key="id"
        />

        <section v-else-if="tab === 'top'" aria-labelledby="group-top-title" class="panel-stack">
          <div class="toolbar">
            <h2 id="group-top-title" class="panel-title">{{ t('group.topTitle') }}</h2>
            <span class="toolbar__spacer" />

            <MxSegmented
              v-model="topType"
              data-testid="page-group-type"
              :label="t('library.typeLabel')"
              :options="topTypeOptions"
              size="sm"
            />
          </div>

          <p class="muted group__hint">{{ t('group.topHint') }}</p>
          <MxSkeleton v-if="top.loading.value && !top.data.value" height="320px" />
          <MxErrorState v-else-if="top.error.value" compact :description="top.error.value" @retry="top.reload()" />

          <MxEmptyState
            v-else-if="!top.data.value?.length"
            compact
            duotone="orange"
            :heading-level="3"
            icon="mdi-trophy-variant-outline"
            :title="t('group.topEmpty')"
          />

          <ol v-else class="numbered-list">
            <li v-for="(entry, index) in top.data.value" :key="entry.item.id" v-reveal="{ variant: 'left', delay: index * 50 }">
              <MxItemCard
                v-bind="cards.summary(entry.item)"
                :heading-level="3"
                layout="row"
                :position="index + 1"
                :rating="entry.averageRating"
              >
                <template #actions>
                  <span class="group__count">{{ t('home.trending.meta', { count: entry.reviewsCount, formatted: formatNumber(entry.reviewsCount, locale) }) }}</span>
                </template>
              </MxItemCard>
            </li>
          </ol>
        </section>

        <section v-else aria-labelledby="group-members-title" class="panel-stack">
          <h2 id="group-members-title" class="panel-title">{{ t('group.membersLabel', { count: group.data.value.membersCount }) }}</h2>

          <ul class="group__members">
            <li v-for="member in group.data.value.members" :key="member.user.id" class="group__member">
              <MxAvatar
                decorative
                :name="member.user.fullName"
                :seed="member.user.username"
                :size="48"
                :src="member.user.avatarUrl"
                :tier="member.user.disc.tier"
              />

              <span class="group__member-text">
                <RouterLink class="link-strong" data-testid="page-group-member" :to="profileRoute(member.user.username)">{{ member.user.fullName }}</RouterLink>
                <span>@{{ member.user.username }} · {{ labels.tierLabel(member.user.disc.tier, member.user.disc.label) }}</span>
                <span>{{ t('group.joinedAt', { date: formatDate(member.joinedAt, locale) }) }}</span>
              </span>

              <span v-if="member.role === 'OWNER'" class="group__role">{{ t('groups.roles.OWNER') }}</span>

              <MxIconButton
                v-else-if="isOwner"
                data-testid="page-group-remove-member"
                icon="mdi-account-remove"
                :label="t('group.removeMember', { name: member.user.fullName })"
                size="sm"
                variant="ghost"
                @click="memberToRemove = member"
              />
            </li>
          </ul>
        </section>
      </div>

      <GroupFormDialog v-if="isOwner" v-model="editing" :group="group.data.value" @saved="saved" />

      <GroupReviewProposeDialog v-model="proposing" :group-id="id" @existing="openExisting" @proposed="proposed" />

      <MxConfirmDialog
        :confirm-label="confirmCopy.action"
        data-testid="page-group-action-confirm"
        :destructive="confirm !== 'regenerate'"
        :error="actionError"
        :loading="acting"
        :message="confirmCopy.message"
        :model-value="confirm !== null"
        :title="confirmCopy.title"
        @confirm="runConfirm"
        @update:model-value="value => { if (!value) confirm = null }"
      />

      <MxConfirmDialog
        :confirm-label="t('group.remove')"
        data-testid="page-group-remove-confirm"
        destructive
        :error="actionError"
        :loading="acting"
        :message="t('group.removeMessage', { name: memberToRemove?.user.fullName ?? '' })"
        :model-value="memberToRemove !== null"
        :title="t('group.removeTitle')"
        @confirm="removeMember"
        @update:model-value="value => { if (!value) memberToRemove = null }"
      />
    </article>
  </PageState>
</template>

<script lang="ts" setup>
  import type { Group, GroupMember, GroupReview, ItemType, Period, RankingCategory } from '@/types/api'
  import type { SegmentedOption } from '@pedrolucaslopes/mixtape-ui'
  import {
    duotoneFor,
    duotones,
    formatDate,
    formatNumber,
    MxAvatar,
    MxBlob,
    MxButton,
    MxConfirmDialog,
    MxEmptyState,
    MxErrorState,
    MxIconButton,
    MxItemCard,
    MxSegmented,
    MxSkeleton,
    toast,
    vReveal,
  } from '@pedrolucaslopes/mixtape-ui'
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import GroupFormDialog from '@/components/GroupFormDialog.vue'
  import GroupReviewList from '@/components/GroupReviewList.vue'
  import GroupReviewProposeDialog from '@/components/GroupReviewProposeDialog.vue'
  import PageState from '@/components/PageState.vue'
  import RankingBoard from '@/components/RankingBoard.vue'
  import ReviewList from '@/components/ReviewList.vue'
  import { useAsyncData } from '@/composables/useAsyncData'
  import { useCatalogCards } from '@/composables/useCatalogCards'
  import { useGroupReviewCards } from '@/composables/useGroupReviewCards'
  import { useLabels } from '@/composables/useLabels'
  import { useSeo } from '@/composables/useSeo'
  import { GROUP_TOP_ITEMS } from '@/constants/api'
  import { BLOB_SIZE } from '@/constants/decor'
  import { ROUTE } from '@/router/routes'
  import { errorMessage } from '@/services/http'
  import { groupsApi } from '@/services/mixtape'
  import { useSessionStore } from '@/stores/session'
  import { useShareStore } from '@/stores/share'
  import { groupReviewRoute, profileRoute } from '@/utils/items'
  import { queryEnum } from '@/utils/navigation'

  type Tab = 'galera' | 'ranking' | 'feed' | 'top' | 'members'
  type ConfirmAction = 'regenerate' | 'delete' | 'leave'

  const TABS: readonly Tab[] = ['galera', 'ranking', 'feed', 'top', 'members']
  const AVATAR_STACK = 6

  const props = defineProps<{ id: string }>()

  const { t, locale } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const labels = useLabels()
  const cards = useCatalogCards()
  const session = useSessionStore()
  const share = useShareStore()
  const galera = useGroupReviewCards()

  const group = useAsyncData(() => groupsApi.get(props.id), { watch: () => props.id })

  const editing = ref(false)
  const proposing = ref(false)
  const galeraList = ref<{ reset: () => Promise<void> } | null>(null)
  const confirm = ref<ConfirmAction | null>(null)
  const memberToRemove = ref<GroupMember | null>(null)
  const acting = ref(false)
  const actionError = ref<string | null>(null)
  const category = ref<RankingCategory>('overall')
  const period = ref<Period>('month')
  const topType = ref<ItemType>('ALBUM')

  const tab = computed<Tab>({
    get: () => queryEnum(route.query.tab, TABS, 'galera'),
    set: value => void router.replace({ query: { ...route.query, tab: value === 'galera' ? undefined : value } }),
  })

  const top = useAsyncData(
    () => (tab.value === 'top' ? groupsApi.topItems(props.id, topType.value, GROUP_TOP_ITEMS) : Promise.resolve(null)),
    { watch: () => [props.id, topType.value, tab.value === 'top'] },
  )

  const isOwner = computed(() => Boolean(session.user && group.data.value?.owner.id === session.user.id))
  const isPublic = computed(() => group.data.value?.visibility === 'PUBLIC')
  const colors = computed(() => duotones[duotoneFor(props.id)])
  const heroStyle = computed(() => ({ '--group-bg': colors.value.background, '--group-ink': colors.value.ink, '--mx-hero-bg': colors.value.background, '--mx-hero-ink': colors.value.ink }))

  const tabOptions = computed<SegmentedOption<Tab>[]>(() => [
    { value: 'galera', label: t('group.tabs.galera'), icon: 'mdi-account-group' },
    { value: 'ranking', label: t('group.tabs.ranking'), icon: 'mdi-podium' },
    { value: 'feed', label: t('group.tabs.feed'), icon: 'mdi-message-text-outline' },
    { value: 'top', label: t('group.tabs.top'), icon: 'mdi-trophy-variant-outline' },
    { value: 'members', label: t('group.tabs.members'), icon: 'mdi-account-multiple' },
  ])

  const topTypeOptions = computed<SegmentedOption<ItemType>[]>(() => [
    { value: 'ALBUM', label: t('library.types.albums'), icon: 'mdi-album' },
    { value: 'TRACK', label: t('library.types.tracks'), icon: 'mdi-music-note' },
  ])

  const confirmCopy = computed(() => {
    const name = group.data.value?.name ?? ''
    if (confirm.value === 'regenerate') return { title: t('group.regenerateTitle'), message: t('group.regenerateMessage'), action: t('group.regenerate') }
    if (confirm.value === 'delete') return { title: t('group.deleteTitle'), message: t('group.deleteMessage', { name }), action: t('group.delete') }
    return { title: t('group.leaveTitle'), message: isOwner.value ? t('group.leaveOwnerMessage', { name }) : t('group.leaveMessage', { name }), action: t('group.leave') }
  })

  function loadRanking (rankingCategory: RankingCategory, rankingPeriod: Period, page: number, limit: number) {
    return groupsApi.ranking(props.id, rankingCategory, rankingPeriod, { page, limit })
  }

  function loadFeed (page: number, limit: number) {
    return groupsApi.feed(props.id, { page, limit })
  }

  function loadGalera (page: number, limit: number) {
    return groupsApi.groupReviews(props.id, { page, limit })
  }

  function proposed (groupReview: GroupReview): void {
    tab.value = 'galera'
    void galeraList.value?.reset()
    toast.success(t('galera.proposed', { title: groupReview.item.title }))
    galera.contribute(groupReview)
  }

  function openExisting (groupReviewId: string): void {
    toast.info(t('galera.alreadyExists'))
    void router.push(groupReviewRoute(groupReviewId))
  }

  function inviteFriends (): void {
    void share.start({ kind: 'group', id: props.id }, t('group.inviteTitle'))
  }

  async function copyCode (): Promise<void> {
    const code = group.data.value?.inviteCode
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      toast.success(t('group.codeCopied', { code }))
    } catch {
      toast.error(t('share.copyFailed'))
    }
  }

  function saved (next: Group): void {
    group.data.value = next
    toast.success(t('group.saved'))
  }

  async function runConfirm (): Promise<void> {
    const action = confirm.value
    if (!action) return
    acting.value = true
    actionError.value = null
    try {
      if (action === 'regenerate') {
        group.data.value = await groupsApi.regenerateInvite(props.id)
        toast.success(t('group.regenerated'))
      } else if (action === 'delete') {
        await groupsApi.remove(props.id)
        toast.success(t('group.deleted'))
        await router.replace({ name: ROUTE.groups })
      } else {
        await groupsApi.leave(props.id)
        toast.success(t('group.left'))
        await router.replace({ name: ROUTE.groups })
      }
      confirm.value = null
    } catch (error) {
      actionError.value = errorMessage(error)
    } finally {
      acting.value = false
    }
  }

  async function removeMember (): Promise<void> {
    const member = memberToRemove.value
    if (!member) return
    acting.value = true
    actionError.value = null
    try {
      group.data.value = await groupsApi.removeMember(props.id, member.user.id)
      memberToRemove.value = null
      toast.success(t('group.removed', { name: member.user.fullName }))
    } catch (error) {
      actionError.value = errorMessage(error)
    } finally {
      acting.value = false
    }
  }

  useSeo(() => ({ title: group.data.value?.name ?? t('group.loading'), description: group.data.value?.description ?? t('groups.lead'), noindex: true }))
</script>

<style scoped>
.group-hero {
  position: relative;
  isolation: isolate;
  display: grid;
  justify-items: start;
  gap: 14px;
  padding: clamp(24px, 5vw, 56px);
  overflow: hidden;
  color: var(--group-ink);
  background: var(--group-bg);
  border-radius: var(--mx-radius-xl);
  animation: group-in var(--mx-spring-smooth-duration) var(--mx-spring-smooth) both;
}

.group-hero__blob {
  position: absolute;
  top: -30%;
  right: -8%;
  z-index: -1;
}

.group-hero__eyebrow {
  margin: 0;
  font-size: var(--mx-text-overline);
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.group-hero__title {
  margin: 0;
  font-size: var(--mx-text-display-xl);
  overflow-wrap: anywhere;
}

.group-hero__description {
  max-width: 60ch;
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 600;
  line-height: 1.55;
}

.group-hero__avatars {
  display: flex;
  margin: 0;
  padding: 0 0 0 10px;
  list-style: none;
}

.group-hero__avatars li {
  margin-left: -10px;
  animation: mx-pop-in var(--mx-spring-pop-duration) var(--mx-spring-pop) calc(200ms + var(--index, 0) * 70ms) both;
}

.group-hero__more {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  font-size: 0.875rem;
  font-weight: 900;
  color: var(--group-bg);
  background: var(--group-ink);
  border-radius: 50%;
}

.group-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.group__panel {
  min-width: 0;
}

.group__hint {
  margin: -6px 0 0;
  font-size: 0.9375rem;
}

.group__count {
  font-size: 0.875rem;
  font-weight: 800;
  white-space: nowrap;
  color: var(--mx-on-surface-muted);
}

.group__members {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.group__member {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--mx-surface);
  border-radius: var(--mx-radius-md);
}

.group__member-text {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.group__member-text span {
  overflow: hidden;
  font-size: 0.8125rem;
  color: var(--mx-on-surface-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group__role {
  padding: 4px 10px;
  font-size: 0.6875rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--mx-on-cta);
  background: var(--mx-cta);
  border-radius: var(--mx-radius-pill);
}

@keyframes group-in {
  from { transform: translate3d(0, 20px, 0) scale(0.98); }
  to { transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .group-hero,
  .group-hero__avatars li {
    animation: none;
  }
}
</style>
