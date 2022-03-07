(function() {
    'use strict';

    angular
        .module('app.draft')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'draft',
                config: {
                    url: '/draft/:league_id/:club_id',
                    params: {
                        'league_id': '0',
                        'club_id': '0'
                    },
                    templateUrl: 'app/draft/draft.html',
                    controller: 'DraftController',
                    controllerAs: 'vm',
                    title: 'draft',
                    settings: {}
                }
            }
        ];
    }
})();
