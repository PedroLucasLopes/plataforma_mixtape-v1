import type { PasswordRule } from '@pedrolucaslopes/mixtape-ui'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useI18n } from 'vue-i18n'
import { PASSWORD_LENGTH } from '@/constants/validation'
import { passwordAccepted, passwordChecks } from '@/utils/forms'

export function usePasswordRules (
  password: MaybeRefOrGetter<string>,
  context: MaybeRefOrGetter<{ email: string, username: string }>,
) {
  const { t } = useI18n()

  const checks = computed(() => passwordChecks(toValue(password), toValue(context)))

  const rules = computed<PasswordRule[]>(() => [
    { key: 'length', label: t('auth.passwordRules.length', { min: PASSWORD_LENGTH.min, max: PASSWORD_LENGTH.max }), passed: checks.value.withinLength },
    { key: 'mix', label: t('auth.passwordRules.mix'), passed: checks.value.mix },
    { key: 'personal', label: t('auth.passwordRules.personal'), passed: checks.value.personal },
  ])

  const accepted = computed(() => passwordAccepted(checks.value))

  return { rules, accepted }
}
