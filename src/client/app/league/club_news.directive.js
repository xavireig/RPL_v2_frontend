(function () {
    'use strict';

    angular
        .module('app.club')
        .directive('clubNews', clubNews);

    clubNews.$inject = [];
    /* @ngInject */
    function clubNews() {
        var directive = {
            restrict: 'E',
            controller: 'ClubNewsController',
            controllerAs: 'cnc',
            templateUrl: 'app/league/club_news.html',
            link: function (scope, element, attrs) {
            }
        };
        return directive;
    }
})();

