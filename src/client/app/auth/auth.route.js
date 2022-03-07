(function() {
    'use strict';

    angular
        .module('app.auth')
        .run(appRun);

    appRun.$inject = ['routerHelper', 'ngDialog'];
    /* @ngInject */
    function appRun(routerHelper, ngDialog) {
        routerHelper.configureStates(getStates());
    }

    function getStates(ngDialog) {
        return [
            {
                state: 'home',
                config: {
                    url: '/',
                    templateUrl: 'app/auth/landing_page.html',
                    controller: 'LandingPageController',
                    controllerAs: 'vm',
                    title: 'home',
                    settings: {}
                }
            },
            {
                state: 'signin',
                config: {
                    url: '/signin',
                    templateUrl: 'app/auth/signin.html',
                    controller: 'SignInController',
                    controllerAs: 'vm',
                    title: 'sign in',
                    settings: {
                        noLogin: true
                    }

                }
            },
            {
                state: 'forgot_password',
                config: {
                    url: '/forgot_password',
                    templateUrl: 'app/auth/forgot_password.html',
                    controller: 'ForgotPasswordController',
                    controllerAs: 'vm',
                    title: 'sign in',
                    settings: {
                        noLogin: true
                    } 
                }
            },
            {
                state: 'signup',
                config: {
                    url: '/signup',
                    params: {
                        email: '',
                        club: ''
                    },
                    templateUrl: 'app/auth/signup.html',
                    controller: 'SignUpController',
                    controllerAs: 'vm',
                    title: 'sign up',
                    settings: {}
                }
            },
            {
                state: 'NewPasswordController',
                config: {
                    url: '/new_password/:token',
                    templateUrl: 'app/auth/new_password.html',
                    controller: 'NewPasswordController',
                    controllerAs: 'vm',
                    title: 'new password',
                    settings: {
                        noLogin: true
                    }
                }
            },
            {
                state: 'email_confirm',
                config: {
                    url: '/email/confirmation/:confirm_code',
                    templateUrl: 'app/core/confirmation.html',
                    controller: 'EmailConfirmController',
                    controllerAs: 'vm',
                    title: 'user confirmation',
                    settings: {
                        noLogin: true
                    }
                }
            },
        ];
    }
})();
