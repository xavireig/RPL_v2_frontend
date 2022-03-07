(function () {
    'use strict';

    angular
        .module('app.transfers')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'transfers_settings',
                config: {
                    url: '/league/:league_id/settings/transfers',
                    templateUrl: 'app/transfers/transfers_settings.html',
                    controller: 'TransfersSettingsController',
                    controllerAs: 'vm',
                    title: 'transfer_settings',
                    settings: {}
                }
            }
        ];
    }
})();
