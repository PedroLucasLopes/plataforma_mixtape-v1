import type {
  Account,
  AccountDeletionCheck,
  AccountDeletionSent,
  AdsConfig,
  AlbumChartEntry,
  AlbumDetails,
  AlbumSummary,
  ArtistChartEntry,
  ArtistDetails,
  ArtistSummary,
  AuthResult,
  CatalogKind,
  EmailLocale,
  Favorite,
  FavoriteKind,
  FeedSort,
  GamificationRules,
  GenreShowcase,
  Group,
  GroupReview,
  GroupSummary,
  GroupTopItem,
  GroupVisibility,
  HumanCheckConfig,
  InvitePreview,
  ItemStats,
  ItemType,
  LibraryStack,
  LibrarySummary,
  LikeResult,
  ListenLater,
  ListenLaterKind,
  MonthlyAwards,
  Page,
  PasswordResetAccepted,
  PasswordResetCheck,
  PasswordResetSent,
  Period,
  Playlist,
  PlaylistItemKind,
  PlaylistSummary,
  PlaylistVisibility,
  ProfileSharePayload,
  PublicProfile,
  PublicProgress,
  RankingCategory,
  RankingEntry,
  Review,
  ReviewSort,
  ReviewVisibility,
  SharePayload,
  TrackChartEntry,
  TrackDetails,
  TrackSummary,
  TrendingItem,
  UserProgress,
  UserSummary,
} from '@/types/api'
import { AUTH_API_PATHS } from '@pedrolucaslopes/mixtape-auth'
import { EMAIL_LOCALES, HUMAN_CHECK } from '@/constants/api'
import { currentLocale } from '@/plugins/i18n'
import { request } from './http'

const enc = encodeURIComponent

function humanHeaders (token?: string | null): Record<string, string> | undefined {
  return token ? { [HUMAN_CHECK.header]: token } : undefined
}

function emailLocale (): EmailLocale {
  const locale = currentLocale()
  return EMAIL_LOCALES.find(code => code === locale) ?? EMAIL_LOCALES[0]
}

export interface RegisterInput {
  email: string
  password: string
  fullName: string
  username: string
  birthDate: string
}

export interface ProfileInput {
  fullName?: string
  bio?: string | null
  avatarUrl?: string | null
  favoriteGenres?: string[]
}

export interface PageQuery {
  page?: number
  limit?: number
}

export interface LibraryFilters {
  type?: ItemType
  minRating?: number
  maxRating?: number
  genre?: string
  sort?: ReviewSort
}

export const authApi = {
  login: (login: string, password: string, humanToken?: string | null) =>
    request<AuthResult>(AUTH_API_PATHS.login, {
      method: 'POST',
      body: { login, password },
      auth: 'none',
      session: true,
      headers: humanHeaders(humanToken),
    }),
  register: (input: RegisterInput, humanToken?: string | null) =>
    request<AuthResult>('/auth/register', { method: 'POST', body: input, auth: 'none', session: true, headers: humanHeaders(humanToken) }),
  humanCheck: () => request<HumanCheckConfig>('/auth/human-check', { auth: 'none' }),
  refresh: () => request<AuthResult>('/auth/refresh', { method: 'POST', body: {}, auth: 'none', session: true }),
  logout: () => request<null>('/auth/logout', { method: 'POST', body: {}, auth: 'none', session: true }),
  logoutAll: () => request<null>('/auth/logout-all', { method: 'POST', auth: 'required', session: true }),
  requestPasswordReset: (email: string, humanToken?: string | null) =>
    request<PasswordResetAccepted>('/auth/password-reset', {
      method: 'POST',
      body: { email, locale: emailLocale() },
      auth: 'none',
      headers: humanHeaders(humanToken),
    }),
  checkPasswordReset: (token: string) =>
    request<PasswordResetCheck>('/auth/password-reset/check', { method: 'POST', body: { token }, auth: 'none' }),
  resetPassword: (token: string, newPassword: string) =>
    request<null>('/auth/password-reset/confirm', {
      method: 'POST',
      body: { token, newPassword, locale: emailLocale() },
      auth: 'none',
      session: true,
    }),
  checkAccountDeletion: (token: string) =>
    request<AccountDeletionCheck>('/auth/account-deletion/check', { method: 'POST', body: { token }, auth: 'none' }),
  deleteAccount: (token: string) =>
    request<null>('/auth/account-deletion/confirm', {
      method: 'POST',
      body: { token, locale: emailLocale() },
      auth: 'none',
      session: true,
    }),
}

export const favoritesApi = {
  ofUser: (username: string) => request<Favorite[]>(`/users/${enc(username)}/favorites`),
  mine: () => request<Favorite[]>('/me/favorites', { auth: 'required' }),
  add: (kind: FavoriteKind, id: string) =>
    request<Favorite[]>('/me/favorites', { method: 'POST', body: { kind, id }, auth: 'required' }),
  remove: (kind: FavoriteKind, id: string) =>
    request<Favorite[]>(`/me/favorites/${kind}/${enc(id)}`, { method: 'DELETE', auth: 'required' }),
  replace: (items: Array<{ kind: FavoriteKind, id: string }>) =>
    request<Favorite[]>('/me/favorites', { method: 'PUT', body: { items }, auth: 'required' }),
}

export const discoverApi = {
  albums: (limit: number, signal?: AbortSignal) =>
    request<AlbumSummary[]>('/me/discover', { query: { limit }, auth: 'required', signal }),
}

export const listenLaterApi = {
  mine: () => request<ListenLater[]>('/me/listen-later', { auth: 'required' }),
  add: (kind: ListenLaterKind, id: string) =>
    request<ListenLater[]>('/me/listen-later', { method: 'POST', body: { kind, id }, auth: 'required' }),
  remove: (kind: ListenLaterKind, id: string) =>
    request<ListenLater[]>(`/me/listen-later/${kind}/${enc(id)}`, { method: 'DELETE', auth: 'required' }),
}

export const accountApi = {
  me: () => request<Account>('/me', { auth: 'required' }),
  updateProfile: (input: ProfileInput) => request<Account>('/me/profile', { method: 'PATCH', body: input, auth: 'required' }),
  requestPasswordReset: () =>
    request<PasswordResetSent>('/me/password-reset', { method: 'POST', body: { locale: emailLocale() }, auth: 'required' }),
  requestAccountDeletion: () =>
    request<AccountDeletionSent>('/me/account-deletion', { method: 'POST', body: { locale: emailLocale() }, auth: 'required' }),
}

export const catalogApi = {
  searchAlbums: (q: string, page: PageQuery) => request<Page<AlbumSummary>>('/search/albums', { query: { q, ...page } }),
  searchTracks: (q: string, page: PageQuery) => request<Page<TrackSummary>>('/search/tracks', { query: { q, ...page } }),
  searchArtists: (q: string, page: PageQuery) => request<Page<ArtistSummary>>('/search/artists', { query: { q, ...page } }),
  album: (id: string) => request<AlbumDetails>(`/albums/${enc(id)}`),
  track: (id: string) => request<TrackDetails>(`/tracks/${enc(id)}`),
  artist: (id: string) => request<ArtistDetails>(`/artists/${enc(id)}`),
  genres: () => request<string[]>('/genres'),
  genreShowcase: () => request<GenreShowcase[]>('/genres/showcase'),
  suggestedAlbums: (genres: readonly string[], page: PageQuery) =>
    request<Page<AlbumSummary>>('/genres/suggestions/albums', { query: { genres: genres.join(','), ...page } }),
  suggestedTracks: (genres: readonly string[], page: PageQuery) =>
    request<Page<TrackSummary>>('/genres/suggestions/tracks', { query: { genres: genres.join(','), ...page } }),
  suggestedArtists: (genres: readonly string[], page: PageQuery) =>
    request<Page<ArtistSummary>>('/genres/suggestions/artists', { query: { genres: genres.join(','), ...page } }),
  albumChart: (range: Period, limit: number, signal?: AbortSignal) =>
    request<AlbumChartEntry[]>('/charts/albums', { query: { range, limit }, signal }),
  trackChart: (range: Period, limit: number, signal?: AbortSignal) =>
    request<TrackChartEntry[]>('/charts/tracks', { query: { range, limit }, signal }),
  artistChart: (range: Period, limit: number, signal?: AbortSignal) =>
    request<ArtistChartEntry[]>('/charts/artists', { query: { range, limit }, signal }),
}

export type SearchResult = Page<AlbumSummary> | Page<TrackSummary> | Page<ArtistSummary>

export function searchCatalog (kind: CatalogKind, q: string, page: PageQuery): Promise<SearchResult> {
  if (kind === 'tracks') {
    return catalogApi.searchTracks(q, page)
  }
  if (kind === 'artists') {
    return catalogApi.searchArtists(q, page)
  }
  return catalogApi.searchAlbums(q, page)
}

const itemPath = (type: ItemType, id: string) => `/${type === 'ALBUM' ? 'albums' : 'tracks'}/${enc(id)}`

export const reviewsApi = {
  create: (itemType: ItemType, itemId: string, rating: number, body: string | null) =>
    request<Review>('/reviews', { method: 'POST', body: { itemType, itemId, rating, body }, auth: 'required' }),
  update: (id: string, rating: number, body: string | null) =>
    request<Review>(`/reviews/${enc(id)}`, { method: 'PATCH', body: { rating, body }, auth: 'required' }),
  remove: (id: string) => request<null>(`/reviews/${enc(id)}`, { method: 'DELETE', auth: 'required' }),
  get: (id: string) => request<Review>(`/reviews/${enc(id)}`),
  feed: (sort: FeedSort, period: Period | null, withText: boolean, page: PageQuery) =>
    request<Page<Review>>('/reviews', { query: { sort, period, withText: withText || undefined, ...page } }),
  forItem: (type: ItemType, id: string, sort: ReviewSort, page: PageQuery) =>
    request<Page<Review>>(`${itemPath(type, id)}/reviews`, { query: { sort, ...page } }),
  stats: (type: ItemType, id: string) => request<ItemStats>(`${itemPath(type, id)}/stats`),
  like: (id: string, liked: boolean) =>
    request<LikeResult>(`/reviews/${enc(id)}/like`, { method: liked ? 'PUT' : 'DELETE', auth: 'required' }),
  setVisibility: (id: string, visibility: Exclude<ReviewVisibility, 'GROUP'>) =>
    request<Review>(`/reviews/${enc(id)}`, { method: 'PATCH', body: { visibility }, auth: 'required' }),
  trending: (type: ItemType, period: Period, limit: number, signal?: AbortSignal) =>
    request<TrendingItem[]>('/trending', { query: { type, period, limit }, signal }),
}

export const libraryApi = {
  ofUser: (username: string, filters: LibraryFilters, page: PageQuery) =>
    request<Page<Review>>(`/users/${enc(username)}/library`, { query: { ...filters, ...page } }),
  stacks: (username: string, filters: LibraryFilters, page: PageQuery) =>
    request<Page<LibraryStack>>(`/users/${enc(username)}/library/stacks`, { query: { ...filters, ...page } }),
  summary: (username: string) => request<LibrarySummary>(`/users/${enc(username)}/library/summary`),
}

export const gamificationApi = {
  rules: () => request<GamificationRules>('/gamification/rules'),
  rankings: (category: RankingCategory, period: Period, page: PageQuery) =>
    request<Page<RankingEntry>>('/rankings', { query: { category, period, ...page } }),
  progress: (username: string) => request<PublicProgress>(`/users/${enc(username)}/progress`),
  myProgress: () => request<UserProgress>('/me/progress', { auth: 'required' }),
  awards: (period?: string | null) => request<MonthlyAwards>('/awards', { query: { period } }),
  computeAwards: (period: string) =>
    request<MonthlyAwards>(`/admin/awards/${enc(period)}/compute`, { method: 'POST', auth: 'required' }),
}

export interface GroupInput {
  name?: string
  description?: string | null
  visibility?: GroupVisibility
}

export const groupsApi = {
  create: (input: Required<Pick<GroupInput, 'name'>> & GroupInput) =>
    request<Group>('/groups', { method: 'POST', body: input, auth: 'required' }),
  mine: (page: PageQuery) => request<Page<GroupSummary>>('/groups', { query: { ...page }, auth: 'required' }),
  invite: (code: string) => request<InvitePreview>(`/groups/invites/${enc(code)}`),
  join: (inviteCode: string) => request<Group>('/groups/join', { method: 'POST', body: { inviteCode }, auth: 'required' }),
  get: (id: string) => request<Group>(`/groups/${enc(id)}`, { auth: 'required' }),
  update: (id: string, input: GroupInput) => request<Group>(`/groups/${enc(id)}`, { method: 'PATCH', body: input, auth: 'required' }),
  remove: (id: string) => request<null>(`/groups/${enc(id)}`, { method: 'DELETE', auth: 'required' }),
  leave: (id: string) => request<null>(`/groups/${enc(id)}/leave`, { method: 'POST', auth: 'required' }),
  removeMember: (id: string, userId: string) =>
    request<Group>(`/groups/${enc(id)}/members/${enc(userId)}`, { method: 'DELETE', auth: 'required' }),
  regenerateInvite: (id: string) => request<Group>(`/groups/${enc(id)}/invite-code`, { method: 'POST', auth: 'required' }),
  ranking: (id: string, category: RankingCategory, period: Period, page: PageQuery) =>
    request<Page<RankingEntry>>(`/groups/${enc(id)}/ranking`, { query: { category, period, ...page }, auth: 'required' }),
  feed: (id: string, page: PageQuery) => request<Page<Review>>(`/groups/${enc(id)}/feed`, { query: { ...page }, auth: 'required' }),
  topItems: (id: string, type: ItemType, limit: number) =>
    request<GroupTopItem[]>(`/groups/${enc(id)}/top-items`, { query: { type, limit }, auth: 'required' }),
  groupReviews: (id: string, page: PageQuery) =>
    request<Page<GroupReview>>(`/groups/${enc(id)}/group-reviews`, { query: { ...page }, auth: 'required' }),
  proposeGroupReview: (id: string, itemType: ItemType, itemId: string) =>
    request<GroupReview>(`/groups/${enc(id)}/group-reviews`, { method: 'POST', body: { itemType, itemId }, auth: 'required' }),
}

export const groupReviewsApi = {
  get: (id: string) => request<GroupReview>(`/group-reviews/${enc(id)}`),
  saveMine: (id: string, rating: number, body: string | null) =>
    request<GroupReview>(`/group-reviews/${enc(id)}/my-review`, { method: 'PUT', body: { rating, body }, auth: 'required' }),
  cancel: (id: string) => request<null>(`/group-reviews/${enc(id)}`, { method: 'DELETE', auth: 'required' }),
  ofUser: (username: string, page: PageQuery) => request<Page<GroupReview>>(`/users/${enc(username)}/group-reviews`, { query: { ...page } }),
}

export interface PlaylistInput {
  title?: string
  description?: string | null
  visibility?: PlaylistVisibility
}

export const playlistsApi = {
  create: (input: Required<Pick<PlaylistInput, 'title'>> & PlaylistInput) =>
    request<Playlist>('/playlists', { method: 'POST', body: input, auth: 'required' }),
  explore: (page: PageQuery) => request<Page<PlaylistSummary>>('/playlists', { query: { ...page } }),
  get: (id: string) => request<Playlist>(`/playlists/${enc(id)}`),
  update: (id: string, input: PlaylistInput) => request<Playlist>(`/playlists/${enc(id)}`, { method: 'PATCH', body: input, auth: 'required' }),
  remove: (id: string) => request<null>(`/playlists/${enc(id)}`, { method: 'DELETE', auth: 'required' }),
  addItem: (id: string, kind: PlaylistItemKind, refId: string, note: string | null) =>
    request<Playlist>(`/playlists/${enc(id)}/items`, { method: 'POST', body: { kind, refId, note }, auth: 'required' }),
  updateItem: (id: string, itemId: string, input: { position?: number, note?: string | null }) =>
    request<Playlist>(`/playlists/${enc(id)}/items/${enc(itemId)}`, { method: 'PATCH', body: input, auth: 'required' }),
  removeItem: (id: string, itemId: string) =>
    request<Playlist>(`/playlists/${enc(id)}/items/${enc(itemId)}`, { method: 'DELETE', auth: 'required' }),
  mine: (page: PageQuery) => request<Page<PlaylistSummary>>('/me/playlists', { query: { ...page }, auth: 'required' }),
  ofUser: (username: string, page: PageQuery) => request<Page<PlaylistSummary>>(`/users/${enc(username)}/playlists`, { query: { ...page } }),
}

export const profilesApi = {
  get: (username: string) => request<PublicProfile>(`/users/${enc(username)}`),
  search: (q: string, page: PageQuery) => request<Page<UserSummary>>('/search/users', { query: { q, ...page } }),
}

export const shareApi = {
  profile: (username: string) => request<ProfileSharePayload>(`/share/users/${enc(username)}`),
  review: (id: string) => request<SharePayload>(`/share/reviews/${enc(id)}`),
  playlist: (id: string) => request<SharePayload>(`/share/playlists/${enc(id)}`),
  group: (id: string) => request<SharePayload>(`/share/groups/${enc(id)}`, { auth: 'required' }),
}

export const adsApi = {
  config: () => request<AdsConfig>('/ads/config', { auth: 'none' }),
}
