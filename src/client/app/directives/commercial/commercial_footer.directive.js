(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('commercialFooter', commercialFooter);

    commercialFooter.$inject = [];
    /* @ngInject */
    function commercialFooter() {
        var directive = {
            restrict: 'E',
            controller: 'CommercialController',
            controllerAs: 'cc',
            replace: true,
            templateUrl: 'app/directives/commercial/commercial_footer.html'
        };
        return directive;
    }
})();
