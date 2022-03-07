(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('clubGets', clubGets);

    clubGets.$inject = [];
    /* @ngInject */
    function clubGets() {
        var directive = {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/transfers_page/club_gets_directive/club_gets.template.html',
            controller: 'ClubGetsController',
            controllerAs: 'cgc',
            scope: {
                club: '=',
                footballerList: '=',
                money: '='
            }
        };
        return directive;
    }
})();

