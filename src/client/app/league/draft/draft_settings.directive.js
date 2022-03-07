(function () {
    'use strict';

    angular
        .module('app.league')
        .directive('draftSettings', draftSettings);

    draftSettings.$inject = ['logger'];
    /* @ngInject */
    function draftSettings(logger) {
        var directive = {
            restrict: 'E',
            replace: true,
            link: link,
            controller: 'DraftSettingsController',
            controllerAs: 'ds',
            templateUrl: 'app/league/draft/draft_settings.html'
        };
        return directive;

        function link (scope, element, attrs) {

        }
    }
})();
