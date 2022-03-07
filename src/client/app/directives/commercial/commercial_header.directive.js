(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('commercialHeader', commercialHeader);

    commercialHeader.$inject = [];
    /* @ngInject */
    function commercialHeader() {
        var directive = {
            restrict: 'E',
            controller: 'CommercialController',
            controllerAs: 'cc',
            replace: true,
            templateUrl: 'app/directives/commercial/commercial_header.html',
            link: linkFunction
        };
        return directive;

        function linkFunction(scope, element, attrs) {
        }
    }
})();
