(function () {
    'use strict';

    angular
        .module('app.layout')

        .directive('accountTopBar', accountTopBar);

    accountTopBar.$inject = [];

    function accountTopBar () {
        return {
            restrict: 'E',
            replace: true,
            controller: 'AccountTopbarController',
            controllerAs: 'vmi',
            templateUrl: 'app/layout/account_topbar.html'
        };
    }
})();
