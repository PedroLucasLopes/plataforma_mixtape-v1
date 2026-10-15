import type { DuotoneName } from '@pedrolucaslopes/mixtape-ui'

export const BADGE_ICONS: Readonly<Record<string, string>> = {
  CRITIC: 'mdi-feather',
  CROWD_FAVORITE: 'mdi-heart-multiple',
  HITMAKER: 'mdi-fire',
  ECLECTIC: 'mdi-palette',
  CURATOR: 'mdi-playlist-star',
  SOCIAL: 'mdi-account-group',
  PIONEER: 'mdi-flag-variant',
  MARATHONER: 'mdi-run-fast',
  AWARD_WINNER: 'mdi-trophy',
}

export const DEFAULT_BADGE_ICON = 'mdi-star-four-points'

export const AWARD_STYLE: Readonly<Record<string, { icon: string, duotone: DuotoneName }>> = {
  CRITIC_OF_THE_MONTH: { icon: 'mdi-feather', duotone: 'violet' },
  MOST_ACTIVE_OF_THE_MONTH: { icon: 'mdi-lightning-bolt', duotone: 'lime' },
  REVIEW_OF_THE_MONTH: { icon: 'mdi-message-star', duotone: 'pink' },
  ROOKIE_OF_THE_MONTH: { icon: 'mdi-rocket-launch', duotone: 'green' },
}

export const SCORE_REASON_ICONS: Readonly<Record<string, string>> = {
  REVIEW_CREATED: 'mdi-album',
  REVIEW_WRITTEN: 'mdi-text-long',
  PIONEER_REVIEW: 'mdi-flag-variant',
  LIKE_RECEIVED: 'mdi-heart',
}

export const AWARD_HISTORY_MONTHS = 12
