(function () {
    'use strict';

    angular
        .module('app.league')

        .directive('lsSmallTitle', lsSmallTitle);

    lsSmallTitle.$inject = [];

    function lsSmallTitle () {
        return {
            restrict: 'E',
            scope: {
                title: '=',
                context: '='
            },
            replace: true,
            controller: ['$scope', function($scope) {
                $scope.showArray = function() {
                    return $scope.context.constructor === Array;
                };
            }],
            controllerAs: 'vm',
            templateUrl: 'app/league/ls_small_title.template.html'
        };
    }
})();
