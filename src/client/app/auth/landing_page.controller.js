(function() {
    'use strict';

    angular
        .module('app.auth')
        .controller('LandingPageController', LandingPageController);

    LandingPageController.$inject = ['config', '$q', 'logger', 'ngDialog', '$scope', '$state'];
    /* @ngInject */
    function LandingPageController(config, $q, logger, ngDialog, $scope, $state) {
        var vm = this;

        vm.model = {
            templateName:  'app/auth/signin.html',
        };

        vm.menu = {
            signIn: signIn,
            getStarted: getStarted
        };

        activate();

        function activate() {
            logger.success(config.appTitle + ' loaded!', null);
        }

        function signIn() {
            ngDialog.open({
                templateUrl: 'app/auth/landing_page_modal.html',
                controller: ['$rootScope', '$scope', function($rootScope, $scope) {
                    var vm = this;
                    vm.templateName = 'app/auth/signin.html';
                    $scope.$on('goSignIn', function (event, arg) {
                        vm.templateName = arg;
                    });

                    $scope.$on('goForgotPassword', function (event, arg) {
                        vm.templateName = arg;
                    });

                    $scope.$on('goSignUp', function (event, arg) {
                        vm.templateName = arg;
                    });
                }],
                controllerAs: 'vm',
            });
        }

        function getStarted() {
            $state.go('new_club_form');
        }
    }
})();
