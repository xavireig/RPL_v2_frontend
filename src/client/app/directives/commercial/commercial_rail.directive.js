(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('commercialRail', commercialRail);

    commercialRail.$inject = [];
    /* @ngInject */
    function commercialRail() {
        var directive = {
            restrict: 'E',
            controller: 'CommercialController',
            controllerAs: 'cc',
            replace: true,
            templateUrl: 'app/directives/commercial/commercial_rail.html'
        };
        return directive;
    }
})();
