import { formatCompactNumber } from '@pedrolucaslopes/mixtape-ui'
import { useI18n } from 'vue-i18n'
import { LISTENERS_SOURCE } from '@/constants/catalog'

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')

interface ChartListeners {
  listenerCount: number | null
  monthlyListeners?: { count: number, month: string } | null
}

export function useLabels () {
  const { t, te, locale } = useI18n()

  const translated = (key: string, fallback: string) => (te(key) ? t(key) : fallback)

  const tierLabel = (tier: string, fallback = tier) => translated(`gamification.tiers.${tier}`, fallback)

  const badgeName = (code: string, fallback = code) => translated(`gamification.badges.${code}.name`, fallback)

  const badgeDescription = (code: string, fallback = '') => translated(`gamification.badges.${code}.description`, fallback)

  const badgeTierName = (tier: number, fallback: string | null | undefined) =>
    translated(`gamification.badgeTiers.${tier}`, fallback ?? String(tier))

  const reasonLabel = (reason: string, fallback = reason) => translated(`gamification.reasons.${reason}`, fallback)

  const metricLabel = (metric: string) => translated(`gamification.metrics.${metric}`, metric)

  const awardName = (category: string, fallback = category) => translated(`gamification.awards.${category}.name`, fallback)

  const awardDescription = (category: string, fallback = '') =>
    translated(`gamification.awards.${category}.description`, fallback)

  const releaseType = (primary: string | null | undefined, secondaries: readonly string[] = []) => {
    const base = primary ? translated(`catalog.releaseTypes.${slug(primary)}`, primary) : t('catalog.releaseTypes.other')
    const extras = secondaries.map(type => translated(`catalog.secondaryTypes.${slug(type)}`, type))
    return [base, ...extras].join(' · ')
  }

  const releaseStatus = (status: string) => translated(`catalog.releaseStatus.${slug(status)}`, status)

  const releaseTypeCount = (type: string, count: number) => {
    const key = `catalog.releaseTypeCounts.${slug(type)}`
    const formatted = new Intl.NumberFormat(locale.value).format(count)
    return te(key) ? t(key, { count, formatted }) : `${formatted} ${type}`
  }

  const artistType = (type: string | null | undefined) =>
    type ? translated(`catalog.artistTypes.${slug(type)}`, type) : null

  const gender = (value: string | null | undefined) =>
    value ? translated(`catalog.genders.${slug(value)}`, value) : null

  const creditRole = (role: string) => translated(`catalog.roles.${slug(role)}`, role)

  const region = (code: string | null | undefined) => {
    if (!code) {
      return null
    }
    try {
      return new Intl.DisplayNames([locale.value], { type: 'region' }).of(code) ?? code
    } catch {
      return code
    }
  }

  const language = (code: string | null | undefined) => {
    if (!code) {
      return null
    }
    try {
      return new Intl.DisplayNames([locale.value], { type: 'language' }).of(code) ?? code
    } catch {
      return code
    }
  }

  const period = (value: string) => translated(`filters.periods.${value}`, value)

  const chartListeners = (entry: ChartListeners) => {
    const monthly = entry.monthlyListeners
    if (monthly) {
      const [year, month] = monthly.month.split('-').map(Number)
      const name = new Intl.DateTimeFormat(locale.value, { month: 'long', timeZone: 'UTC' })
        .format(new Date(Date.UTC(year!, month! - 1, 15)))
      return t('charts.monthlyListeners', { count: monthly.count, formatted: formatCompactNumber(monthly.count, locale.value), month: name })
    }
    return entry.listenerCount === null
      ? null
      : t('charts.allTimeListeners', { count: entry.listenerCount, formatted: formatCompactNumber(entry.listenerCount, locale.value) })
  }

  const listeners = (count: number | null | undefined) =>
    count === null || count === undefined
      ? null
      : t('catalog.listenersFrom', { count, formatted: formatCompactNumber(count, locale.value), source: LISTENERS_SOURCE })

  return {
    listeners,
    tierLabel,
    badgeName,
    badgeDescription,
    badgeTierName,
    reasonLabel,
    metricLabel,
    awardName,
    awardDescription,
    releaseType,
    releaseStatus,
    releaseTypeCount,
    artistType,
    gender,
    creditRole,
    region,
    language,
    period,
    chartListeners,
  }
}
