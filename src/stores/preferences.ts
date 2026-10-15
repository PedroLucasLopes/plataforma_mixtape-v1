import { useThemePreference } from '@pedrolucaslopes/mixtape-ui'
import { defineStore } from 'pinia'

export const usePreferencesStore = defineStore('preferences', () => {
  const theme = useThemePreference()

  return {
    themeMode: theme.mode,
    isDark: theme.isDark,
    setThemeMode: theme.setMode,
  }
})
