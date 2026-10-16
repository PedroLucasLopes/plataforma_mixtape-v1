import type { PasswordRule } from '@pedrolucaslopes/mixtape-ui'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useI18n } from 'vue-i18n'
import { PASSWORD_LENGTH } from '@/constants/validation'
import { passwordAccepted, passwordChecks, type PasswordOwner } from '@/utils/forms'

export function usePasswordRules (password: MaybeRefOrGetter<string>, owner: MaybeRefOrGetter<PasswordOwner>) {
  const { t } = useI18n()

  const checks = computed(() => passwordChecks(toValue(password), toValue(owner)))

  const rules = computed<PasswordRule[]>(() => [
    { key: 'length', label: t('auth.passwordRules.length', { min: PASSWORD_LENGTH.min, max: PASSWORD_LENGTH.max }), passed: checks.value.withinLength },
    { key: 'mix', label: t('auth.passwordRules.mix'), passed: checks.value.mix },
    { key: 'personal', label: t('auth.passwordRules.personal'), passed: checks.value.personal },
    { key: 'unpredictable', label: t('auth.passwordRules.unpredictable'), passed: checks.value.unpredictable },
  ])

  const accepted = computed(() => passwordAccepted(checks.value))

  return { rules, accepted }
}
