(function () {
    'use strict';

    angular
        .module('app.match_day')
        .directive('matchDayFootballerList', matchDayFootballerList);

    matchDayFootballerList.$inject = [];

    function matchDayFootballerList() {
        var directive = {
            restrict: 'A',
            replace: true,
            templateUrl: 'app/match_day/match_day_footballer_list.html'
        };
        console.log('footballer list -----');
        console.log()
        return directive;
    }

})();

