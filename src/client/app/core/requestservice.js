(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('requestservice', requestservice);

    requestservice.$inject = ['$http', '$q', 'logger', 'UserModel', '$state', 'config'];
    /* @ngInject */
    function requestservice($http, $q, logger, UserModel, $state, config) {
        var baseDomain = config.protocol + '://' + config.domainEndpoint + config.portEndpoint;
        var endpoints = {

            // global block

            getCurrentWeekNumber: {url: '/api/v1/seasons/cur_week_number', method: 'GET'},
            getCurrentSeason: {url: '/api/v1/seasons/cur_season', method: 'GET'},
            getAllSeason: {url: '/api/v1/seasons', method: 'GET'},

            // auth block
            saveNewPassword: {url: '/api/v1/auth/save_new_password', method: 'PUT'},
            signIn: {url: '/api/v1/auth/signin', method: 'POST'},
            signUp: {url: '/api/v1/auth/signup', method: 'POST'},
            signOut: {url: '/api/v1/auth/signout', method: 'DELETE'},
            checkAuth: {url: '/api/v1/auth/vat', method: 'GET'},
            sendPasswordLink: {url: '/api/v1/auth/try_forgot_password', method: 'POST'},
            getUserByEmail: {url: '/api/v1/get_user_by_email', method: 'GET'},
            deleteAccount: {url: '/api/v1/delete_account', method: 'POST'},

            // league block

            createLeague: {url: '/api/v1/leagues', method: 'POST'},
            listOfLeagues: {url: '/api/v1/leagues', method: 'GET'},
            oneLeague: {url: '/api/v1/leagues/:id', method: 'GET'},
            leagueWithFormations: {url: '/api/v1/leagues/:league_id/show_with_formations', method: 'GET'},
            getLeagueClubsList: {url: '/api/v1/leagues/:league_id/league_clubs_list', method: 'GET'},
            getLeagueClubsListWithPatterns: {url: '/api/v1/leagues/:league_id/league_clubs_list_with_patterns', method: 'GET'},

            listOfLeagueInvites: {url: '/api/v1/leagues/:league_id/league_invites', method: 'GET'},
            inviteSomeoneToLeague: {url: '/api/v1/leagues/:league_id/league_invites', method: 'POST'},
            sendReminder: {url: '/api/v1/leagues/my_league_invites/send_reminder', method: 'POST'},

            myInvitesInLeagues: {url: '/api/v1/leagues/my_league_invites', method: 'GET'},

            acceptInvitation: {url: '/api/v1/leagues/:league_id/club/:club_id/connect', method: 'POST'},
            rejectInvitation: {url: '/api/v1/leagues/:league_id/reject_invite', method: 'PUT'},
            removeClubFromLeague: {url: '/api/v1/leagues/:league_id/club/:club_id/disconnect', method: 'POST'},
            getPublicLeagues: {url: '/api/v1/leagues/public_leagues', method: 'GET'},

            // club block

            createClub: {url: '/api/v1/clubs', method: 'POST'},
            updateClub: {url: '/api/v1/clubs/:id', method: 'PUT'},
            listOfClubs: {url: '/api/v1/clubs', method: 'GET'},
            listOfUserClubs: {url: '/api/v1/list_of_user_clubs', method: 'GET'},
            oneClub: {url: '/api/v1/clubs/:id', method: 'GET'},
            checkClubName: {url: '/api/v1/clubs/check_unique', method: 'POST'},

            // crest block

            crestShapes: {url: '/api/v1/crest/shapes', method: 'GET'},

            // draft

            draftPlayer: {url: '/api/v1/draft/:league_id/take_footballer/:footballer_id', method: 'POST'},

            makeUndo: {url: '/api/v1/draft/:league_id/undo', method: 'POST'},

            draftStart: {url: '/api/v1/leagues/:league_id/start_draft', method: 'PUT'},
            draftStatus: {url: '/api/v1/draft/:league_id/short_draft_status', method: 'GET'},
            draftResult: {url: '/api/v1/draft/:league_id/result', method: 'GET'},
            toggleAutopick: {url: '/api/v1/draft/:league_id/switch_auto_pick', method: 'PUT'},

            // draft chat block

            createMessage: {url: '/api/v1/leagues/:league_id/chats', method: 'POST'},
            getMessages: {url: '/api/v1/leagues/:league_id/chats', method: 'GET'},

            // draft footballers block

            footballersList: {url: '/api/v1/leagues/:league_id/footballers', method: 'GET'},
            addToPersonalQueue: {url: '/api/v1/draft/:league_id/player_to_queue/:footballer_id', method: 'PUT'},
            removeFromPersonalQueue: {url: '/api/v1/draft/:league_id/personal_queue/:order_in_q', method: 'DELETE'},
            moveInsidePersonalQueue: {url: '/api/v1/draft/:league_id/move_in_queue/', method: 'PUT'},
            getRealTeams: {url: '/api/v1/leagues/:league_id/real_teams', method: 'GET'},
            getRealTeamsList: {url: '/api/v1/real_teams/:league_id/real_teams_list', method: 'GET'},

            // draft personal queue block

            personalQueue: {url: '/api/v1/draft/:virtual_club_id/personal_queue', method: 'GET'},

            //league draft queue
            getLeagueDraftQueue: {url: '/api/v1/league_draft_queue/:league_id', method: 'GET'},
            updateClubsOrderInDraftQueue: {url: '/api/v1/league_draft_queue/:league_id/update_clubs_order_in_queue', method: 'POST'},
            randomizeLeagueDraftQueue: {url: '/api/v1/league_draft_queue/:league_id/randomize_league_draft_queue', method: 'POST'},

            //lineup

            getLineUpData: {url: '/api/v1/line_up/:club_id/:round_week_num/line_up_data', method: 'GET'},
            getLineUpDataByClub: {url: '/api/v1/line_up/:club_id/:round_week_num/line_up_data_for_club', method: 'GET'},
            changeLineUpFormation: {url: '/api/v1/line_up/:club_id/:round_week_num/change_line_up_format', method: 'PUT'},
            movePlayer: {url: '/api/v1/line_up/:club_id/:round_week_num/move_player', method: 'PUT'},

            // league
            getMainStatTable: {url: '/api/v1/match_day_league/:league_id/get_main_stat_tbl', method: 'GET'},
            getShortStatTable: {url: '/api/v1/match_day_league/:league_id/get_short_stat_tbl', method: 'GET'},
            getShortMatchDayData: {url: '/api/v1/match_day_league/:league_id/my_vf_data/:round_week_num', method: 'GET'},
            getLastNews: {url: '/api/v1/match_day_league/:league_id/news_by_league_or_club', method: 'GET'},
            getUserClubStat: {url: '/api/v1/match_day_league/:league_id/my_club_in_league_stat', method: 'GET'},
            getMessagesByLeague: {url: '/api/v1/match_day/:league_id/messages', method: 'GET'},
            getLeagueFixtures: {url: '/api/v1/match_day/:league_id/fixtures_table/:round_num', method: 'GET'},
            getLeagueCode: {url: '/api/v1/leagues/:league_id/code', method: 'GET'},
            getLeagueInfo: {url: '/api/v1/leagues/:league_code/link', method: 'GET'},
            setLeagueDraftTime: {url: '/api/v1/leagues/:league_id/set_league_draft_time', method: 'POST'},
            setTimePerPick: {url: '/api/v1/leagues/:league_id/set_time_per_pick', method: 'POST'},
            getLeagueDraftSettings: {url: '/api/v1/leagues/:league_id/league_draft_settings', method: 'GET'},
            updateLeagueBasics: {url: '/api/v1/leagues/:league_id', method: 'PUT'},
            getLeagueSquadSize: {url: '/api/v1/leagues/:league_id/league_squad_size', method: 'GET'},
            checkIfLeagueCanAcceptInvite: {url: '/api/v1/league_invites/:invite_id/check_league_can_accept_invite', method: 'GET'},

            //match day
            getFullVirtualFixtureDataFromCache: {url: '/api/v1/match_day/:league_id/:round_week_num/virtual_fixture_from_cache/:virt_fixture_id', method: 'GET'},
            getRoundList: {url: '/api/v1/match_day/:league_id/round_list', method: 'GET'},
            getRoundInfo: {url: '/api/v1/match_day/:league_id/:round_week_num/virtual_round_info', method: 'GET'},

            // club profile
            getClubFixturesResults: {url: '/api/v1/club_fixtures/:club_id', method: 'GET'},
            // getClubStats: {url: '/api/v1/leagues/:league_id/get_clubs_short_stats', method: 'GET'},
            getClubInfo: {url: '/api/v1/leagues/:id/club_info', method: 'GET'},

            // Players
            getPlayersTable: {url: '/api/v1/players_table', method: 'GET'},
            getPlayersBasic: {url: '/api/v1/player_stats', method: 'GET'},
            getPlayersNews: {url: '/api/v1/get_news', method: 'POST'},
            getAllPlayersStats: {url: '/api/v1/all_players_stats', method: 'GET'},

            //league settings
            saveLeagueDescription: {url: '/api/v1/league/public_listing/:league_id', method: 'POST'},
            getCategoriesData: {url: '/api/v1/leagues/:league_id/scoring_type', method: 'GET'},
            getCategData: {url: '/api/v1/league_scoring_type', method: 'GET'},
            getScoringTypeData: {url: '/api/v1/leagues/:league_id/get_scoring_type', method: 'GET'},
            changeCategoriesData: {url: '/api/v1/leagues/:league_id/sync_cats_data', method: 'PUT'},
            changePointsData: {url: '/api/v1/leagues/:league_id/sync_points_data', method: 'PUT'},
            setScoringSettingsType: {url: '/api/v1/leagues/:league_id/set_scoring_is_def', method: 'PUT'},
            setScoringType: {url: '/api/v1/leagues/:league_id/set_scoring_type', method: 'PUT'},
            resetScoringTypeToDefault: {url: '/api/v1/leagues/:league_id/reset_scoring_to_def', method: 'POST'},
            resetCategoriesDataToDefault: {url: '/api/v1/leagues/:league_id/reset_scoring_to_def', method: 'POST'},
            getFinStatus: {url: '/api/v1/leagues/:league_id/fin_status', method: 'GET'},
            setFinStatus: {url: '/api/v1/leagues/:league_id/fin_status', method: 'PUT'},
            getTransferBasicSettings: {url: '/api/v1/leagues/:league_id/tran_basic_settings', method: 'GET'},
            setTransferBasicSettings: {url: '/api/v1/leagues/:league_id/tran_basic_settings', method: 'PUT'},
            getAdditionalSettings: {url: '/api/v1/leagues/:league_id/tran_addit_setting', method: 'GET'},
            setAdditionalSettings: {url: '/api/v1/leagues/:league_id/tran_addit_setting', method: 'PUT'},
            setTransferDeadlines: {url: '/api/v1/leagues/:league_id/set_transfer_deadlines', method: 'POST'},
            setSquadSettings: {url: '/api/v1/leagues/:league_id/set_squad_settings', method: 'POST'},
            setFixtureSettings: {url: '/api/v1/leagues/:league_id/set_fixture_settings', method: 'POST'},
            saveLeagueSettings: {url: '/api/v1/league_settings/:league_id/save_league_settings', method: 'POST'},

            //Features
            getFeatures: {url: '/api/v1/blog/features', method: 'GET'},

            //transfers
            takeFreeAgent: {url: '/api/v1/clubs/:id/take_free_agent', method: 'POST'},
            dropPlayer: {url: '/api/v1/clubs/:id/drop_player', method: 'POST'},
            transferTeamToTeam: {url: '/api/v1/bids/create_team_to_team_bid', method: 'POST'},
            createWaiverBid: {url: '/api/v1/waiver_bids/create_waiver_bid', method: 'POST'},
            getWaiverBids: {url: '/api/v1/waiver_bids', method: 'GET'},
            deleteWaiverBid: {url: '/api/v1/waiver_bids/remove_bid', method: 'POST'},

            getBids: {url: '/api/v1/bids', method: 'GET'},
            getUserRequestedBids: {url: '/api/v1/bids/user_requested_bids', method: 'GET'},
            acceptBid: {url: '/api/v1/bids/accept_bid', method: 'POST'},
            rejectBid: {url: '/api/v1/bids/reject_bid', method: 'POST'},
            revokeBid: {url: '/api/v1/bids/revoke_bid', method: 'POST'},

            getListTransfer: {url: '/api/v1/transfers/:league_id', method: 'GET'},
            getListTrends: {url: '/api/v1/trends/:league_id', method: 'GET'},
            getNotApprovedBids: {url: '/api/v1/bids/:league_id/admin', method: 'GET'},
            approveBid: {url: '/api/v1/bids/:league_id/:bid_id/approve_bid', method: 'POST'},
            vetoBid: {url: '/api/v1/bids/:league_id/:bid_id/veto_bid', method: 'POST'},

            //Promotions
            createPromotion: {url: '/api/v1/promotions/create', method: 'POST'},
            updatePromotion: {url: '/api/v1/promotions/update', method: 'POST'},
            getPromotion: {url: '/api/v1/promotions/index', method: 'POST'},
            changeEnableStatus: {url: '/api/v1/promotions/change_enable_status', method: 'POST'},

            // news
            getCmsNewsByType: {url: '/api/v1/cms_news_by_type', method: 'GET'},
            getInjuriesAndSuspensions: {url: '/api/v1/get_injuries_and_suspensions', method: 'GET'},
            getLastPlayersNews: {url: '/api/v1/get_players_news', method: 'GET'},

            //notifications
            getNotifications: {url: '/api/v1/notifications/get_notifications', method: 'GET'},
            getLeagueNotifications: {url: '/api/v1/notifications/get_league_notifications', method: 'GET'},
            markNotificationViewed: {url: '/api/v1/notifications/mark_as_viewed', method: 'POST'},

            //Feedback
            sendFeedback: {url: '/api/v1/create_feedback', method: 'POST'},

            //Subscription
            startTrial: {url: '/api/v1/subscription/trial/:user_id', method: 'POST'},
            getSubscriptions: {url: '/api/v1/subscriptions', method: 'GET'},
            createSubscription: {url: '/api/v1/subscriptions', method: 'POST'},
            getClientToken: {url: '/api/v1/subscription/client_token', method: 'GET'},
            getUserSubscriptionStatus: {url: '/api/v1/subscription/user_status', method: 'GET'},
            sendEmailToLeagueMembers: {url: '/api/v1/leagues/:league_id/league_messages', method: 'POST'},
            clubTransactions: {url: '/api/v1/total_trasfers/:club_id', method: 'GET'},
            getEplFixtures: {url: '/api/v1/leagues/:league_id/epl_fixtures', method: 'GET'},
            checkConfirmationCode: {url: '/api/v1/email_confirm/:confirm_code', method: 'GET'},
            saveAutoSub: { url: '/api/v1/save_auto_sub', method: 'POST'},
        };

        var service = {
            run: makeRequest
        };

        return service;

        function makeRequest(endpoint, data, inputHeaders) {
            var url = endpoints[endpoint].url;
            var headers = inputHeaders || {};
            headers['Content-Type'] = 'application/json';

            if (typeof UserModel.data['auth_token'] !== 'undefined' &&
                UserModel.data['auth_token'] !== null)
            {
                headers['X-Auth-Token'] = UserModel.data['auth_token'];
            }

            if (data['url_params'])
            {
                var keysArr = Object.keys(data['url_params']);
                keysArr.forEach(function(oneKey) {
                    url = url.replace(oneKey, data['url_params'][oneKey]);
                });

                delete data['url_params'];
            }

            var sendData = {
                method: endpoints[endpoint].method,
                url: baseDomain + url,
                headers: headers
            };

            if (endpoints[endpoint].method === 'GET') {
                data['t'] = new Date().getTime();
                sendData['params'] = data;
            } else {
                sendData['data'] = data;
            }

            return $http(sendData)
            .then(success)
            .catch(error);

            function success(response) {
                if (response.data.success.toString() === '401') {
                    UserModel.isSignedIn = false;
                }
                return response;
            }

            function error(xhr, ajaxOptions, thrownError) {
                console.log('Error caused with error status ' + xhr.status);
                if (thrownError) { console.log(thrownError); }
            }

        }

    }
})();
