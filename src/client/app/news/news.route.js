(function () {
    'use strict';

    angular
        .module('app.news')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'news',
                config: {
                    url: '/news/:league_id/:club_id',
                    templateUrl: 'app/news/news.html',
                    controller: 'NewsController',
                    controllerAs: 'vm',
                    title: 'news',
                    settings: {}
                }
            }
        ];
    }
})();
