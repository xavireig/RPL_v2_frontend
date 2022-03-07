(function () {
    'use strict';

    angular
        .module('app.club')
        .directive('fixtureList', fixtureList);

    fixtureList.$inject = ['$timeout'];
    /* @ngInject */
    function fixtureList($timeout) {
        var directive = {
            restrict: 'E',
            controller: 'FixtureListController',
            controllerAs: 'flc',
            templateUrl: 'app/club/fixture_list.html',
            link: function (scope, element, attrs) {
            }
        };
        return directive;
    }
})();

