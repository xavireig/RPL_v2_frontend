(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('clubCrest', clubCrest);

    clubCrest.$inject = [];
    /* @ngInject */
    function clubCrest() {
        var directive = {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/directives/club_crest.html',
            scope: {
                club: '=',
                width: '='
            }
        };
        return directive;
    }
})();
