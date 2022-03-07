(function() {
    'use strict';

    angular
        .module('app.core')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'players',
                config: {
                    url: '/:league_id/:club_id/players',
                    templateUrl: 'app/players/players_view.html',
                    controller: 'PlayersController',
                    controllerAs: 'vm',
                    title: 'players',
                    settings: {}
                }
            }
        ];
    }
})();
