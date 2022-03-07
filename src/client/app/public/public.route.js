(function() {
    'use strict';

    angular
        .module('app.public')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'privacy-policy',
                config: {
                    url: '/privacy-policy',
                    params: {referer: 'signup'},
                    templateUrl: 'app/public/privacy_policy.html',
                    controller: 'PrivacyPolicyController',
                    controllerAs: 'vm',
                    title: 'privacy-policy',
                    settings: {}
                }
            },
            {
                state: 'terms-of-conditions',
                config: {
                    url: '/terms-of-conditions',
                    params: {referer: 'signup'},
                    templateUrl: 'app/public/terms_of_conditions.html',
                    controller: 'TermsOfConditionsController',
                    controllerAs: 'vm',
                    title: 'terms-of-conditions',
                    settings: {}
                }
            }
        ];
    }
})();
