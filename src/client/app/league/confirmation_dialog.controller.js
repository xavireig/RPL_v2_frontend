(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('ConfirmationDialogController', ConfirmationDialogController);

    ConfirmationDialogController.$inject = [
        '$state', 'logger', 'requestservice', '$stateParams',
        '$q', '$scope', 'LeagueSettingsModel'
    ];
    /* @ngInject */
    function ConfirmationDialogController(
        $state, logger, requestservice, $stateParams,
        $q, $scope, LeagueSettingsModel
    ) {
        var vm = this;

        vm.menu = {
            confirm: confirm,
            cancel: cancel
        };

        vm.model = {
            leagueSettingsModel: LeagueSettingsModel
        };

        function confirm() {
            $scope.ngDialogData.setScoringType($scope.ngDialogData.resetCategoriesDataToDefault);
            $scope.closeThisDialog();
        }

        function cancel() {
            vm.model.leagueSettingsModel['scoringType']['custom'] = true;
            $scope.closeThisDialog();
        }
    }
})();
