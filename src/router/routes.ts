import type { RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    auth?: 'required' | 'guest'
    admin?: boolean
    tab?: 'home' | 'search' | 'charts' | 'profile'
    nav?: string
    wide?: boolean
  }
}

export const ROUTE = {
  home: 'home',
  search: 'search',
  album: 'album',
  track: 'track',
  artist: 'artist',
  charts: 'charts',
  reviews: 'reviews',
  review: 'review',
  profile: 'profile',
  library: 'library',
  userPlaylists: 'user-playlists',
  playlists: 'playlists',
  playlist: 'playlist',
  rankings: 'rankings',
  awards: 'awards',
  howItWorks: 'how-it-works',
  groupInvite: 'group-invite',
  groups: 'groups',
  group: 'group',
  groupReview: 'group-review',
  settings: 'settings',
  account: 'account',
  admin: 'admin',
  login: 'login',
  register: 'register',
  forgotPassword: 'forgot-password',
  resetPassword: 'reset-password',
  deleteAccount: 'delete-account',
  privacy: 'privacy',
  terms: 'terms',
  myProfile: 'my-profile',
  myLibrary: 'my-library',
  notFound: 'not-found',
} as const

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    children: [
      { path: '', name: ROUTE.home, component: () => import('@/pages/HomePage.vue'), meta: { tab: 'home', nav: 'home' } },
      { path: 'search', name: ROUTE.search, component: () => import('@/pages/SearchPage.vue'), meta: { tab: 'search', nav: 'search' } },
      { path: 'albums/:id', name: ROUTE.album, component: () => import('@/pages/AlbumPage.vue'), props: true },
      { path: 'tracks/:id', name: ROUTE.track, component: () => import('@/pages/TrackPage.vue'), props: true },
      { path: 'artists/:id', name: ROUTE.artist, component: () => import('@/pages/ArtistPage.vue'), props: true },
      { path: 'charts', name: ROUTE.charts, component: () => import('@/pages/ChartsPage.vue'), meta: { tab: 'charts', nav: 'charts' } }, { path: 'reviews', name: ROUTE.reviews, component: () => import('@/pages/ReviewsFeedPage.vue'), meta: { nav: 'reviews' } },
      { path: 'reviews/:id', name: ROUTE.review, component: () => import('@/pages/ReviewPage.vue'), props: true },
      { path: 'u/:username', name: ROUTE.profile, component: () => import('@/pages/ProfilePage.vue'), props: true },
      { path: 'u/:username/library', name: ROUTE.library, component: () => import('@/pages/LibraryPage.vue'), props: true },
      { path: 'u/:username/playlists', name: ROUTE.userPlaylists, component: () => import('@/pages/UserPlaylistsPage.vue'), props: true },
      { path: 'playlists', name: ROUTE.playlists, component: () => import('@/pages/PlaylistsPage.vue'), meta: { nav: 'playlists' } },
      { path: 'playlists/:id', name: ROUTE.playlist, component: () => import('@/pages/PlaylistPage.vue'), props: true },
      { path: 'rankings', name: ROUTE.rankings, component: () => import('@/pages/RankingsPage.vue'), meta: { nav: 'rankings' } },
      { path: 'awards', name: ROUTE.awards, component: () => import('@/pages/AwardsPage.vue'), meta: { nav: 'awards' } },
      { path: 'how-it-works', name: ROUTE.howItWorks, component: () => import('@/pages/HowItWorksPage.vue') },
      { path: 'groups/join/:code', name: ROUTE.groupInvite, component: () => import('@/pages/GroupInvitePage.vue'), props: true },
      { path: 'groups', name: ROUTE.groups, component: () => import('@/pages/GroupsPage.vue'), meta: { auth: 'required', nav: 'groups' } },
      { path: 'groups/:id', name: ROUTE.group, component: () => import('@/pages/GroupPage.vue'), props: true, meta: { auth: 'required', nav: 'groups' } },
      { path: 'group-reviews/:id', name: ROUTE.groupReview, component: () => import('@/pages/GroupReviewPage.vue'), props: true },
      { path: 'settings', name: ROUTE.settings, component: () => import('@/pages/SettingsPage.vue'), meta: { auth: 'required' } },
      { path: 'settings/account', name: ROUTE.account, component: () => import('@/pages/AccountPage.vue'), meta: { auth: 'required' } },
      { path: 'admin', name: ROUTE.admin, component: () => import('@/pages/AdminPage.vue'), meta: { auth: 'required', admin: true } },
      { path: 'me', name: ROUTE.myProfile, component: () => import('@/pages/MeRedirectPage.vue'), meta: { auth: 'required', tab: 'profile' } },
      { path: 'library', name: ROUTE.myLibrary, component: () => import('@/pages/MeRedirectPage.vue'), meta: { auth: 'required' } },
      { path: 'privacy', name: ROUTE.privacy, component: () => import('@/pages/LegalPage.vue'), props: { document: 'privacy' } },
      { path: 'terms', name: ROUTE.terms, component: () => import('@/pages/LegalPage.vue'), props: { document: 'terms' } },
      { path: ':pathMatch(.*)*', name: ROUTE.notFound, component: () => import('@/pages/NotFoundPage.vue') },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      { path: 'login', name: ROUTE.login, component: () => import('@/pages/LoginPage.vue'), meta: { auth: 'guest' } },
      { path: 'register', name: ROUTE.register, component: () => import('@/pages/RegisterPage.vue'), meta: { auth: 'guest', wide: true } },
      { path: 'forgot-password', name: ROUTE.forgotPassword, component: () => import('@/pages/ForgotPasswordPage.vue') },
      { path: 'reset-password', name: ROUTE.resetPassword, component: () => import('@/pages/ResetPasswordPage.vue') },
      { path: 'delete-account', name: ROUTE.deleteAccount, component: () => import('@/pages/DeleteAccountPage.vue') },
    ],
  },
]
