(function () {
    'use strict';

    angular
        .module('app.auth')
        .controller('NewPasswordController', NewPasswordController);

    NewPasswordController.$inject = [
        '$q', 'authservice', 'UserModel', 'ngDialog', '$stateParams',
        'logger', '$state', 'fbservice', '$scope', '$rootScope',
        'CommonModel', '$localStorage', '$base64', 'requestservice', 'moment'
    ];
    /* @ngInject */
    function NewPasswordController(
        $q, authservice, UserModel, ngDialog, $stateParams,
        logger, $state, fbservice, $scope, $rootScope,
        CommonModel, $localStorage, $base64, requestservice, moment
    ) {
        var vm = this;

        vm.menu = {
            saveNewPassword: saveNewPassword
        };

        vm.form = {
            'new_password': '',
            'reset_token': $stateParams['token']
        };

        function saveNewPassword() {
            return requestservice.run('saveNewPassword', {
                data: vm.form
            }).then(function (received) {
                if (received.data.success === 401) {
                    logger.error(received.data.message);
                }
                else {
                    logger.success('successfully saved new passowrd');
                    $state.go('home');
                }
            });
        }
    }
})();
