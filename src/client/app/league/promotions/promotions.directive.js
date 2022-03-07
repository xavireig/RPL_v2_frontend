(function () {
    'use strict';

    angular
        .module('app.league')
        .directive('promotionRelegation', promotionRelegationDirective);

    promotionRelegationDirective.$inject = ['logger'];
    /* @ngInject */
    function promotionRelegationDirective(logger) {
        var directive = {
            restrict: 'E',
            replace: true,
            link: link,
            controller: 'PromotionsController',
            controllerAs: 'pc',
            templateUrl: 'app/league/promotions/promotions.html'
        };
        return directive;

        function link (scope, element, attrs) {

        }
    }
})();
