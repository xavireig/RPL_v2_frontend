(function () {
    'use strict';

    angular
        .module('app.club')
        .directive('clubStats', clubStats);

    clubStats.$inject = [];
    /* @ngInject */
    function clubStats() {
        var directive = {
            restrict: 'E',
            controller: 'ClubStatsController',
            controllerAs: 'csc',
            templateUrl: 'app/club/club_stats.html',
            link: function (scope, element, attrs) {
            }
        };
        return directive;
    }
})();

