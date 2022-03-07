(function () {
    'use strict';

    angular
        .module('app.league')
        .directive('basicSettings', basicSettings);

    basicSettings.$inject = ['logger'];
    /* @ngInject */
    function basicSettings(logger) {
        var directive = {
            restrict: 'E',
            replace: true,
            link: link,
            controller: 'BasicSettingsController',
            controllerAs: 'bs',
            templateUrl: 'app/league/basics/basic_settings.html'
        };
        return directive;

        function link (scope, element, attrs) {

        }
    }
})();
