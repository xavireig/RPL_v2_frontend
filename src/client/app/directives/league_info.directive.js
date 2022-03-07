(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('leagueInfo', leagueInfo);

    leagueInfo.$inject = ['CommonModel', 'moment'];
    /* @ngInject */
    function leagueInfo(CommonModel, moment) {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/directives/league_info.html',
            scope: {
                league: '='
            },
            link: function (scope, element, attrs) {

                scope.formations = CommonModel.formations;

                scope.localTime = function (time) {
                    return moment(time).format('MMM, DD, YYYY h:mma');
                };
            }
        };
        return directive;
    }
})();

