(function () {
    'use strict';

    angular
        .module('app.auth')
        .controller('RootController', RootController);

    RootController.$inject = ['$q', 'logger', '$state'];
    /* @ngInject */
    function RootController($q, logger, $state) {
        var vm = this;

        activate();

        function activate() {
            console.log('application root entry point');
        }
    }
})();
