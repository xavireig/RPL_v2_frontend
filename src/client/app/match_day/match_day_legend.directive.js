(function () {
    'use strict';

    angular
        .module('app.match_day')
        .directive('matchDayLegend', matchDayLegend);

    matchDayLegend.$inject = [];

    function matchDayLegend() {
        var directive = {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/match_day/match_day_legend.html'
        };
        return directive;
    }

})();

