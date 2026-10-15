import type { Period } from '@/types/api'
import type { SegmentedOption } from '@pedrolucaslopes/mixtape-ui'
import { formatPartialDate } from '@pedrolucaslopes/mixtape-ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PERIODS } from '@/constants/filters'

export function usePeriod () {
  const { t, locale } = useI18n()

  const periodOptions = computed<SegmentedOption<Period>[]>(() => PERIODS.map(value => ({
    value,
    label: t(`filters.periods.${value}`),
  })))

  const formatPeriod = (period: string | null | undefined) => formatPartialDate(period, locale.value) ?? ''

  return { periodOptions, formatPeriod }
}
