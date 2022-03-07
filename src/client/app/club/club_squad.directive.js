(function () {
    'use strict';

    angular
        .module('app.club')
        .directive('clubSquad', clubSquad);

    clubSquad.$inject = [];
    /* @ngInject */
    function clubSquad() {
        var directive = {
            restrict: 'E',
            scope: {
                club: '='
            },
            controller: 'ClubSquadController',
            controllerAs: 'csc',
            templateUrl: 'app/club/club_squad.html',
            link: function (scope, element, attrs) {
            }
        };
        return directive;
    }
})();

