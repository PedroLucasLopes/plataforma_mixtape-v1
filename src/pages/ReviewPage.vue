<template>
  <PageState
    data-testid="page-review"
    :error="review.error.value"
    :loading="review.loading.value"
    :not-found="review.notFound.value"
    :not-found-description="t('review.notFoundDescription')"
    :not-found-title="t('review.notFound')"
    :ready="Boolean(review.data.value)"
    @retry="review.reload()"
  >
    <article v-if="review.data.value" class="page">
      <MxPageHero
        compact
        decoration="star"
        :duotone="duotone"
        :eyebrow="t('review.eyebrow', { username: review.data.value.author.username })"
        layout="split"
        :title="review.data.value.item.title"
      >
        <template #media>
          <RouterLink v-tilt="{ max: 8, glare: true }" class="hero-cover review-hero__cover" data-testid="page-review-cover" :to="itemRoute(review.data.value.item.type, review.data.value.item.id)">
            <MxCover
              priority
              :seed="review.data.value.item.id"
              :shape="review.data.value.item.type === 'ARTIST' ? 'circle' : 'square'"
              sizes="(max-width: 840px) 70vw, 360px"
              :src="review.data.value.item.coverUrl"
              :title="review.data.value.item.title"
              :vinyl="review.data.value.item.type === 'ALBUM'"
            />

            <span class="mx-sr-only">{{ t('review.openItem', { title: review.data.value.item.title }) }}</span>
          </RouterLink>
        </template>

        <template #subtitle>
          {{ subtitle }}
        </template>

        <template #story>
          <RouterLink class="review-hero__author" data-testid="page-review-author" :to="profileRoute(review.data.value.author.username)">
            <MxAvatar
              decorative
              :name="review.data.value.author.fullName"
              :seed="review.data.value.author.username"
              :size="52"
              :src="review.data.value.author.avatarUrl"
              :tier="review.data.value.author.disc.tier"
            />

            <span class="review-hero__author-text">
              <strong>{{ review.data.value.author.fullName }}</strong>
              <span>@{{ review.data.value.author.username }} · {{ labels.tierLabel(review.data.value.author.disc.tier, review.data.value.author.disc.label) }}</span>
            </span>
          </RouterLink>

          <div class="review-hero__rating">
            <MxRating size="xl" tone="ink" :value="review.data.value.rating" />
            <span class="review-hero__rating-text">{{ t('review.ratingOutOf', { rating: formatRatingValue(review.data.value.rating, locale) }) }}</span>
          </div>
        </template>

        <template #stats>
          <MxStat :label="t('review.likes')" size="md" :value="review.data.value.likes" />
        </template>

        <template #actions>
          <MxButton
            v-if="isAuthor && isRateable(review.data.value.item.type)"
            data-testid="page-review-edit"
            icon="mdi-pencil"
            :label="t('review.edit')"
            variant="ink"
            @click="edit"
          />

          <MxButton
            v-if="isPublic"
            data-testid="page-review-share"
            icon="mdi-share-variant"
            :label="t('review.share')"
            :variant="isAuthor ? 'ink-outline' : 'ink'"
            @click="shareReview"
          />

          <MxButton data-testid="page-review-open-item" :label="t('review.openItemShort')" :to="itemRoute(review.data.value.item.type, review.data.value.item.id)" variant="ink-outline" />
        </template>
      </MxPageHero>

      <div class="page-columns">
        <div class="page-columns__main">
          <div v-if="isAuthor && review.data.value.visibility === 'PRIVATE'" class="review__private" role="status">
            <VIcon aria-hidden="true" icon="mdi-lock-outline" size="20" />
            <p>{{ t('review.privateNotice') }}</p>

            <MxButton
              data-testid="page-review-publish"
              icon="mdi-earth"
              :label="t('review.publish')"
              :loading="publishing"
              size="sm"
              @click="publish"
            />
          </div>

          <ReviewItem
            :pending="likes.isPending(review.data.value.id)"
            :review="review.data.value"
            variant="full"
            @delete="confirmingDelete = true"
            @like="like"
          />

          <p class="review__dates muted">
            {{ t('review.publishedAt', { date: formatDate(review.data.value.createdAt, locale, { dateStyle: 'long', timeStyle: 'short' }) }) }}
            <template v-if="review.data.value.edited">
              · {{ t('review.editedAt', { date: formatDate(review.data.value.updatedAt, locale, { dateStyle: 'long', timeStyle: 'short' }) }) }}
            </template>
          </p>

          <section v-if="galeraReview.data.value" aria-labelledby="review-galera-title" class="panel-stack">
            <h2 id="review-galera-title" class="panel-title">{{ t('review.galeraTitle') }}</h2>

            <MxGroupReviewCard
              v-bind="galera.cardProps(galeraReview.data.value)"
              :highlight-id="review.data.value.id"
              @like="likeEntry"
            />
          </section>
        </div>

        <aside :aria-label="t('review.aboutItem')" class="page-columns__aside">
          <ItemStatsPanel v-if="isRateable(review.data.value.item.type)" :stats="itemStats.data.value" />

          <MxGlass v-if="isRateable(review.data.value.item.type)" class="panel-stack" data-testid="page-review-more" variant="panel">
            <h2 class="panel-title">{{ t('review.moreReviews', { title: review.data.value.item.title }) }}</h2>

            <MxSkeleton v-if="otherReviews.loading.value && !otherReviews.data.value" aria-hidden="true" height="200px" />

            <MxRotator
              v-else-if="others.length > 0"
              :interval="REVIEW_ROTATION_MS"
              :items="others"
              :label="t('review.moreReviews', { title: review.data.value.item.title })"
            >
              <template #default="{ item: other }">
                <ReviewItem
                  :pending="likes.isPending(other.id)"
                  :review="other"
                  variant="item"
                  @like="likeOther(other, $event)"
                />
              </template>
            </MxRotator>

            <p v-else-if="otherReviews.data.value" class="muted review__no-others">{{ t('review.noOtherReviews') }}</p>

            <MxButton
              append-icon="mdi-arrow-right"
              data-testid="page-review-all-reviews"
              :label="t('review.allReviews')"
              :to="itemRoute(review.data.value.item.type, review.data.value.item.id)"
              variant="glass"
            />
          </MxGlass>
        </aside>
      </div>

      <MxConfirmDialog
        v-model="confirmingDelete"
        :confirm-label="t('review.delete')"
        data-testid="page-review-delete-confirm"
        destructive
        :error="deleteError"
        :loading="deleting"
        :message="t('review.deleteMessage')"
        :title="t('review.deleteTitle')"
        @confirm="remove"
      />
    </article>
  </PageState>
</template>

<script lang="ts" setup>
  import type { Review } from '@/types/api'
  import {
    duotoneFor,
    formatDate,
    formatRatingValue,
    MxAvatar,
    MxButton,
    MxConfirmDialog,
    MxCover,
    MxGlass,
    MxGroupReviewCard,
    MxPageHero,
    MxRating,
    MxRotator,
    MxSkeleton,
    MxStat,
    toast,
    vTilt,
    yearOf,
  } from '@pedrolucaslopes/mixtape-ui'
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import ItemStatsPanel from '@/components/ItemStatsPanel.vue'
  import PageState from '@/components/PageState.vue'
  import ReviewItem from '@/components/ReviewItem.vue'
  import { useAsyncData } from '@/composables/useAsyncData'
  import { useCatalogCards } from '@/composables/useCatalogCards'
  import { useGroupReviewCards, withEntry } from '@/composables/useGroupReviewCards'
  import { useLabels } from '@/composables/useLabels'
  import { useLikes } from '@/composables/useLikes'
  import { useSeo } from '@/composables/useSeo'
  import { OTHER_REVIEWS_ROTATION, REVIEW_PREVIEW_LENGTH, REVIEW_ROTATION_MS } from '@/constants/api'
  import { errorMessage } from '@/services/http'
  import { groupReviewsApi, reviewsApi } from '@/services/mixtape'
  import { useComposerStore } from '@/stores/composer'
  import { useSessionStore } from '@/stores/session'
  import { useShareStore } from '@/stores/share'
  import { isRateable, itemRoute, profileRoute } from '@/utils/items'

  const props = defineProps<{ id: string }>()

  const { t, locale } = useI18n()
  const router = useRouter()
  const labels = useLabels()
  const cards = useCatalogCards()
  const session = useSessionStore()
  const composer = useComposerStore()
  const share = useShareStore()

  const review = useAsyncData(() => reviewsApi.get(props.id), { watch: () => [props.id, composer.version, session.isAuthenticated] })
  const itemStats = useAsyncData(
    async () => {
      const item = review.data.value?.item
      return item && isRateable(item.type) ? reviewsApi.stats(item.type, item.id) : null
    },
    { watch: () => review.data.value?.item.id },
  )
  const galeraReview = useAsyncData(
    async () => {
      const link = review.data.value?.groupReview
      return link ? groupReviewsApi.get(link.id) : null
    },
    { watch: () => [review.data.value?.groupReview?.id, composer.version] },
  )
  const likes = useLikes<Review>()
  const galera = useGroupReviewCards()

  const confirmingDelete = ref(false)
  const deleting = ref(false)
  const deleteError = ref<string | null>(null)
  const publishing = ref(false)

  const duotone = computed(() => duotoneFor(review.data.value?.item.id ?? props.id))
  const isAuthor = computed(() => review.data.value?.viewer?.isAuthor ?? (review.data.value?.author.id === session.user?.id))
  const isPublic = computed(() => review.data.value?.visibility === 'PUBLIC')

  const subtitle = computed(() => {
    const item = review.data.value?.item
    if (!item) return ''
    return cards.join([item.artistName, item.type === 'TRACK' ? item.albumTitle : null, yearOf(item.releaseDate), t(`review.kinds.${item.type}`)]) ?? ''
  })

  const otherReviews = useAsyncData(
    async () => {
      const item = review.data.value?.item
      if (!item || !isRateable(item.type)) return null
      return reviewsApi.forItem(item.type, item.id, 'popular', { page: 1, limit: OTHER_REVIEWS_ROTATION })
    },
    { watch: () => [review.data.value?.item.id, composer.version] },
  )

  const others = computed(() => (otherReviews.data.value?.items ?? []).filter(other => other.id !== props.id))

  function likeOther (other: Review, liked: boolean): void {
    void likes.toggle(other, liked, next => {
      const page = otherReviews.data.value
      if (page) otherReviews.data.value = { ...page, items: page.items.map(item => (item.id === next.id ? next : item)) }
    })
  }

  function like (liked: boolean): void {
    const current = review.data.value
    if (!current) return
    void likes.toggle(current, liked, next => {
      review.data.value = next
    })
  }

  function likeEntry (entryId: string, liked: boolean): void {
    const current = galeraReview.data.value
    if (!current) return
    galera.like(current, entryId, liked, (entry: Review) => {
      if (galeraReview.data.value) galeraReview.data.value = withEntry(galeraReview.data.value, entry)
      if (entry.id === review.data.value?.id) review.data.value = entry
    })
  }

  async function publish (): Promise<void> {
    const current = review.data.value
    if (!current) return
    publishing.value = true
    try {
      review.data.value = await reviewsApi.setVisibility(current.id, 'PUBLIC')
      toast.success(t('review.published'))
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      publishing.value = false
    }
  }

  function edit (): void {
    const current = review.data.value
    if (!current || !isRateable(current.item.type)) return
    void composer.start({
      type: current.item.type,
      id: current.item.id,
      title: current.item.title,
      artist: current.item.artistName,
      cover: current.item.coverUrl,
      year: yearOf(current.item.releaseDate),
    })
  }

  function shareReview (): void {
    void share.start({ kind: 'review', id: props.id }, t('review.shareTitle'))
  }

  async function remove (): Promise<void> {
    const current = review.data.value
    if (!current) return
    deleting.value = true
    deleteError.value = null
    try {
      await reviewsApi.remove(current.id)
      confirmingDelete.value = false
      toast.success(t('review.deleted'))
      await router.replace(itemRoute(current.item.type, current.item.id))
    } catch (error) {
      deleteError.value = errorMessage(error)
    } finally {
      deleting.value = false
    }
  }

  useSeo(() => {
    const value = review.data.value
    if (!value) return { title: review.notFound.value ? t('review.notFound') : t('review.loading'), noindex: review.notFound.value }
    const body = value.body?.trim()
    return {
      title: t('review.seoTitle', { username: value.author.username, title: value.item.title }),
      description: body
        ? body.slice(0, REVIEW_PREVIEW_LENGTH)
        : t('review.seoDescription', { username: value.author.username, title: value.item.title, rating: formatRatingValue(value.rating, locale.value) }),
      image: value.item.coverUrl,
      type: 'article',
    }
  })
</script>

<style scoped>
.review-hero__cover {
  display: block;
  border-radius: var(--mx-radius-md);
}

.review-hero__cover:focus-visible {
  outline: 3px solid var(--mx-hero-ink);
  outline-offset: 4px;
}

.review-hero__author {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding: 6px 16px 6px 6px;
  color: inherit;
  text-decoration: none;
  background: color-mix(in srgb, var(--mx-hero-ink) 12%, transparent);
  border-radius: var(--mx-radius-pill);
  transition: transform var(--mx-spring-bouncy-duration) var(--mx-spring-bouncy);
}

.review-hero__author:hover {
  transform: translateY(-2px);
}

.review-hero__author:focus-visible {
  outline: 3px solid var(--mx-hero-ink);
  outline-offset: 2px;
}

.review-hero__author-text {
  display: grid;
  line-height: 1.25;
}

.review-hero__author-text span {
  font-size: 0.875rem;
  opacity: 0.85;
}

.review-hero__rating {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.review-hero__rating-text {
  font-family: var(--mx-font-display);
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 800;
  letter-spacing: var(--mx-tracking-title);
}

.review__private {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--mx-surface-variant);
  border-radius: var(--mx-radius-md);
}

.review__private p {
  margin: 0;
  font-weight: 600;
  line-height: 1.5;
}

@media (max-width: 600px) {
  .review__private {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .review__private :deep(.mx-button) {
    grid-column: 1 / -1;
    justify-self: start;
  }
}

.review__dates {
  margin: -8px 0 0;
  font-size: 0.875rem;
}

.review__no-others {
  margin: 0;
  line-height: 1.5;
}

@media (prefers-reduced-motion: reduce) {
  .review-hero__author,
  .review-hero__author:hover {
    transition: none;
    transform: none;
  }
}
</style>
