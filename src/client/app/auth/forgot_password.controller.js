(function () {
    'use strict';

    angular
        .module('app.auth')
        .controller('ForgotPasswordController', ForgotPasswordController);

    ForgotPasswordController.$inject = [
        'logger', '$state', 'requestservice', '$rootScope', 'ngDialog',
    ];
    /* @ngInject */
    function ForgotPasswordController(
        logger, $state, requestservice, $rootScope, ngDialog
    ) {
        var vm = this;

        vm.menu = {
            sendPasswordLink: sendPasswordLink,
            keyUp: keyUp,
            neverMind: neverMind
        };

        vm.form = {
            email: ''
        };

        activate();

        function activate() {
            // activated SignInController
        }

        function keyUp($event) {
            if ($event.which === 13) {
                sendPasswordLink();
            }
        }

        function neverMind() {
            if($state.is('forgot_password')){
                $state.go('signin');
            }
            else {
                $rootScope.$broadcast('goSignIn', 'app/auth/signin.html');
            }
        }

        function sendPasswordLink() {
            return requestservice.run('sendPasswordLink', {
                email: vm.form.email
            }).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    logger.success('An email with password reset instructions has been sent.');
                    ngDialog.closeAll();
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }
    }
})();
