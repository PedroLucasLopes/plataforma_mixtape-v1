<template>
  <PageState
    data-testid="page-group-review"
    :error="groupReview.error.value"
    :loading="groupReview.loading.value"
    :not-found="groupReview.notFound.value"
    :not-found-description="t('galera.notFoundDescription')"
    :not-found-title="t('galera.notFound')"
    :ready="Boolean(groupReview.data.value)"
    @retry="groupReview.reload()"
  >
    <article v-if="groupReview.data.value" class="page">
      <MxPageHero
        compact
        decoration="star"
        :duotone="duotone"
        :eyebrow="t('galera.eyebrow', { group: groupReview.data.value.group.name })"
        layout="split"
        :title="groupReview.data.value.item.title"
      >
        <template #media>
          <RouterLink v-tilt="{ max: 8, glare: true }" class="hero-cover galera-hero__cover" data-testid="page-group-review-cover" :to="itemRoute(groupReview.data.value.item.type, groupReview.data.value.item.id)">
            <MxCover
              priority
              :seed="groupReview.data.value.item.id"
              sizes="(max-width: 840px) 70vw, 360px"
              :src="groupReview.data.value.item.coverUrl"
              :title="groupReview.data.value.item.title"
              :vinyl="groupReview.data.value.item.type === 'ALBUM'"
            />

            <span class="mx-sr-only">{{ t('review.openItem', { title: groupReview.data.value.item.title }) }}</span>
          </RouterLink>
        </template>

        <template #subtitle>
          {{ subtitle }}
        </template>

        <template #story>
          <div class="galera-hero__rating">
            <MxRating size="xl" tone="ink" :value="groupReview.data.value.averageRating" />

            <span class="galera-hero__rating-text">
              {{ groupReview.data.value.averageRating === null ? t('galera.noAverage') : t('galera.average', { rating: formatRatingValue(groupReview.data.value.averageRating, locale) }) }}
            </span>
          </div>
        </template>

        <template #stats>
          <MxStat :label="t('galera.entriesStat')" size="md" :value="groupReview.data.value.entries.length" />
          <MxStat :label="t('galera.membersStat')" size="md" :value="groupReview.data.value.group.membersCount" />
        </template>

        <template #actions>
          <template v-if="viewer?.isMember">
            <MxButton
              v-if="!viewer.existingReview?.inOtherGroupReview"
              data-testid="page-group-review-edit-mine"
              :icon="viewer.entryId ? 'mdi-pencil' : 'mdi-album'"
              :label="viewer.entryId ? t('galera.editMine') : t('galera.rateMine')"
              variant="ink"
              @click="galera.contribute(groupReview.data.value)"
            />

            <MxButton
              data-testid="page-group-review-open-group"
              icon="mdi-account-group"
              :label="t('galera.openGroup')"
              :to="groupRoute(groupReview.data.value.group.id)"
              variant="ink-outline"
            />

            <MxButton
              v-if="viewer.canCancel"
              data-testid="page-group-review-cancel"
              icon="mdi-close"
              :label="t('galera.cancel')"
              variant="ink-outline"
              @click="confirmingCancel = true"
            />
          </template>

          <MxButton
            v-if="isPublic"
            data-testid="page-group-review-copy-link"
            icon="mdi-link-variant"
            :label="t('galera.copyLink')"
            :variant="viewer?.isMember ? 'ink-outline' : 'ink'"
            @click="copyLink"
          />

          <MxButton data-testid="page-group-review-open-item" :label="t('review.openItemShort')" :to="itemRoute(groupReview.data.value.item.type, groupReview.data.value.item.id)" variant="ink-outline" />
        </template>
      </MxPageHero>

      <div class="page-columns">
        <div class="page-columns__main">
          <MxGroupReviewCard v-bind="galera.cardProps(groupReview.data.value)" variant="full" @like="like" />

          <p v-if="viewer?.existingReview?.inOtherGroupReview" class="muted">{{ t('galera.inOtherGroup') }}</p>
        </div>

        <aside :aria-label="t('review.aboutItem')" class="page-columns__aside">
          <ItemStatsPanel v-if="isRateable(groupReview.data.value.item.type)" :stats="itemStats.data.value" />
        </aside>
      </div>

      <MxConfirmDialog
        v-model="confirmingCancel"
        :confirm-label="t('galera.cancel')"
        data-testid="page-group-review-cancel-confirm"
        destructive
        :error="cancelError"
        :loading="cancelling"
        :message="t('galera.cancelMessage', { title: groupReview.data.value.item.title })"
        :title="t('galera.cancelTitle')"
        @confirm="cancel"
      />
    </article>
  </PageState>
</template>

<script lang="ts" setup>
  import type { Review } from '@/types/api'
  import {
    duotoneFor,
    formatRatingValue,
    MxButton,
    MxConfirmDialog,
    MxCover,
    MxGroupReviewCard,
    MxPageHero,
    MxRating,
    MxStat,
    toast,
    vTilt,
    yearOf,
  } from '@pedrolucaslopes/mixtape-ui'
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import ItemStatsPanel from '@/components/ItemStatsPanel.vue'
  import PageState from '@/components/PageState.vue'
  import { useAsyncData } from '@/composables/useAsyncData'
  import { useCatalogCards } from '@/composables/useCatalogCards'
  import { useGroupReviewCards, withEntry } from '@/composables/useGroupReviewCards'
  import { useSeo } from '@/composables/useSeo'
  import { errorMessage } from '@/services/http'
  import { groupReviewsApi, reviewsApi } from '@/services/mixtape'
  import { useComposerStore } from '@/stores/composer'
  import { useSessionStore } from '@/stores/session'
  import { groupRoute, isRateable, itemRoute } from '@/utils/items'

  const props = defineProps<{ id: string }>()

  const { t, locale } = useI18n()
  const router = useRouter()
  const cards = useCatalogCards()
  const session = useSessionStore()
  const composer = useComposerStore()
  const galera = useGroupReviewCards()

  const groupReview = useAsyncData(() => groupReviewsApi.get(props.id), { watch: () => [props.id, session.isAuthenticated] })
  const itemStats = useAsyncData(
    async () => {
      const item = groupReview.data.value?.item
      return item && isRateable(item.type) ? reviewsApi.stats(item.type, item.id) : null
    },
    { watch: () => groupReview.data.value?.item.id },
  )

  const confirmingCancel = ref(false)
  const cancelling = ref(false)
  const cancelError = ref<string | null>(null)

  watch(() => composer.version, () => {
    const saved = composer.savedGroupReview
    if (saved?.id === props.id) groupReview.data.value = saved
    else void groupReview.reload()
  })

  const viewer = computed(() => groupReview.data.value?.viewer ?? null)
  const isPublic = computed(() => groupReview.data.value?.group.visibility === 'PUBLIC')
  const duotone = computed(() => duotoneFor(groupReview.data.value?.item.id ?? props.id))

  const subtitle = computed(() => {
    const item = groupReview.data.value?.item
    if (!item) return ''
    return cards.join([item.artistName, item.type === 'TRACK' ? item.albumTitle : null, yearOf(item.releaseDate), t(`review.kinds.${item.type}`)]) ?? ''
  })

  function like (entryId: string, liked: boolean): void {
    const current = groupReview.data.value
    if (!current) return
    galera.like(current, entryId, liked, (entry: Review) => {
      if (groupReview.data.value) groupReview.data.value = withEntry(groupReview.data.value, entry)
    })
  }

  async function copyLink (): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success(t('galera.linkCopied'))
    } catch {
      toast.error(t('share.copyFailed'))
    }
  }

  async function cancel (): Promise<void> {
    const current = groupReview.data.value
    if (!current) return
    cancelling.value = true
    cancelError.value = null
    try {
      await groupReviewsApi.cancel(current.id)
      confirmingCancel.value = false
      toast.success(t('galera.cancelled'))
      await router.replace(groupRoute(current.group.id))
    } catch (error) {
      cancelError.value = errorMessage(error)
    } finally {
      cancelling.value = false
    }
  }

  useSeo(() => {
    const value = groupReview.data.value
    if (!value) return { title: groupReview.notFound.value ? t('galera.notFound') : t('galera.loading'), noindex: true }
    return {
      title: t('galera.seoTitle', { group: value.group.name, title: value.item.title }),
      description: t('galera.seoDescription', { group: value.group.name, title: value.item.title, count: value.entries.length }),
      image: value.item.coverUrl,
      noindex: true,
    }
  })
</script>

<style scoped>
.galera-hero__cover {
  display: block;
  border-radius: var(--mx-radius-md);
}

.galera-hero__cover:focus-visible {
  outline: 3px solid var(--mx-hero-ink);
  outline-offset: 4px;
}

.galera-hero__rating {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.galera-hero__rating-text {
  font-family: var(--mx-font-display);
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 800;
  letter-spacing: var(--mx-tracking-title);
}
</style>
