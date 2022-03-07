(function () {
    'use strict';

    angular
        .module('app.layout')

        .directive('transfersDropdown', transfersDropdown);

    transfersDropdown.$inject = [];

    function transfersDropdown () {
        return {
            restrict: 'E',
            replace: true,
            controller: 'TransfersDropdownController',
            controllerAs: 'tdc',
            templateUrl: 'app/layout/transfers_directive/transfers.template.html'
        };
    }
})();
