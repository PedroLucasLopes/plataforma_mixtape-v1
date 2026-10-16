<template>
  <MxReviewCard
    :author="reviewAuthor(review.author, labels.tierLabel(review.author.disc.tier, review.author.disc.label))"
    :body="review.body"
    :can-like="canLike"
    :created-at="review.createdAt"
    data-testid="review-item"
    :edited="review.edited"
    :group="reviewGroupTag(review)"
    :highlight="highlight"
    :item="reviewSubject(review.item)"
    :like-pending="pending"
    :liked="review.viewer?.liked ?? false"
    :likes="review.likes"
    :rating="review.rating"
    :to="reviewRoute(review.id)"
    :variant="variant"
    :visibility="reviewVisibility(review)"
    @like="emit('like', $event)"
  >
    <template #actions>
      <MxIconButton
        v-if="isPublic"
        data-testid="review-item-share"
        icon="mdi-share-variant"
        :label="t('review.share')"
        size="sm"
        variant="ghost"
        @click="shareReview"
      />

      <MxIconButton
        v-if="session.isAuthenticated && isPublic"
        data-testid="review-item-add-to-playlist"
        icon="mdi-playlist-plus"
        :label="t('review.addToPlaylist')"
        size="sm"
        variant="ghost"
        @click="addToPlaylist"
      />

      <MxIconButton
        v-if="canModerate"
        data-testid="review-item-delete"
        icon="mdi-delete-outline"
        :label="t('review.delete')"
        size="sm"
        variant="ghost"
        @click="emit('delete')"
      />
    </template>
  </MxReviewCard>
</template>

<script lang="ts" setup>
  import type { Review } from '@/types/api'
  import { MxIconButton, MxReviewCard } from '@pedrolucaslopes/mixtape-ui'
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useLabels } from '@/composables/useLabels'
  import { usePlaylistPickerStore } from '@/stores/playlistPicker'
  import { useSessionStore } from '@/stores/session'
  import { useShareStore } from '@/stores/share'
  import { reviewAuthor, reviewGroupTag, reviewRoute, reviewSubject, reviewVisibility } from '@/utils/items'

  const props = withDefaults(defineProps<{
    review: Review
    variant?: 'feed' | 'item' | 'full' | 'compact'
    pending?: boolean
    highlight?: boolean
  }>(), { variant: 'feed', pending: false, highlight: false })

  const emit = defineEmits<{ like: [liked: boolean], delete: [] }>()

  const { t } = useI18n()
  const labels = useLabels()
  const session = useSessionStore()
  const share = useShareStore()
  const picker = usePlaylistPickerStore()

  const isAuthor = computed(() => props.review.viewer?.isAuthor ?? props.review.author.id === session.user?.id)
  const canLike = computed(() => !isAuthor.value)
  const canModerate = computed(() => isAuthor.value || session.isAdmin)
  const isPublic = computed(() => props.review.visibility === 'PUBLIC')

  function shareReview (): void {
    void share.start({ kind: 'review', id: props.review.id }, t('review.shareTitle'))
  }

  function addToPlaylist (): void {
    void picker.start({
      kind: 'REVIEW',
      refId: props.review.id,
      label: t('review.playlistLabel', { title: props.review.item.title, author: props.review.author.username }),
    })
  }
</script>
