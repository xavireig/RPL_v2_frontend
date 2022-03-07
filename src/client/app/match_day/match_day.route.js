(function() {
    'use strict';

    angular
        .module('app.match_day')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'match_day',
                config: {
                    url: '/match_day/:league_id/:club_id/:round_week_num',
                    params: {'game_id': 0},
                    templateUrl: 'app/match_day/match_day.html',
                    controller: 'MatchDayController',
                    controllerAs: 'vm',
                    title: 'match_day',
                    settings: {}
                }
            }
        ];
    }
})();
