(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('transferInfo', transferInfo);

    transferInfo.$inject = [];
    /* @ngInject */
    function transferInfo() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/directives/transfer_info.html',
            scope: {
                league: '='
            }
        };
        return directive;
    }
})();
