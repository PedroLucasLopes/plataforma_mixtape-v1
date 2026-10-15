import {
  AVATAR_HOSTS,
  EMAIL_MAX_LENGTH,
  EMAIL_PATTERN,
  FULL_NAME_LENGTH,
  MAX_AGE_YEARS,
  MAX_AVATAR_URL_LENGTH,
  PASSWORD_EMAIL_FRAGMENT_MIN_LENGTH,
  PASSWORD_LENGTH,
  USERNAME_PATTERN,
  USERNAME_REPEATED_SYMBOLS,
} from '@/constants/validation'

export type AccountField = 'email' | 'username' | 'fullName' | 'birthDate' | 'password'

export const ERROR_FIELDS: Readonly<Record<string, AccountField>> = {
  INVALID_EMAIL: 'email',
  EMAIL_ALREADY_REGISTERED: 'email',
  INVALID_USERNAME: 'username',
  USERNAME_RESERVED: 'username',
  USERNAME_ALREADY_TAKEN: 'username',
  INVALID_FULL_NAME: 'fullName',
  INVALID_BIRTH_DATE: 'birthDate',
  UNDERAGE: 'birthDate',
  WEAK_PASSWORD: 'password',
  BREACHED_PASSWORD: 'password',
}

export type AvatarUrlProblem = 'url' | 'host'

export function avatarUrlProblem (value: string): AvatarUrlProblem | null {
  const text = value.trim()
  if (!text) {
    return null
  }
  let url: URL
  try {
    url = new URL(text)
  } catch {
    return 'url'
  }
  if (url.protocol !== 'https:' || url.username || url.password || text.length > MAX_AVATAR_URL_LENGTH) {
    return 'url'
  }
  const host = url.hostname.toLowerCase()
  return AVATAR_HOSTS.some(allowed => host === allowed || host.endsWith(`.${allowed}`)) ? null : 'host'
}

export const normalizeUsername = (value: string) => value.trim().toLowerCase().replace(/^@/, '').replace(/\s+/g, '')

export const normalizeFullName = (value: string) => value.trim().replace(/\s+/g, ' ')

export function isValidEmail (value: string) {
  const email = value.trim().toLowerCase()
  return email.length > 0 && email.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(email)
}

export function isValidUsername (value: string) {
  const username = normalizeUsername(value)
  return USERNAME_PATTERN.test(username) && !USERNAME_REPEATED_SYMBOLS.test(username)
}

export function isValidFullName (value: string) {
  const name = normalizeFullName(value)
  return name.length >= FULL_NAME_LENGTH.min && name.length <= FULL_NAME_LENGTH.max && /\p{L}/u.test(name)
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export function ageOn (value: string, today: Date = new Date()): number | null {
  const match = DATE_PATTERN.exec(value.trim())
  if (!match) {
    return null
  }
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null
  }
  if (date.getTime() > today.getTime()) {
    return null
  }
  let age = today.getUTCFullYear() - year
  const currentMonth = today.getUTCMonth() + 1
  if (currentMonth < month || (currentMonth === month && today.getUTCDate() < day)) {
    age -= 1
  }
  return age > MAX_AGE_YEARS ? null : age
}

export function isoDateYearsAgo (years: number, today: Date = new Date()): string {
  const date = new Date(Date.UTC(today.getUTCFullYear() - years, today.getUTCMonth(), today.getUTCDate()))
  return date.toISOString().slice(0, 10)
}

export interface PasswordChecks {
  withinLength: boolean
  mix: boolean
  personal: boolean
}

export function passwordChecks (password: string, context: { email: string, username: string }): PasswordChecks {
  const lowered = password.toLowerCase()
  const email = context.email.trim().toLowerCase()
  const username = normalizeUsername(context.username)
  const localPart = email.split('@', 1)[0] ?? ''
  const containsPersonal = (username.length > 0 && lowered.includes(username))
    || (email.length > 0 && lowered.includes(email))
    || (localPart.length >= PASSWORD_EMAIL_FRAGMENT_MIN_LENGTH && lowered.includes(localPart))
  return {
    withinLength: password.length >= PASSWORD_LENGTH.min && password.length <= PASSWORD_LENGTH.max,
    mix: /\p{L}/u.test(password) && /\p{N}/u.test(password),
    personal: password.length > 0 && !containsPersonal,
  }
}

export function passwordAccepted (checks: PasswordChecks): boolean {
  return checks.withinLength && checks.mix && checks.personal
}
