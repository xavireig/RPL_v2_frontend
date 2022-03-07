(function () {
    'use strict';

    angular
        .module('app.league')
        .directive('transfersSettings', transfersSettings);

    transfersSettings.$inject = ['logger'];
    /* @ngInject */
    function transfersSettings(logger) {
        var directive = {
            restrict: 'E',
            replace: true,
            link: link,
            controller: 'TransfersSettingsController',
            controllerAs: 'tc',
            templateUrl: 'app/league/transfers/transfers_settings.html'
        };
        return directive;

        function link (scope, element, attrs) {

        }
    }
})();
