export const EMAIL_MAX_LENGTH = 254
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._]{1,28}[a-z0-9]$/
export const USERNAME_REPEATED_SYMBOLS = /[._]{2}/
export const USERNAME_MAX_LENGTH = 30
export const FULL_NAME_LENGTH = { min: 2, max: 100 } as const
export const PASSWORD_LENGTH = { min: 8, max: 128 } as const
export const PASSWORD_PERSONAL_FRAGMENT_MIN_LENGTH = 4
export const PASSWORD_PREDICTABLE_RUN_MIN_LENGTH = 4
export const PASSWORD_SERVICE_WORDS = ['mixtape'] as const
export const DEFAULT_MIN_USER_AGE = 13
export const MAX_AGE_YEARS = 120

export const MAX_BIO_LENGTH = 500
export const MAX_AVATAR_URL_LENGTH = 500
export const AVATAR_HOSTS = [
  'gravatar.com',
  'avatars.githubusercontent.com',
  'lh3.googleusercontent.com',
  'i.imgur.com',
  'images.unsplash.com',
  'upload.wikimedia.org',
] as const
export const MAX_FAVORITE_GENRES = 10

export const SEARCH_TEXT_LENGTH = { min: 2, max: 200 } as const
export const MAX_REVIEW_BODY_LENGTH = 5000

export const GROUP_NAME_LENGTH = { min: 3, max: 60 } as const
export const MAX_GROUP_DESCRIPTION_LENGTH = 280
export const INVITE_CODE_PATTERN = /^[A-Z0-9]{6,16}$/i
export const INVITE_INPUT_MAX_LENGTH = 200

export const PLAYLIST_TITLE_LENGTH = { min: 1, max: 100 } as const
export const MAX_PLAYLIST_DESCRIPTION_LENGTH = 1000
export const MAX_PLAYLIST_NOTE_LENGTH = 280

export const MBID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const AWARD_PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/
