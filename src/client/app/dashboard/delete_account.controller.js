(function () {
    'use strict';

    angular
        .module('app.dashboard')
        .controller('DeleteAccountController', DeleteAccountController);

    DeleteAccountController.$inject = ['requestservice', '$scope', 'UserModel', 'logger', '$state'];
    /* @ngInject */
    function DeleteAccountController(requestservice, $scope, UserModel, logger, $state) {
        var vm = this;

        vm.menu = {
            deleteAccount: deleteAccount
        };

        function deleteAccount(email) {
            return requestservice.run('deleteAccount',
                {
                    email: email
                }
            ).then(function (received) {
                if (received.data.success === 0) {
                    $scope.closeThisDialog();
                    UserModel.clear();
                    window.location.pathname = '/signin';
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }
    }
})();
