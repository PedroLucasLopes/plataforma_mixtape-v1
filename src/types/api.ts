import type { components } from './api.generated'

type Schemas = components['schemas']

export type ApiErrorBody = Schemas['ErrorResponse']
export type PageMeta = Schemas['PageMetaResponse']
export type Page<T> = PageMeta & { items: T[] }

export type Account = Schemas['AccountResponse']
export type AuthResult = Schemas['AuthResponse']
export type AuthTokens = Schemas['AuthTokensResponse']
export type EmailLocale = Schemas['EmailLocaleDto']['locale']
export type Favorite = Schemas['FavoriteResponse']
export type FavoriteKind = Schemas['FavoriteRefDto']['kind']
export type ListenLater = Schemas['ListenLaterResponse']
export type ListenLaterKind = Schemas['ListenLaterRefDto']['kind']
export type PasswordResetAccepted = Schemas['PasswordResetAcceptedResponse']
export type PasswordResetCheck = Schemas['PasswordResetCheckResponse']
export type PasswordResetSent = Schemas['PasswordResetSentResponse']
export type AccountDeletionSent = Schemas['AccountDeletionSentResponse']
export type AccountDeletionCheck = Schemas['AccountDeletionCheckResponse']

export type ArtistRef = Schemas['ArtistRefResponse']
export type CoverArt = Schemas['CoverArtResponse']
export type StreamingLinks = Schemas['StreamingLinksResponse']
export type ArtistLinks = Schemas['ArtistLinksResponse']
export type SourceAttribution = Schemas['SourceResponse']
export type AlbumSummary = Schemas['AlbumSummaryResponse']
export type GenreShowcase = Schemas['GenreShowcaseResponse']
export type AlbumDetails = Schemas['AlbumDetailsResponse']
export type AlbumTrack = Schemas['AlbumTrackResponse']
export type AlbumEdition = Schemas['AlbumEditionResponse']
export type TrackSummary = Schemas['TrackSummaryResponse']
export type TrackDetails = Schemas['TrackDetailsResponse']
export type TrackCredit = Schemas['TrackCreditResponse']
export type ArtistSummary = Schemas['ArtistSummaryResponse']
export type ArtistImage = Schemas['ArtistImageResponse']
export type ArtistTopTrack = Omit<Schemas['ArtistTopTrackResponse'], 'album'> & { album: { title: string } | null }
export type ArtistDetails = Omit<Schemas['ArtistDetailsResponse'], 'topTracks'> & { topTracks: ArtistTopTrack[] }
export type LifeSpan = Schemas['LifeSpanResponse']
export type AlbumChartEntry = Schemas['AlbumChartEntryResponse']
export type TrackChartEntry = Schemas['TrackChartEntryResponse']
export type ArtistChartEntry = Schemas['ArtistChartEntryResponse']

export type UserSummary = Schemas['UserSummaryResponse']
export type DiscBadge = Schemas['DiscBadgeResponse']
export type ItemSummary = Schemas['ItemSummaryResponse']
export type Review = Schemas['ReviewResponse']
export type ReviewVisibility = Review['visibility']
export type LikeResult = Schemas['LikeResultResponse']
export type RatingBucket = Schemas['RatingDistributionResponse']
export type ItemStats = Schemas['ItemStatsResponse']
export type LibrarySummary = Schemas['LibrarySummaryResponse']
export type TrendingItem = Schemas['TrendingItemResponse']

export type GamificationRules = Schemas['GamificationRulesResponse']
export type RankingEntry = Schemas['RankingEntryResponse']
export type UserProgress = Schemas['UserProgressResponse']
export type DiscProgress = Schemas['DiscProgressResponse']
export type BadgeProgress = Schemas['BadgeProgressResponse']
export type EarnedBadge = Schemas['EarnedBadgeResponse']
export type PublicProgress = Schemas['PublicProgressResponse']
export type Award = Schemas['AwardResponse']
export type MonthlyAwards = Schemas['MonthlyAwardsResponse']
export type AwardCategoryResult = Schemas['AwardCategoryResultResponse']

export type Group = Schemas['GroupResponse']
export type GroupSummary = Schemas['GroupSummaryResponse']
export type GroupMember = Schemas['GroupMemberResponse']
export type InvitePreview = Schemas['InvitePreviewResponse']
export type GroupTopItem = Schemas['GroupTopItemResponse']
export type GroupReview = Schemas['GroupReviewResponse']
export type GroupReviewViewer = Schemas['GroupReviewViewerResponse']
export type GroupVisibility = Group['visibility']

export type Playlist = Schemas['PlaylistResponse']
export type PlaylistSummary = Schemas['PlaylistSummaryResponse']
export type PlaylistItem = Schemas['PlaylistItemResponse']

export type PublicProfile = Schemas['PublicProfileResponse']
export type SharePayload = Schemas['SharePayloadResponse']
export type ProfileSharePayload = Schemas['ProfileSharePayloadResponse']
export type AdsConfig = Schemas['AdsConfigResponse']
export type AdPlacementConfig = Schemas['AdPlacementResponse']

export type ItemType = 'ALBUM' | 'TRACK'
export type CatalogKind = 'albums' | 'tracks' | 'artists'
export type SearchKind = CatalogKind | 'people'
export type Period = 'week' | 'month' | 'year' | 'all_time'
export type ReviewSort = 'recent' | 'popular' | 'rating_desc' | 'rating_asc'
export type FeedSort = 'recent' | 'popular'
export type RankingCategory = 'overall' | 'participation' | 'notoriety'
export type PlaylistVisibility = 'PUBLIC' | 'PRIVATE'
export type PlaylistItemKind = 'ALBUM' | 'TRACK' | 'ARTIST' | 'REVIEW'
export type AdPlacement = AdPlacementConfig['placement']
