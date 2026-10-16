import {
  AVATAR_HOSTS,
  EMAIL_MAX_LENGTH,
  EMAIL_PATTERN,
  FULL_NAME_LENGTH,
  MAX_AGE_YEARS,
  MAX_AVATAR_URL_LENGTH,
  PASSWORD_LENGTH,
  PASSWORD_PERSONAL_FRAGMENT_MIN_LENGTH,
  PASSWORD_PREDICTABLE_RUN_MIN_LENGTH,
  PASSWORD_SERVICE_WORDS,
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

export interface PasswordOwner {
  email: string
  username: string
  fullName: string
}

export interface PasswordChecks {
  withinLength: boolean
  mix: boolean
  personal: boolean
  unpredictable: boolean
}

const foldForComparison = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

function personalFragments (owner: PasswordOwner): string[] {
  const email = foldForComparison(owner.email.trim())
  const emailLocalPart = email.split('@', 1)[0] ?? ''
  const nameWords = foldForComparison(owner.fullName).split(/\P{L}+/u)
  const longEnough = [emailLocalPart, ...nameWords].filter(word => word.length >= PASSWORD_PERSONAL_FRAGMENT_MIN_LENGTH)
  return [foldForComparison(normalizeUsername(owner.username)), email, ...longEnough, ...PASSWORD_SERVICE_WORDS]
    .filter(fragment => fragment.length > 0)
}

function longestPredictableRun (text: string): number {
  let longest = Math.min(text.length, 1)
  let current = 1
  for (let index = 1; index < text.length; index++) {
    const previous = text[index - 1]!
    const next = text[index]!
    const sameKind = (/\d/.test(previous) && /\d/.test(next)) || (/[a-z]/.test(previous) && /[a-z]/.test(next))
    const repeated = next === previous
    const consecutive = sameKind && Math.abs((next.codePointAt(0) ?? 0) - (previous.codePointAt(0) ?? 0)) === 1
    current = repeated || consecutive ? current + 1 : 1
    longest = Math.max(longest, current)
  }
  return longest
}

export function isPredictablePassword (password: string): boolean {
  const folded = foldForComparison(password)
  return longestPredictableRun(folded) >= Math.max(PASSWORD_PREDICTABLE_RUN_MIN_LENGTH, Math.ceil(folded.length / 2))
}

export function passwordChecks (password: string, owner: PasswordOwner): PasswordChecks {
  const folded = foldForComparison(password)
  return {
    withinLength: password.length >= PASSWORD_LENGTH.min && password.length <= PASSWORD_LENGTH.max,
    mix: /\p{L}/u.test(password) && /\p{N}/u.test(password),
    personal: password.length > 0 && !personalFragments(owner).some(fragment => folded.includes(fragment)),
    unpredictable: password.length > 0 && !isPredictablePassword(password),
  }
}

export function passwordAccepted (checks: PasswordChecks): boolean {
  return checks.withinLength && checks.mix && checks.personal && checks.unpredictable
}
