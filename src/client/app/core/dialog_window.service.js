(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('dialogWindowService', DialogWindowService);

    DialogWindowService.$inject = ['ngDialog'];
    /* @ngInject */
    function DialogWindowService(ngDialog) {
        var dialogWindowService;

        dialogWindowService = {
            confirmationDialog: {
                defaultOptions: {
                    template: 'app/directives/confirmation/confirmation_dialog.html',
                    className: 'player-card ngdialog-theme-default confirmation-dialog',
                    controller: 'GlobalConfirmationDialogController',
                    controllerAs: 'vm',
                    showClose: false
                },
                open: openConfirmationDialog
            }
        };

        return dialogWindowService;

        /**
         * @param {Object} customDialogOptions - ngDialog options.
         * @param {Object} customDialogOptions.data - ngDialog data.
         * @param {String} customDialogOptions.data.title Title of dialog.
         * @param {String} customDialogOptions.data.text Text of dialog.
         * @param {Object} customDialogOptions.data.confirm Confirm button object.
         * @param {String} customDialogOptions.data.confirm.buttonTitle Confirm button text.
         * @param {Function} customDialogOptions.data.confirm.action Confirm button callback.
         * @param {Object} customDialogOptions.data.cancel Cancel button object.
         * @param {String} customDialogOptions.data.cancel.buttonTitle Cancel button text.
         * @param {Function} customDialogOptions.data.cancel.action Cancel button callback.
         */
        function openConfirmationDialog(customDialogOptions) {
            var dialogOptions = Object.assign(dialogWindowService.confirmationDialog.defaultOptions, customDialogOptions);
            ngDialog.open(dialogOptions);
        }
    }
})();
