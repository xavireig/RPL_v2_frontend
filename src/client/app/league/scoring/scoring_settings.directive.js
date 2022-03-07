(function () {
    'use strict';

    angular
        .module('app.league')
        .directive('scoringSettings', scoringSettings);

    scoringSettings.$inject = ['logger'];
    /* @ngInject */
    function scoringSettings(logger) {
        var directive = {
            restrict: 'E',
            replace: true,
            link: link,
            controller: 'ScoringSettingsController',
            controllerAs: 'ssc',
            templateUrl: 'app/league/scoring/scoring_settings.html'
        };
        return directive;

        function link (scope, element, attrs) {

        }
    }
})();
