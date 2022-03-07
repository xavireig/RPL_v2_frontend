(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('fbservice', fbservice);

    fbservice.$inject = ['UserModel', '$rootScope', '$facebook', 'logger'];
    /* @ngInject */
    function fbservice(UserModel, $rootScope, $facebook, logger) {
        var service = {
            signIn: signIn,
            getUserData: getUserData
        };

        init();

        return service;

        function init() {
            $rootScope.$on('fb.auth.authResponseChange', function(event, response, FB) {
                if (response.status === 'connected') {
                    UserModel.fbAccessToken = response.authResponse.accessToken;
                    UserModel.fbUserId = response.authResponse.userID;
                }
                console.log('fb.auth.authResponseChange');
                console.log(response);
            });
        }

        function signIn(success) {
            $facebook.login().then(function() {
                service.getUserData(success);
            });
        }

        function getUserData(success) {
            return $facebook.api('/me', {
                fields: 'id,name,email,first_name,last_name,picture'
            }).then(
                function(response) { success(response); },
                function(err) {
                    console.log('fb error');
                    console.log(err);
                    logger.info(
                        'The Facebook auth is wrong. Please, try again within ' +
                        'next minute or sing in/up using your E-mail and Password!'
                    );
                }
            );
        }
    }
})();
