(function() {
    'use strict';

    angular
        .module('app.lineup')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'lineup',
                config: {
                    url: '/lineup/:league_id/:club_id/:round_week_num',
                    templateUrl: 'app/lineup/lineup.html',
                    controller: 'LineupController',
                    controllerAs: 'vm',
                    title: 'lineup',
                    settings: {},
                    params: {
                        callbackName: null,
                        player: null
                    }
                }
            }
        ];
    }
})();
