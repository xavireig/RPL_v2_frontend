(function () {
    'use strict';

    angular
        .module('app.public')
        .controller('PrivacyPolicyController', PrivacyPolicyController);

    PrivacyPolicyController.$inject = ['$q', 'logger', '$state', '$stateParams'];
    /* @ngInject */
    function PrivacyPolicyController($q, logger, $state, $stateParams) {
        var vm = this;

        vm.menu = {
            goBack: goBack
        };

        vm.model = {
            referer: $stateParams.referer
        };

        activate();

        function activate() {
            //logger.info('Activated Privacy Policy View');
        }

        function goBack() {
            $state.go(vm.model.referer);
        }
    }
})();
