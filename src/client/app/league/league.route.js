(function() {
    'use strict';

    angular
        .module('app.league')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'new_league_invite_owners',
                config: {
                    url: '/leagues/:league_id/invite',
                    params: {'league_id': '0'},
                    templateUrl: 'app/league/new_league_invite_owners.html',
                    controller: 'NewLeagueInviteOwnersController',
                    controllerAs: 'vm',
                    title: 'new_league_invite_owners',
                    settings: {}
                }
            },
            {
                state: 'league_settings',
                config: {
                    url: '/league/:league_id/settings',
                    params: {
                        'league_id': '0',
                        settingsTab: 'scoring'
                    },
                    templateUrl: 'app/league/league_settings.html',
                    controller: 'LeagueSettingsController',
                    controllerAs: 'vm',
                    title: 'league_settings',
                    settings: {}
                }
            },
            {
                state: 'new_league_checklist',
                config: {
                    url: '/leagues/:league_id/checklist/:point',
                    params: {'league_id': '0', point: '1'},
                    templateUrl: 'app/league/new_league_checklist.html',
                    controller: 'NewLeagueChecklistController',
                    controllerAs: 'vm',
                    title: 'new_league_checklist',
                    settings: {}
                }
            },
            {
                state: 'new_league_form',
                config: {
                    url: '/leagues/create',
                    params: {
                        redirectedFromClub: null,
                        leagueType: 'null'
                    },
                    templateUrl: 'app/league/new_league_form.html',
                    controller: 'NewLeagueFormController',
                    controllerAs: 'vm',
                    title: 'new_league_form',
                    settings: {}
                }
            },
            {
                state: 'main_league',
                config: {
                    url: '/league/:league_id/:club_id',
                    params: {'league_id': '0'},
                    templateUrl: 'app/league/main_league.html',
                    controller: 'MainLeagueController',
                    controllerAs: 'vm',
                    title: 'main_league',
                    settings: {}
                }
            },
            {
                state: 'league_before_draft',
                config: {
                    url: '/leaguepredraft/:league_id',
                    params: {
                        'league_id': '0',
                        'cameFrom': null
                    },
                    templateUrl: 'app/league/predraft_state/league_before_draft.html',
                    controller: 'PredraftLeagueController',
                    controllerAs: 'vm',
                    title: 'predraft_league',
                    settings: {}
                }
            },
            // {
            //     state: 'league_dashboard',
            //     config: {
            //         url: '/league/:league_id/:club_id/dashboard',
            //         params: {'league_id': '0'},
            //         templateUrl: 'app/league/league_dashboard.html',
            //         controller: 'LeagueDashboardController',
            //         controllerAs: 'vm',
            //         title: 'main_league',
            //         settings: {}
            //     }
            // },
            {
                state: 'new_league_invite_link',
                config: {
                    url: '/league/invite/:league_code/link',
                    params: {
                        'league_code': '0',
                        'redirectedFromClub': null
                    },
                    templateUrl: 'app/league/new_league_invite_link.html',
                    controller: 'NewLeagueInviteLinkController',
                    controllerAs: 'vm',
                    title: 'new_league_invite_link',
                    settings: {
                        noLogin: true
                    }
                }
            },
            {
                state: 'public_leagues_list',
                config: {
                    url: '/league/public_leagues',
                    params: {
                        'redirectedFromClub': null
                    },
                    templateUrl: 'app/league/public_leagues_list.html',
                    controller: 'PublicLeagueController',
                    controllerAs: 'vm',
                    title: 'Public Leagues List',
                    settings: {}
                }
            },
            {
                state: 'join_public_league',
                config: {
                    url: '/league/public_leagues/:leagueId/join',
                    params: {'league': null},
                    templateUrl: 'app/league/public_league_join.html',
                    controller: 'PublicLeagueJoinController',
                    controllerAs: 'vm',
                    title: 'Join Public League',
                    settings: {}
                }
            },
            {
                state: 'public_listing',
                config: {
                    url: '/public_listing/league/:league_id',
                    templateUrl: 'app/league/public_listing.html',
                    controller: 'PublicListingController',
                    controllerAs: 'vm',
                    title: 'public listing',
                    settings: {}
                }
            }
        ];
    }
})();
