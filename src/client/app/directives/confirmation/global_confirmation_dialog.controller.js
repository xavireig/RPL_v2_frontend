(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('GlobalConfirmationDialogController', GlobalConfirmationDialogController);

    GlobalConfirmationDialogController.$inject = ['$scope'];
    /* @ngInject */
    function GlobalConfirmationDialogController($scope) {
        var vm = this;

        vm.menu = {
            confirm: confirm,
            cancel: cancel,
            counterOffer: counterOffer
        };

        function confirm() {
            if ($scope.ngDialogData.confirm.action) {
                $scope.ngDialogData.confirm.action();
            }
            $scope.closeThisDialog();
        }

        function cancel() {
            if ($scope.ngDialogData.cancel.action) {
                $scope.ngDialogData.cancel.action();
            }
            $scope.closeThisDialog();
        }

        function counterOffer() {
            $scope.ngDialogData.counterOffer.action();
        }
    }
})();
