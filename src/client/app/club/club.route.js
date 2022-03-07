(function() {
    'use strict';

    angular
        .module('app.club')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'new_club_form_without_user_signed_up',
                config: {
                    url: '/clubs/create/:base64email',
                    params: {
                        base64email: ''
                    },
                    templateUrl: 'app/club/new_club_form.html',
                    controller: 'NewClubFormController',
                    controllerAs: 'vm',
                    title: 'new_club_form',
                    settings: {
                        noLogin: true
                    }
                }
            },
            {
                state: 'new_club_form',
                config: {
                    url: '/clubs/create',
                    params: {
                        base64email: '',
                        redirectedFromLeague: null
                    },
                    templateUrl: 'app/club/new_club_form.html',
                    controller: 'NewClubFormController',
                    controllerAs: 'vm',
                    title: 'new_club_form',
                    settings: {
                        noLogin: true
                    }
                }
            },
            {
                state: 'update_club_form',
                config: {
                    url: '/clubs/:club_id/update',
                    params: {
                        base64email: ''
                    },
                    templateUrl: 'app/club/update_club_form.html',
                    controller: 'UpdateClubFormController',
                    controllerAs: 'vm',
                    title: 'update_club_form',
                    settings: {}
                }
            },
            {
                state: 'club_profile',
                config: {
                    url: '/:league_id/clubs/:club_id/profile',
                    params: {
                        'club_id': '0'
                    },
                    templateUrl: 'app/club/club_profile.html',
                    controller: 'ClubProfileController',
                    controllerAs: 'vm',
                    title: 'club_profile',
                    settings: {}
                }
            },
            {
                state: 'new_club_form_without_user_signed_up_link',
                config: {
                    url: '/link/clubs/create/:league_id',
                    params: {
                        'league_id': '',
                        league: '',
                        redirectedFromInviteLink:false
                    },
                    templateUrl: 'app/club/new_club_form.html',
                    controller: 'NewClubFormLinkController',
                    controllerAs: 'vm',
                    title: 'new_club_form',
                    settings: {
                        noLogin: true
                    }
                }
            },
        ];
    }
})();
