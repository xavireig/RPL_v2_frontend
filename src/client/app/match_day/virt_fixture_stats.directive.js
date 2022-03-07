(function () {
    'use strict';

    angular
        .module('app.match_day')
        .directive('virtFixtureStats', virtFixtureStats);

    virtFixtureStats.$inject = [];

    function virtFixtureStats() {
        var directive = {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/match_day/virt_fixture_stats.html'
        };
        return directive;
    }

})();

