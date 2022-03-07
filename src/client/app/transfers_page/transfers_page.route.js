(function () {
    'use strict';

    angular
        .module('app.transfers_page')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'transfers_page',
                config: {
                    url: '/transfers_page/:league_id/:club_id',
                    templateUrl: 'app/transfers_page/transfers_page.html',
                    controller: 'TransfersPageController',
                    controllerAs: 'vm',
                    settings: {}
                }
            }
        ];
    }
})();
