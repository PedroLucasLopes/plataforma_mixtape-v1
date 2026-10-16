export interface paths {
    "/ads.txt": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdsTxtController_file"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["HealthController_check"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/awards/{period}/compute": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["GamificationController_compute_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ads/config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdsController_config_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/albums/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CatalogController_album_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/albums/{id}/reviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ItemReviewsController_albumReviews_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/albums/{id}/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ItemReviewsController_albumStats_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/artists/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CatalogController_artist_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/account-deletion/check": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_checkAccountDeletion_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/account-deletion/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_confirmAccountDeletion_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/human-check": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AuthController_humanCheckWidget_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_login_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_logout_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_logoutAll_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/password-reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_requestPasswordReset_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/password-reset/check": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_checkPasswordReset_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/password-reset/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_confirmPasswordReset_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_refresh_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_register_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/awards": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GamificationController_awards_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/charts/albums": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CatalogController_albumChart_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/charts/artists": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CatalogController_artistChart_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/charts/tracks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CatalogController_trackChart_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/gamification/rules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GamificationController_gamificationRules_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/genres": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CatalogController_genres_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/genres/showcase": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CatalogController_showcase_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/genres/suggestions/albums": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CatalogController_suggestedAlbums_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/genres/suggestions/artists": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CatalogController_suggestedArtists_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/genres/suggestions/tracks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CatalogController_suggestedTracks_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/group-reviews/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GroupReviewsController_findOne_v1"];
        put?: never;
        post?: never;
        delete: operations["GroupReviewsController_remove_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/group-reviews/{id}/my-review": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["GroupReviewsController_saveMine_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/groups": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GroupsController_mine_v1"];
        put?: never;
        post: operations["GroupsController_create_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/groups/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GroupsController_findOne_v1"];
        put?: never;
        post?: never;
        delete: operations["GroupsController_remove_v1"];
        options?: never;
        head?: never;
        patch: operations["GroupsController_update_v1"];
        trace?: never;
    };
    "/api/v1/groups/{id}/feed": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GroupsController_feed_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/groups/{id}/group-reviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GroupReviewsController_list_v1"];
        put?: never;
        post: operations["GroupReviewsController_create_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/groups/{id}/invite-code": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["GroupsController_regenerateInvite_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/groups/{id}/leave": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["GroupsController_leave_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/groups/{id}/members/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["GroupsController_removeMember_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/groups/{id}/ranking": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GroupsController_ranking_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/groups/{id}/top-items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GroupsController_topItems_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/groups/invites/{code}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GroupsController_invite_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/groups/join": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["GroupsController_join_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/images/caa/{kind}/{mbid}/{file}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ImagesController_cover_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AccountController_me_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/account-deletion": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AccountController_requestAccountDeletion_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/discover": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["DiscoverController_albums_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/favorites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["FavoritesController_mine_v1"];
        put: operations["FavoritesController_replace_v1"];
        post: operations["FavoritesController_add_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/favorites/{kind}/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["FavoritesController_remove_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/library": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MyLibraryController_library_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/library/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MyLibraryController_summary_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/listen-later": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ListenLaterController_mine_v1"];
        put?: never;
        post: operations["ListenLaterController_add_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/listen-later/{kind}/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["ListenLaterController_remove_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/password-reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AccountController_requestPasswordReset_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/playlists": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PlaylistsController_mine_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["AccountController_update_v1"];
        trace?: never;
    };
    "/api/v1/me/progress": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GamificationController_myProgress_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/playlists": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PlaylistsController_recent_v1"];
        put?: never;
        post: operations["PlaylistsController_create_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/playlists/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PlaylistsController_findOne_v1"];
        put?: never;
        post?: never;
        delete: operations["PlaylistsController_remove_v1"];
        options?: never;
        head?: never;
        patch: operations["PlaylistsController_update_v1"];
        trace?: never;
    };
    "/api/v1/playlists/{id}/items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["PlaylistsController_addItem_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/playlists/{id}/items/{itemId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["PlaylistsController_removeItem_v1"];
        options?: never;
        head?: never;
        patch: operations["PlaylistsController_updateItem_v1"];
        trace?: never;
    };
    "/api/v1/rankings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GamificationController_ranking_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ReviewsController_feed_v1"];
        put?: never;
        post: operations["ReviewsController_create_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reviews/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ReviewsController_findOne_v1"];
        put?: never;
        post?: never;
        delete: operations["ReviewsController_remove_v1"];
        options?: never;
        head?: never;
        patch: operations["ReviewsController_update_v1"];
        trace?: never;
    };
    "/api/v1/reviews/{id}/like": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["ReviewsController_like_v1"];
        post?: never;
        delete: operations["ReviewsController_unlike_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/search/albums": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CatalogController_searchAlbums_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/search/artists": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CatalogController_searchArtists_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/search/tracks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CatalogController_searchTracks_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/search/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PeopleSearchController_searchUsers_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seo/head": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SeoController_head_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seo/sitemap.xml": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SeoController_sitemapIndex_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seo/sitemaps/{file}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SeoController_sitemapFile_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/share/groups/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SharingController_shareGroup_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/share/playlists/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SharingController_sharePlaylist_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/share/reviews/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SharingController_shareReview_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/share/users/{username}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SharingController_shareProfile_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracks/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CatalogController_track_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracks/{id}/reviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ItemReviewsController_trackReviews_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracks/{id}/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ItemReviewsController_trackStats_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/trending": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ItemReviewsController_trending_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{username}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ProfilesController_profile_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{username}/favorites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["FavoritesController_ofUser_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{username}/group-reviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GroupReviewsController_byMember_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{username}/library": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ItemReviewsController_library_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{username}/library/stacks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ItemReviewsController_libraryStacks_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{username}/library/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ItemReviewsController_librarySummary_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{username}/playlists": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PlaylistsController_byUser_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{username}/progress": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GamificationController_progress_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{username}/qrcode": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SharingController_qrCode_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AccountDeletionCheckResponse: {
            email?: string;
            expiresAt?: string;
            username?: string;
            valid: boolean;
        };
        AccountDeletionConfirmDto: {
            locale: "pt-BR" | "en" | "es";
            token: string;
        };
        AccountDeletionSentResponse: {
            email: string;
            expiresInMinutes: number;
        };
        AccountDeletionTokenDto: {
            token: string;
        };
        AccountResponse: {
            avatarUrl: string | null;
            bio: string | null;
            birthDate: string;
            createdAt: string;
            email: string;
            favoriteGenres: string[];
            fullName: string;
            id: string;
            role: "USER" | "ADMIN";
            username: string;
        };
        AddPlaylistItemDto: {
            kind: "ALBUM" | "TRACK" | "ARTIST" | "REVIEW";
            note?: Record<string, never> | null;
            refId: string;
        };
        AdPlacementResponse: {
            placement: "HOME_TOP" | "HOME_FEED" | "SEARCH_RESULTS" | "ALBUM_SIDEBAR" | "ALBUM_BOTTOM" | "PROFILE_BOTTOM" | "RANKINGS_SIDEBAR";
            slotId: string;
        };
        AdsConfigResponse: {
            clientId?: string | null;
            enabled: boolean;
            placements: components["schemas"]["AdPlacementResponse"][];
            provider: string;
            scriptUrl?: string | null;
            testMode: boolean;
        };
        AlbumChartEntryResponse: {
            item: components["schemas"]["AlbumSummaryResponse"];
            listenCount: number;
            listenerCount: number | null;
            monthlyListeners: components["schemas"]["MonthlyListenersResponse"] | null;
            position: number;
        };
        AlbumDetailsResponse: {
            artistCredit: string;
            artists: components["schemas"]["ArtistRefResponse"][];
            cover: components["schemas"]["CoverArtResponse"] | null;
            disambiguation: string | null;
            edition: components["schemas"]["AlbumEditionResponse"] | null;
            editionsCount: number;
            firstReleaseDate: string | null;
            genres: string[];
            id: string;
            links: components["schemas"]["StreamingLinksResponse"];
            listenCount: number | null;
            listenerCount: number | null;
            primaryType: string | null;
            secondaryTypes: string[];
            source: components["schemas"]["SourceResponse"];
            title: string;
            totalDurationMs: number | null;
            trackCount: number;
            tracks: components["schemas"]["AlbumTrackResponse"][];
        };
        AlbumEditionResponse: {
            barcode: string | null;
            country: string | null;
            date: string | null;
            formats: string[];
            id: string;
            labels: components["schemas"]["LabelResponse"][];
            language: string | null;
            packaging: string | null;
            status: string | null;
            title: string;
        };
        AlbumSummaryResponse: {
            artistCredit: string;
            artists: components["schemas"]["ArtistRefResponse"][];
            cover: components["schemas"]["CoverArtResponse"] | null;
            firstReleaseDate: string | null;
            id: string;
            listenCount: number | null;
            listenerCount: number | null;
            primaryType: string | null;
            secondaryTypes: string[];
            title: string;
        };
        AlbumTrackResponse: {
            artistCredit: string;
            disc: number;
            durationMs: number | null;
            id: string;
            number: string;
            position: number;
            title: string;
        };
        AppearsOnResponse: {
            firstReleaseDate: string | null;
            id: string;
            primaryType: string | null;
            title: string;
        };
        ArtistChartEntryResponse: {
            item: components["schemas"]["ArtistSummaryResponse"];
            listenCount: number;
            listenerCount: number | null;
            monthlyListeners: components["schemas"]["MonthlyListenersResponse"] | null;
            position: number;
        };
        ArtistDetailsResponse: {
            area: string | null;
            beginArea: string | null;
            country: string | null;
            cover: components["schemas"]["CoverArtResponse"] | null;
            disambiguation: string | null;
            discography: components["schemas"]["AlbumSummaryResponse"][];
            gender: string | null;
            genres: string[];
            id: string;
            image: components["schemas"]["ArtistImageResponse"] | null;
            lifeSpan: components["schemas"]["LifeSpanResponse"];
            links: components["schemas"]["ArtistLinksResponse"];
            listenCount: number | null;
            listenerCount: number | null;
            monthlyListeners: components["schemas"]["MonthlyListenersResponse"] | null;
            name: string;
            sortName: string | null;
            source: components["schemas"]["SourceResponse"];
            topTracks: components["schemas"]["ArtistTopTrackResponse"][];
            type: string | null;
        };
        ArtistImageResponse: {
            author: string | null;
            license: string | null;
            licenseUrl: string | null;
            sourceUrl: string;
            thumbnails: components["schemas"]["ArtistImageThumbnailsResponse"];
            thumbnailUrl: string;
            url: string;
        };
        ArtistImageThumbnailsResponse: {
            large: string;
            medium: string;
            small: string;
        };
        ArtistLinksResponse: {
            amazonMusic?: string;
            appleMusic?: string;
            bandcamp?: string;
            deezer?: string;
            discogs?: string;
            facebook?: string;
            instagram?: string;
            lastfm?: string;
            official?: string;
            qobuz?: string;
            soundcloud?: string;
            spotify?: string;
            tidal?: string;
            tiktok?: string;
            twitter?: string;
            wikidata?: string;
            wikipedia?: string;
            youtube?: string;
            youtubeMusic?: string;
        };
        ArtistRefResponse: {
            id: string;
            name: string;
        };
        ArtistSummaryResponse: {
            country: string | null;
            cover: components["schemas"]["CoverArtResponse"] | null;
            disambiguation: string | null;
            id: string;
            lifeSpan: components["schemas"]["LifeSpanResponse"];
            listenCount: number | null;
            listenerCount: number | null;
            name: string;
            sortName: string | null;
            type: string | null;
        };
        ArtistTopTrackResponse: {
            album: Record<string, never> | null;
            cover: components["schemas"]["CoverArtResponse"] | null;
            durationMs: number | null;
            id: string;
            listenCount: number;
            listenerCount: number;
            title: string;
        };
        AuthResponse: {
            tokens: components["schemas"]["AuthTokensResponse"];
            user: components["schemas"]["AccountResponse"];
        };
        AuthTokensResponse: {
            accessToken: string;
            accessTokenExpiresIn: number;
            refreshToken: string | null;
            refreshTokenExpiresAt: string;
            tokenType: string;
        };
        AwardCategoryResultResponse: {
            category: string;
            description: string;
            name: string;
            podium: components["schemas"]["AwardResponse"][];
        };
        AwardResponse: {
            category: "CRITIC_OF_THE_MONTH" | "MOST_ACTIVE_OF_THE_MONTH" | "REVIEW_OF_THE_MONTH" | "ROOKIE_OF_THE_MONTH";
            categoryName: string;
            period: string;
            position: number;
            review: components["schemas"]["AwardReviewResponse"] | null;
            score: number;
            user: components["schemas"]["UserSummaryResponse"];
        };
        AwardReviewResponse: {
            id: string;
            item: components["schemas"]["ItemSummaryResponse"];
            rating: number;
        };
        AwardRuleResponse: {
            category: string;
            description: string;
            name: string;
        };
        BadgeProgressResponse: {
            code: string;
            description: string;
            earnedAt: string | null;
            name: string;
            next: components["schemas"]["NextBadgeTierResponse"] | null;
            progress: number;
            tier: number;
            tierName: string | null;
            value: number;
        };
        BadgeRuleResponse: {
            code: string;
            description: string;
            metric: string;
            name: string;
            tiers: components["schemas"]["BadgeTierRuleResponse"][];
        };
        BadgeTierRuleResponse: {
            name: string;
            threshold: number;
            tier: number;
        };
        CoverArtResponse: {
            large: string;
            medium: string;
            small: string;
        };
        CreateGroupDto: {
            description?: Record<string, never> | null;
            name: string;
            visibility: "PUBLIC" | "PRIVATE";
        };
        CreatePlaylistDto: {
            description?: Record<string, never> | null;
            title: string;
            visibility: "PUBLIC" | "PRIVATE";
        };
        CreateReviewDto: {
            body?: Record<string, never> | null;
            itemId: string;
            itemType: "ALBUM" | "TRACK";
            rating: number;
        };
        DiscBadgeResponse: {
            label: string;
            tier: "DEMO" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";
        };
        DiscProgressResponse: {
            label: string;
            next: components["schemas"]["NextDiscResponse"] | null;
            progress: number;
            reviews: number;
            tier: string;
        };
        DiscTierResponse: {
            label: string;
            minReviews: number;
            tier: string;
        };
        EarnedBadgeResponse: {
            code: string;
            description: string;
            earnedAt: string | null;
            name: string;
            tier: number;
            tierName: string | null;
        };
        EmailLocaleDto: {
            locale: "pt-BR" | "en" | "es";
        };
        ErrorResponse: {
            details?: {
                [key: string]: unknown;
            };
            error: string;
            message: string;
            path: string;
            statusCode: number;
            timestamp: string;
        };
        ExistingReviewResponse: {
            id: string;
            inOtherGroupReview: boolean;
        };
        FavoriteRefDto: {
            id: string;
            kind: "ALBUM" | "TRACK";
        };
        FavoriteResponse: {
            addedAt: string;
            item: components["schemas"]["ItemSummaryResponse"];
            position: number;
        };
        GamificationRulesResponse: {
            awards: components["schemas"]["AwardRuleResponse"][];
            badges: components["schemas"]["BadgeRuleResponse"][];
            discTiers: components["schemas"]["DiscTierResponse"][];
            scoring: components["schemas"]["ScoreRuleResponse"][];
            writtenReviewMinLength: number;
        };
        GenreCountResponse: {
            count: number;
            genre: string;
        };
        GenreShowcaseResponse: {
            albums: components["schemas"]["AlbumSummaryResponse"][];
            genre: string;
        };
        GroupMemberResponse: {
            joinedAt: string;
            role: "OWNER" | "MEMBER";
            user: components["schemas"]["UserSummaryResponse"];
        };
        GroupRefResponse: {
            id: string;
            name: string;
        };
        GroupResponse: {
            createdAt: string;
            description: string | null;
            id: string;
            inviteCode: string;
            members: components["schemas"]["GroupMemberResponse"][];
            membersCount: number;
            name: string;
            owner: components["schemas"]["UserSummaryResponse"];
            visibility: "PUBLIC" | "PRIVATE";
        };
        GroupReviewEntryDto: {
            body?: Record<string, never> | null;
            rating: number;
        };
        GroupReviewGroupResponse: {
            id: string;
            membersCount: number;
            name: string;
            visibility: "PUBLIC" | "PRIVATE";
        };
        GroupReviewResponse: {
            averageRating: number | null;
            createdAt: string;
            entries: components["schemas"]["ReviewResponse"][];
            group: components["schemas"]["GroupReviewGroupResponse"];
            id: string;
            item: components["schemas"]["ItemSummaryResponse"];
            proposedBy: components["schemas"]["UserSummaryResponse"] | null;
            viewer: components["schemas"]["GroupReviewViewerResponse"] | null;
        };
        GroupReviewViewerResponse: {
            canCancel: boolean;
            entryId: string | null;
            existingReview: components["schemas"]["ExistingReviewResponse"] | null;
            isMember: boolean;
        };
        GroupSummaryResponse: {
            createdAt: string;
            description: string | null;
            id: string;
            membersCount: number;
            myRole: "OWNER" | "MEMBER";
            name: string;
            visibility: "PUBLIC" | "PRIVATE";
        };
        GroupTopItemResponse: {
            averageRating: number;
            item: components["schemas"]["ItemSummaryResponse"];
            reviewsCount: number;
        };
        HumanCheckResponse: {
            provider: "turnstile" | null;
            scriptUrl: string | null;
            siteKey: string | null;
        };
        InvitePreviewResponse: {
            description: string | null;
            membersCount: number;
            name: string;
            owner: components["schemas"]["UserSummaryResponse"];
        };
        ItemStatsResponse: {
            averageRating: number | null;
            distribution: components["schemas"]["RatingDistributionResponse"][];
            itemId: string;
            itemType: "ALBUM" | "TRACK";
            reviewsCount: number;
            viewerReview: components["schemas"]["ReviewResponse"] | null;
        };
        ItemSummaryResponse: {
            albumTitle: string | null;
            artistName: string | null;
            coverUrl: string | null;
            id: string;
            releaseDate: string | null;
            title: string;
            type: "ALBUM" | "TRACK" | "ARTIST";
        };
        JoinGroupDto: {
            inviteCode: string;
        };
        LabelResponse: {
            catalogNumber: string | null;
            name: string;
        };
        LibraryStackResponse: {
            review: components["schemas"]["ReviewResponse"];
            tracks: components["schemas"]["ReviewResponse"][];
        };
        LibrarySummaryResponse: {
            albumsCount: number;
            averageRating: number | null;
            distribution: components["schemas"]["RatingDistributionResponse"][];
            reviewsCount: number;
            topGenres: components["schemas"]["GenreCountResponse"][];
            tracksCount: number;
            user: components["schemas"]["UserSummaryResponse"];
        };
        LifeSpanResponse: {
            begin: string | null;
            end: string | null;
            ended: boolean;
        };
        LikeResultResponse: {
            liked: boolean;
            likes: number;
            reviewId: string;
        };
        ListenLaterRefDto: {
            id: string;
            kind: "ALBUM" | "TRACK" | "ARTIST";
        };
        ListenLaterResponse: {
            addedAt: string;
            item: components["schemas"]["ItemSummaryResponse"];
        };
        LoginDto: {
            login: string;
            password: string;
        };
        MonthlyAwardsResponse: {
            categories: components["schemas"]["AwardCategoryResultResponse"][];
            period: string | null;
        };
        MonthlyListenersResponse: {
            count: number;
            month: string;
        };
        NextBadgeTierResponse: {
            threshold: number;
            tier: number;
            tierName: string;
        };
        NextDiscResponse: {
            label: string;
            minReviews: number;
            remaining: number;
            tier: string;
        };
        PageMetaResponse: {
            limit: number;
            page: number;
            total: number;
            totalPages: number;
        };
        PasswordResetAcceptedResponse: {
            expiresInMinutes: number;
        };
        PasswordResetCheckResponse: {
            email?: string;
            expiresAt?: string;
            fullName?: string;
            username?: string;
            valid: boolean;
        };
        PasswordResetConfirmDto: {
            locale: "pt-BR" | "en" | "es";
            newPassword: string;
            token: string;
        };
        PasswordResetRequestDto: {
            email: string;
            locale: "pt-BR" | "en" | "es";
        };
        PasswordResetSentResponse: {
            email: string;
            expiresInMinutes: number;
        };
        PasswordResetTokenDto: {
            token: string;
        };
        PlaylistItemResponse: {
            addedAt: string;
            id: string;
            item: components["schemas"]["ItemSummaryResponse"] | null;
            kind: "ALBUM" | "TRACK" | "ARTIST" | "REVIEW";
            note: string | null;
            position: number;
            review: components["schemas"]["PlaylistReviewResponse"] | null;
        };
        PlaylistResponse: {
            coverUrls: string[];
            createdAt: string;
            description: string | null;
            id: string;
            items: components["schemas"]["PlaylistItemResponse"][];
            itemsCount: number;
            owner: components["schemas"]["UserSummaryResponse"];
            title: string;
            updatedAt: string;
            visibility: "PUBLIC" | "PRIVATE";
        };
        PlaylistReviewResponse: {
            author: components["schemas"]["UserSummaryResponse"];
            body: string | null;
            id: string;
            item: components["schemas"]["ItemSummaryResponse"];
            likes: number;
            rating: number;
        };
        PlaylistSummaryResponse: {
            coverUrls: string[];
            createdAt: string;
            description: string | null;
            id: string;
            itemsCount: number;
            owner: components["schemas"]["UserSummaryResponse"];
            title: string;
            updatedAt: string;
            visibility: "PUBLIC" | "PRIVATE";
        };
        PointsTotalsResponse: {
            notoriety: number;
            participation: number;
            total: number;
        };
        ProfileSharePayloadResponse: {
            imageUrl: string | null;
            qrCode: components["schemas"]["QrCodeLinksResponse"];
            targets: components["schemas"]["ShareTargetResponse"][];
            text: string;
            title: string;
            url: string;
        };
        ProfileShareResponse: {
            profileUrl: string;
            qrCodePng: string;
            qrCodeSvg: string;
        };
        ProfileStatsResponse: {
            albums: number;
            averageRating: number | null;
            publicPlaylists: number;
            reviews: number;
            tracks: number;
        };
        ProposeGroupReviewDto: {
            itemId: string;
            itemType: "ALBUM" | "TRACK";
        };
        PublicProfileResponse: {
            avatarUrl: string | null;
            awards: components["schemas"]["AwardResponse"][];
            badges: components["schemas"]["EarnedBadgeResponse"][];
            bio: string | null;
            disc: components["schemas"]["DiscBadgeResponse"];
            favoriteGenres: string[];
            fullName: string;
            id: string;
            memberSince: string;
            points: components["schemas"]["UserProgressPointsResponse"];
            publicPlaylists: number;
            ranking: components["schemas"]["UserProgressRankingResponse"];
            ratingDistribution: components["schemas"]["RatingDistributionResponse"][];
            recentAlbumReviews: components["schemas"]["ReviewResponse"][];
            share: components["schemas"]["ProfileShareResponse"];
            stats: components["schemas"]["ProfileStatsResponse"];
            topGenres: components["schemas"]["GenreCountResponse"][];
            username: string;
        };
        PublicProgressResponse: {
            awards: components["schemas"]["AwardResponse"][];
            badges: components["schemas"]["EarnedBadgeResponse"][];
            disc: components["schemas"]["DiscBadgeResponse"];
            points: components["schemas"]["UserProgressPointsResponse"];
            ranking: components["schemas"]["UserProgressRankingResponse"];
            user: components["schemas"]["UserSummaryResponse"];
        };
        QrCodeLinksResponse: {
            png: string;
            svg: string;
        };
        RankingEntryResponse: {
            notoriety: number;
            participation: number;
            position: number;
            total: number;
            user: components["schemas"]["UserSummaryResponse"];
        };
        RatingDistributionResponse: {
            count: number;
            rating: number;
        };
        RefreshTokenDto: {
            refreshToken?: string;
        };
        RegisterDto: {
            birthDate: string;
            email: string;
            fullName: string;
            password: string;
            username: string;
        };
        ReplaceFavoritesDto: {
            items: components["schemas"]["FavoriteRefDto"][];
        };
        ReviewGroupLinkResponse: {
            group: components["schemas"]["GroupRefResponse"];
            id: string;
        };
        ReviewResponse: {
            author: components["schemas"]["UserSummaryResponse"];
            body: string | null;
            createdAt: string;
            edited: boolean;
            groupReview: components["schemas"]["ReviewGroupLinkResponse"] | null;
            id: string;
            item: components["schemas"]["ItemSummaryResponse"];
            likes: number;
            rating: number;
            updatedAt: string;
            viewer: components["schemas"]["ViewerContextResponse"] | null;
            visibility: "PUBLIC" | "GROUP" | "PRIVATE";
        };
        ScoreRuleResponse: {
            category: "PARTICIPATION" | "NOTORIETY";
            description: string;
            points: number;
            reason: string;
        };
        SharePayloadResponse: {
            imageUrl: string | null;
            targets: components["schemas"]["ShareTargetResponse"][];
            text: string;
            title: string;
            url: string;
        };
        ShareTargetResponse: {
            label: string;
            method: "LINK" | "WEB_SHARE_API";
            network: "whatsapp" | "telegram" | "x" | "facebook" | "instagram" | "spotify";
            url: string | null;
        };
        SourceResponse: {
            license: string;
            provider: string;
            url: string;
        };
        StreamingLinksResponse: {
            amazonMusic?: string;
            appleMusic?: string;
            bandcamp?: string;
            deezer?: string;
            qobuz?: string;
            soundcloud?: string;
            spotify?: string;
            tidal?: string;
            youtube?: string;
            youtubeMusic?: string;
        };
        TrackAlbumResponse: {
            id: string | null;
            title: string;
        };
        TrackChartEntryResponse: {
            item: components["schemas"]["TrackSummaryResponse"];
            listenCount: number;
            listenerCount: number | null;
            monthlyListeners: components["schemas"]["MonthlyListenersResponse"] | null;
            position: number;
        };
        TrackCreditResponse: {
            artist: components["schemas"]["ArtistRefResponse"];
            attributes: string[];
            role: string;
        };
        TrackDetailsResponse: {
            album: components["schemas"]["TrackAlbumResponse"] | null;
            appearsOn: components["schemas"]["AppearsOnResponse"][];
            artistCredit: string;
            artists: components["schemas"]["ArtistRefResponse"][];
            cover: components["schemas"]["CoverArtResponse"] | null;
            credits: components["schemas"]["TrackCreditResponse"][];
            disambiguation: string | null;
            durationMs: number | null;
            firstReleaseDate: string | null;
            genres: string[];
            id: string;
            isrcs: string[];
            links: components["schemas"]["StreamingLinksResponse"];
            listenCount: number | null;
            listenerCount: number | null;
            source: components["schemas"]["SourceResponse"];
            title: string;
            work: components["schemas"]["TrackWorkResponse"] | null;
        };
        TrackSummaryResponse: {
            album: components["schemas"]["TrackAlbumResponse"] | null;
            artistCredit: string;
            artists: components["schemas"]["ArtistRefResponse"][];
            cover: components["schemas"]["CoverArtResponse"] | null;
            durationMs: number | null;
            firstReleaseDate: string | null;
            id: string;
            listenCount: number | null;
            listenerCount: number | null;
            title: string;
        };
        TrackWorkResponse: {
            composers: components["schemas"]["ArtistRefResponse"][];
            id: string;
            lyricists: components["schemas"]["ArtistRefResponse"][];
            title: string;
            writers: components["schemas"]["ArtistRefResponse"][];
        };
        TrendingItemResponse: {
            averageRating: number | null;
            item: components["schemas"]["ItemSummaryResponse"];
            reviewsCount: number;
        };
        UpdateGroupDto: {
            description?: Record<string, never> | null;
            name?: string;
            visibility?: "PUBLIC" | "PRIVATE";
        };
        UpdatePlaylistDto: {
            description?: Record<string, never> | null;
            title?: string;
            visibility?: "PUBLIC" | "PRIVATE";
        };
        UpdatePlaylistItemDto: {
            note?: Record<string, never> | null;
            position?: number;
        };
        UpdateProfileDto: {
            avatarUrl?: Record<string, never> | null;
            bio?: Record<string, never> | null;
            favoriteGenres?: string[];
            fullName?: string;
        };
        UpdateReviewDto: {
            body?: Record<string, never> | null;
            rating?: number;
            visibility?: "PUBLIC" | "PRIVATE";
        };
        UserProgressPointsResponse: {
            allTime: components["schemas"]["PointsTotalsResponse"];
            thisMonth: components["schemas"]["PointsTotalsResponse"];
        };
        UserProgressRankingResponse: {
            allTime: number | null;
            thisMonth: number | null;
        };
        UserProgressResponse: {
            awards: components["schemas"]["AwardResponse"][];
            badges: components["schemas"]["BadgeProgressResponse"][];
            disc: components["schemas"]["DiscProgressResponse"];
            points: components["schemas"]["UserProgressPointsResponse"];
            ranking: components["schemas"]["UserProgressRankingResponse"];
            user: components["schemas"]["UserSummaryResponse"];
        };
        UserSummaryResponse: {
            avatarUrl: string | null;
            disc: components["schemas"]["DiscBadgeResponse"];
            fullName: string;
            id: string;
            username: string;
        };
        ViewerContextResponse: {
            isAuthor: boolean;
            liked: boolean;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    AdsTxtController_file: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    HealthController_check: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GamificationController_compute_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                period: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MonthlyAwardsResponse"];
                };
            };
        };
    };
    AdsController_config_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdsConfigResponse"];
                };
            };
        };
    };
    CatalogController_album_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AlbumDetailsResponse"];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    ItemReviewsController_albumReviews_v1: {
        parameters: {
            query?: {
                limit?: number;
                page?: number;
                sort?: "recent" | "popular" | "rating_desc" | "rating_asc";
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["ReviewResponse"][];
                    };
                };
            };
        };
    };
    ItemReviewsController_albumStats_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ItemStatsResponse"];
                };
            };
        };
    };
    CatalogController_artist_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ArtistDetailsResponse"];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    AuthController_checkAccountDeletion_v1: {
        parameters: {
            query?: never;
            header?: {
                "x-session-transport"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AccountDeletionTokenDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccountDeletionCheckResponse"];
                };
            };
        };
    };
    AuthController_confirmAccountDeletion_v1: {
        parameters: {
            query?: never;
            header: {
                "user-agent": string;
                "x-session-transport"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AccountDeletionConfirmDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    AuthController_humanCheckWidget_v1: {
        parameters: {
            query?: never;
            header?: {
                "x-session-transport"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HumanCheckResponse"];
                };
            };
        };
    };
    AuthController_login_v1: {
        parameters: {
            query?: never;
            header: {
                "user-agent": string;
                "x-human-check"?: string;
                "x-session-transport"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponse"];
                };
            };
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    AuthController_logout_v1: {
        parameters: {
            query?: never;
            header?: {
                "x-session-transport"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshTokenDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_logoutAll_v1: {
        parameters: {
            query?: never;
            header: {
                "user-agent": string;
                "x-session-transport"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_requestPasswordReset_v1: {
        parameters: {
            query?: never;
            header?: {
                "x-human-check"?: string;
                "x-session-transport"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordResetRequestDto"];
            };
        };
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PasswordResetAcceptedResponse"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    AuthController_checkPasswordReset_v1: {
        parameters: {
            query?: never;
            header?: {
                "x-session-transport"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordResetTokenDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PasswordResetCheckResponse"];
                };
            };
        };
    };
    AuthController_confirmPasswordReset_v1: {
        parameters: {
            query?: never;
            header: {
                "user-agent": string;
                "x-session-transport"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordResetConfirmDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    AuthController_refresh_v1: {
        parameters: {
            query?: never;
            header: {
                "user-agent": string;
                "x-session-transport"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshTokenDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponse"];
                };
            };
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    AuthController_register_v1: {
        parameters: {
            query?: never;
            header: {
                "user-agent": string;
                "x-human-check"?: string;
                "x-session-transport"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponse"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GamificationController_awards_v1: {
        parameters: {
            query?: {
                period?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MonthlyAwardsResponse"];
                };
            };
        };
    };
    CatalogController_albumChart_v1: {
        parameters: {
            query?: {
                limit?: number;
                range?: "week" | "month" | "year" | "all_time";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AlbumChartEntryResponse"][];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    CatalogController_artistChart_v1: {
        parameters: {
            query?: {
                limit?: number;
                range?: "week" | "month" | "year" | "all_time";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ArtistChartEntryResponse"][];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    CatalogController_trackChart_v1: {
        parameters: {
            query?: {
                limit?: number;
                range?: "week" | "month" | "year" | "all_time";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TrackChartEntryResponse"][];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GamificationController_gamificationRules_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GamificationRulesResponse"];
                };
            };
        };
    };
    CatalogController_genres_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    CatalogController_showcase_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenreShowcaseResponse"][];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    CatalogController_suggestedAlbums_v1: {
        parameters: {
            query: {
                genres: string;
                limit?: number;
                page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["AlbumSummaryResponse"][];
                    };
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    CatalogController_suggestedArtists_v1: {
        parameters: {
            query: {
                genres: string;
                limit?: number;
                page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["ArtistSummaryResponse"][];
                    };
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    CatalogController_suggestedTracks_v1: {
        parameters: {
            query: {
                genres: string;
                limit?: number;
                page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["TrackSummaryResponse"][];
                    };
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GroupReviewsController_findOne_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GroupReviewResponse"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GroupReviewsController_remove_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GroupReviewsController_saveMine_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GroupReviewEntryDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GroupReviewResponse"];
                };
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GroupsController_mine_v1: {
        parameters: {
            query?: {
                limit?: number;
                page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["GroupSummaryResponse"][];
                    };
                };
            };
        };
    };
    GroupsController_create_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateGroupDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GroupResponse"];
                };
            };
        };
    };
    GroupsController_findOne_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GroupResponse"];
                };
            };
        };
    };
    GroupsController_remove_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GroupsController_update_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateGroupDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GroupResponse"];
                };
            };
        };
    };
    GroupsController_feed_v1: {
        parameters: {
            query?: {
                limit?: number;
                page?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["ReviewResponse"][];
                    };
                };
            };
        };
    };
    GroupReviewsController_list_v1: {
        parameters: {
            query?: {
                limit?: number;
                page?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["GroupReviewResponse"][];
                    };
                };
            };
        };
    };
    GroupReviewsController_create_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProposeGroupReviewDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GroupReviewResponse"];
                };
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GroupsController_regenerateInvite_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GroupResponse"];
                };
            };
        };
    };
    GroupsController_leave_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GroupsController_removeMember_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GroupResponse"];
                };
            };
        };
    };
    GroupsController_ranking_v1: {
        parameters: {
            query?: {
                category?: "overall" | "participation" | "notoriety";
                limit?: number;
                page?: number;
                period?: "week" | "month" | "year" | "all_time";
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["RankingEntryResponse"][];
                    };
                };
            };
        };
    };
    GroupsController_topItems_v1: {
        parameters: {
            query?: {
                limit?: number;
                type?: "ALBUM" | "TRACK";
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GroupTopItemResponse"][];
                };
            };
        };
    };
    GroupsController_invite_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                code: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InvitePreviewResponse"];
                };
            };
        };
    };
    GroupsController_join_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["JoinGroupDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GroupResponse"];
                };
            };
        };
    };
    ImagesController_cover_v1: {
        parameters: {
            query?: never;
            header: {
                "if-none-match": string;
            };
            path: {
                file: string;
                kind: "release-group" | "release";
                mbid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/gif": components["schemas"]["ErrorResponse"];
                    "image/jpeg": components["schemas"]["ErrorResponse"];
                    "image/png": components["schemas"]["ErrorResponse"];
                    "image/webp": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    AccountController_me_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccountResponse"];
                };
            };
        };
    };
    AccountController_requestAccountDeletion_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EmailLocaleDto"];
            };
        };
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccountDeletionSentResponse"];
                };
            };
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    DiscoverController_albums_v1: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AlbumSummaryResponse"][];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    FavoritesController_mine_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FavoriteResponse"][];
                };
            };
        };
    };
    FavoritesController_replace_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReplaceFavoritesDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FavoriteResponse"][];
                };
            };
        };
    };
    FavoritesController_add_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FavoriteRefDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FavoriteResponse"][];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    FavoritesController_remove_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                kind: "ALBUM" | "TRACK";
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FavoriteResponse"][];
                };
            };
        };
    };
    MyLibraryController_library_v1: {
        parameters: {
            query?: {
                genre?: string;
                limit?: number;
                maxRating?: number;
                minRating?: number;
                page?: number;
                sort?: "recent" | "popular" | "rating_desc" | "rating_asc";
                type?: "ALBUM" | "TRACK";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["ReviewResponse"][];
                    };
                };
            };
        };
    };
    MyLibraryController_summary_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LibrarySummaryResponse"];
                };
            };
        };
    };
    ListenLaterController_mine_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListenLaterResponse"][];
                };
            };
        };
    };
    ListenLaterController_add_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ListenLaterRefDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListenLaterResponse"][];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    ListenLaterController_remove_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                kind: "ALBUM" | "TRACK" | "ARTIST";
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListenLaterResponse"][];
                };
            };
        };
    };
    AccountController_requestPasswordReset_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EmailLocaleDto"];
            };
        };
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PasswordResetSentResponse"];
                };
            };
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    PlaylistsController_mine_v1: {
        parameters: {
            query?: {
                limit?: number;
                page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["PlaylistSummaryResponse"][];
                    };
                };
            };
        };
    };
    AccountController_update_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateProfileDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccountResponse"];
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    GamificationController_myProgress_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserProgressResponse"];
                };
            };
        };
    };
    PlaylistsController_recent_v1: {
        parameters: {
            query?: {
                limit?: number;
                page?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["PlaylistSummaryResponse"][];
                    };
                };
            };
        };
    };
    PlaylistsController_create_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreatePlaylistDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlaylistResponse"];
                };
            };
        };
    };
    PlaylistsController_findOne_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlaylistResponse"];
                };
            };
        };
    };
    PlaylistsController_remove_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PlaylistsController_update_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdatePlaylistDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlaylistResponse"];
                };
            };
        };
    };
    PlaylistsController_addItem_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddPlaylistItemDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlaylistResponse"];
                };
            };
        };
    };
    PlaylistsController_removeItem_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                itemId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlaylistResponse"];
                };
            };
        };
    };
    PlaylistsController_updateItem_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                itemId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdatePlaylistItemDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlaylistResponse"];
                };
            };
        };
    };
    GamificationController_ranking_v1: {
        parameters: {
            query?: {
                category?: "overall" | "participation" | "notoriety";
                limit?: number;
                page?: number;
                period?: "week" | "month" | "year" | "all_time";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["RankingEntryResponse"][];
                    };
                };
            };
        };
    };
    ReviewsController_feed_v1: {
        parameters: {
            query?: {
                limit?: number;
                page?: number;
                period?: "week" | "month" | "year" | "all_time";
                sort?: "recent" | "popular";
                withText?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["ReviewResponse"][];
                    };
                };
            };
        };
    };
    ReviewsController_create_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateReviewDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReviewResponse"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    ReviewsController_findOne_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReviewResponse"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    ReviewsController_remove_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReviewsController_update_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateReviewDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReviewResponse"];
                };
            };
        };
    };
    ReviewsController_like_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LikeResultResponse"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    ReviewsController_unlike_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LikeResultResponse"];
                };
            };
        };
    };
    CatalogController_searchAlbums_v1: {
        parameters: {
            query: {
                limit?: number;
                page?: number;
                q: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["AlbumSummaryResponse"][];
                    };
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    CatalogController_searchArtists_v1: {
        parameters: {
            query: {
                limit?: number;
                page?: number;
                q: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["ArtistSummaryResponse"][];
                    };
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    CatalogController_searchTracks_v1: {
        parameters: {
            query: {
                limit?: number;
                page?: number;
                q: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["TrackSummaryResponse"][];
                    };
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    PeopleSearchController_searchUsers_v1: {
        parameters: {
            query: {
                limit?: number;
                page?: number;
                q: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["UserSummaryResponse"][];
                    };
                };
            };
        };
    };
    SeoController_head_v1: {
        parameters: {
            query?: {
                path?: string;
            };
            header?: {
                "x-seo-path"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/html": string;
                };
            };
        };
    };
    SeoController_sitemapIndex_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/xml": string;
                };
            };
        };
    };
    SeoController_sitemapFile_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                file: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/xml": string;
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/xml": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    SharingController_shareGroup_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SharePayloadResponse"];
                };
            };
        };
    };
    SharingController_sharePlaylist_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SharePayloadResponse"];
                };
            };
        };
    };
    SharingController_shareReview_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SharePayloadResponse"];
                };
            };
        };
    };
    SharingController_shareProfile_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                username: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfileSharePayloadResponse"];
                };
            };
        };
    };
    CatalogController_track_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TrackDetailsResponse"];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    ItemReviewsController_trackReviews_v1: {
        parameters: {
            query?: {
                limit?: number;
                page?: number;
                sort?: "recent" | "popular" | "rating_desc" | "rating_asc";
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["ReviewResponse"][];
                    };
                };
            };
        };
    };
    ItemReviewsController_trackStats_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ItemStatsResponse"];
                };
            };
        };
    };
    ItemReviewsController_trending_v1: {
        parameters: {
            query?: {
                limit?: number;
                period?: "week" | "month" | "year" | "all_time";
                type?: "ALBUM" | "TRACK";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TrendingItemResponse"][];
                };
            };
        };
    };
    ProfilesController_profile_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                username: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicProfileResponse"];
                };
            };
        };
    };
    FavoritesController_ofUser_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                username: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FavoriteResponse"][];
                };
            };
        };
    };
    GroupReviewsController_byMember_v1: {
        parameters: {
            query?: {
                limit?: number;
                page?: number;
            };
            header?: never;
            path: {
                username: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["GroupReviewResponse"][];
                    };
                };
            };
        };
    };
    ItemReviewsController_library_v1: {
        parameters: {
            query?: {
                genre?: string;
                limit?: number;
                maxRating?: number;
                minRating?: number;
                page?: number;
                sort?: "recent" | "popular" | "rating_desc" | "rating_asc";
                type?: "ALBUM" | "TRACK";
            };
            header?: never;
            path: {
                username: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["ReviewResponse"][];
                    };
                };
            };
        };
    };
    ItemReviewsController_libraryStacks_v1: {
        parameters: {
            query?: {
                genre?: string;
                limit?: number;
                maxRating?: number;
                minRating?: number;
                page?: number;
                sort?: "recent" | "popular" | "rating_desc" | "rating_asc";
                type?: "ALBUM" | "TRACK";
            };
            header?: never;
            path: {
                username: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["LibraryStackResponse"][];
                    };
                };
            };
        };
    };
    ItemReviewsController_librarySummary_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                username: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LibrarySummaryResponse"];
                };
            };
        };
    };
    PlaylistsController_byUser_v1: {
        parameters: {
            query?: {
                limit?: number;
                page?: number;
            };
            header?: never;
            path: {
                username: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageMetaResponse"] & {
                        items: components["schemas"]["PlaylistSummaryResponse"][];
                    };
                };
            };
        };
    };
    GamificationController_progress_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                username: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicProgressResponse"];
                };
            };
        };
    };
    SharingController_qrCode_v1: {
        parameters: {
            query?: {
                format?: "png" | "svg";
                size?: number;
            };
            header?: never;
            path: {
                username: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
