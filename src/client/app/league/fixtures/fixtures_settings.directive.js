(function () {
    'use strict';

    angular
        .module('app.league')
        .directive('fixturesSettings', fixturesSettings);

    fixturesSettings.$inject = [];
    /* @ngInject */
    function fixturesSettings() {
        var directive = {
            restrict: 'E',
            replace: true,
            link: link,
            controller: 'FixturesSettingsController',
            controllerAs: 'fs',
            templateUrl: 'app/league/fixtures/fixtures_settings.html'
        };
        return directive;

        function link (scope, element, attrs) {

        }
    }
})();
