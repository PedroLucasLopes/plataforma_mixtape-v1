import { ROUTE } from '@/router/routes'

/** Telas de entrada: nunca são destino de volta depois do login (dariam volta em círculo). */
export const AUTH_SCREENS = ['/login', '/register'] as const

export interface NavEntry {
  key: string
  label: string
  route: string
  icon: string
  activeIcon?: string
  auth?: boolean
}

export const MAIN_NAV: readonly NavEntry[] = [
  { key: 'home', label: 'nav.home', route: ROUTE.home, icon: 'mdi-home-outline' },
  { key: 'charts', label: 'nav.charts', route: ROUTE.charts, icon: 'mdi-chart-box-outline' },
  { key: 'reviews', label: 'nav.reviews', route: ROUTE.reviews, icon: 'mdi-message-text-outline' },
  { key: 'rankings', label: 'nav.rankings', route: ROUTE.rankings, icon: 'mdi-podium' },
  { key: 'awards', label: 'nav.awards', route: ROUTE.awards, icon: 'mdi-trophy-outline' },
  { key: 'playlists', label: 'nav.playlists', route: ROUTE.playlists, icon: 'mdi-playlist-music' },
  { key: 'groups', label: 'nav.groups', route: ROUTE.groups, icon: 'mdi-account-group-outline', auth: true },
]

export const MENU_EXTRA_NAV: readonly NavEntry[] = [
  { key: 'how-it-works', label: 'nav.howItWorks', route: ROUTE.howItWorks, icon: 'mdi-help-circle-outline' },
]

export const TAB_NAV: readonly NavEntry[] = [
  { key: 'home', label: 'nav.home', route: ROUTE.home, icon: 'mdi-home-outline', activeIcon: 'mdi-home' },
  { key: 'search', label: 'nav.search', route: ROUTE.search, icon: 'mdi-magnify' },
  { key: 'charts', label: 'nav.charts', route: ROUTE.charts, icon: 'mdi-chart-box-outline', activeIcon: 'mdi-chart-box' },
  { key: 'profile', label: 'nav.profile', route: ROUTE.myProfile, icon: 'mdi-account-circle-outline', activeIcon: 'mdi-account-circle' },
]

export const USER_MENU: readonly NavEntry[] = [
  { key: 'profile', label: 'nav.myProfile', route: ROUTE.myProfile, icon: 'mdi-account-circle-outline' },
  { key: 'library', label: 'nav.myLibrary', route: ROUTE.myLibrary, icon: 'mdi-bookshelf' },
  { key: 'groups', label: 'nav.groups', route: ROUTE.groups, icon: 'mdi-account-group-outline' },
  { key: 'settings', label: 'nav.settings', route: ROUTE.settings, icon: 'mdi-cog-outline' },
]

export const ADMIN_MENU: NavEntry = { key: 'admin', label: 'nav.admin', route: ROUTE.admin, icon: 'mdi-shield-crown-outline' }

/** Teto do callback da View Transition entre páginas: passou disso, a página nova entra sem animação. */
export const VIEW_TRANSITION_UPDATE_TIMEOUT_MS = 1500
