(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('commercialUpgradeNow', commercialUpgradeNow);

    commercialUpgradeNow.$inject = [];
    /* @ngInject */
    function commercialUpgradeNow() {
        var directive = {
            restrict: 'E',
            controller: 'CommercialController',
            controllerAs: 'cc',
            replace: true,
            templateUrl: 'app/directives/commercial/commercial_upgrade_now.html'
        };
        return directive;
    }
})();
