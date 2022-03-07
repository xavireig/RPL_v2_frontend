(function () {
    'use strict';

    angular
        .module('app.public')
        .controller('TermsOfConditionsController', TermsOfConditionsController);

    TermsOfConditionsController.$inject = ['$q', 'logger', '$state', '$stateParams'];
    /* @ngInject */
    function TermsOfConditionsController($q, logger, $state, $stateParams) {
        var vm = this;

        vm.menu = {
            goBack: goBack
        };

        vm.model = {
            referer: $stateParams.referer
        };

        activate();

        function activate() {
            //logger.info('Activated Terms of Conditions View');
        }

        function goBack() {
            $state.go(vm.model.referer);
        }
    }
})();
