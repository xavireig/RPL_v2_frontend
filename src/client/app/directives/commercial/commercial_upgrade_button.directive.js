(function() {
    'use strict';

    angular
        .module('app.core')
        .directive('commercialUpgradeButton', commercialUpgradeButton);

    commercialUpgradeButton.$inject = [];
    /* @ngInject */
    function commercialUpgradeButton() {
        var directive = {
            restrict: 'E',
            controller: 'CommercialController',
            controllerAs: 'cc',
            replace: true,
            templateUrl: 'app/directives/commercial/commercial_upgrade_button.html'
        };
        return directive;
    }
})();
