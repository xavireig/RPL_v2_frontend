(function () {
    'use strict';

    angular
        .module('app.league')
        .directive('squadSettings', squadSettings);

    squadSettings.$inject = ['logger'];
    /* @ngInject */
    function squadSettings(logger) {
        var directive = {
            restrict: 'E',
            replace: true,
            link: link,
            controller: 'SquadSettingsController',
            controllerAs: 'sq',
            templateUrl: 'app/league/squad/squad_settings.html'
        };
        return directive;

        function link (scope, element, attrs) {

        }
    }
})();
