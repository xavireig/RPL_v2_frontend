(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('authservice', authservice);

    authservice.$inject = ['requestservice', 'UserModel', '$rootScope', '$q', '$state', 'CommonModel', '$stateParams'];
    /* @ngInject */
    function authservice(requestservice, UserModel, $rootScope, $q, $state, CommonModel, $stateParams) {
        var service = {
            signIn: signIn,
            signUp: signUp,
            signOut: signOut,
            checkAuth: checkAuth,
            routeAuth: routeAuth,
            routeAuthOtherwise: routeAuthOtherwise
        };

        return service;

        function routeAuth(toState, toParams, fromState, fromParams) {
            return service.checkAuth().then(function (received) {
                console.log(received);
                UserModel.isAuthChecked = true;
                if (received.data.success === 0) {
                    UserModel.isSignedIn = true;
                    if (shouldBeRedirectedToDashboard(toState.name)) { toState.name = 'dashboard'; }
                } else {
                    if (shouldBeRedirectedToSignIn(toState.name))  { toState.name = 'signin'; }
                }
                return $state.go(toState.name, toParams, {notify: true});
            });
        }

        function routeAuthOtherwise(toState, toParams) {
            if (shouldBeRedirectedToSignIn(toState.name))  { toState.name = 'signin'; }
            return $state.go(toState.name, toParams, {notify: true});
        }

        function signIn(data) {
            return requestservice.run('signIn', data);
        }

        function signUp(data) {
            return requestservice.run('signUp', data);
        }

        function signOut() {
            return requestservice.run('signOut', {});
        }

        function checkAuth() {
            return requestservice.run('checkAuth', {});
        }

        /* private functions */

        function shouldBeRedirectedToSignIn(stateName) {
            if (stateName === 'home') {
                return false;
            } else if ((stateName !== 'signin') &&
                (stateName !== '404') &&
                (stateName !== 'signup')) { return true; }
            return false;
        }

        function shouldBeRedirectedToDashboard(stateName) {
            if ((stateName === 'root') ||
                (stateName === 'signin') ||
                (stateName === 'home') ||
                (stateName === 'signup')) { return true; }
            return false;
        }
    }
})();
