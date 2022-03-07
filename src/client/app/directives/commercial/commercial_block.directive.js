(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('commercialBlock', commercialBlock);

    commercialBlock.$inject = [];
    /* @ngInject */
    function commercialBlock() {
        var directive = {
            restrict: 'E',
            controller: 'CommercialController',
            controllerAs: 'cc',
            replace: true,
            templateUrl: 'app/directives/commercial/commercial_block.html'
        };
        return directive;
    }
})();
