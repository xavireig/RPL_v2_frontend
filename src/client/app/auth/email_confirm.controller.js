(function () {
    'use strict';

    angular
        .module('app.auth')
        .controller('EmailConfirmController', EmailConfirmController);

    EmailConfirmController.$inject = [
        '$q', 'logger', '$state', 'requestservice', '$rootScope', 'ngDialog',
        '$stateParams', 'UserModel', 'CommonModel', 'ActionCableConfig', 'config'
    ];
    /* @ngInject */
    function EmailConfirmController(
        $q, logger, $state, requestservice, $rootScope, ngDialog, $stateParams,
        UserModel, CommonModel, ActionCableConfig, config
    ) {

        activate();

        function activate() {
            return $q.all([checkConfirmationCode()]).then(function(received) {
                if (received[0].data.data !== 'valid') {
                    ngDialog.open({
                        templateUrl: 'app/auth/signup.html',
                    });
                }
                else {
                    CommonModel.selectedClub = {};
                    UserModel.parse(received[0]);
                    ActionCableConfig.wsUri = config.actionCableUrl + '/cable?token=' + UserModel.data['auth_token'];
                    $state.go('dashboard');
                }
            });
        }

        function checkConfirmationCode() {
            return requestservice.run('checkConfirmationCode', {
                'url_params': {
                    ':confirm_code': $stateParams['confirm_code']
                }
            }).then(function (received) {
                return received;
            });
        }
    }
})();
