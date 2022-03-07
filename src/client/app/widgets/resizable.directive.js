(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('resizable', resizable);

    resizable.$inject = ['config', '$window'];
    /* @ngInject */
    function resizable (config, $window) {
        //Usage:
        //<div resizable ng-style="{ width: windowWidth, height: windowHeight }"></div>
        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            scope.initializeWindowSize = function() {
                scope.windowHeight = $window.innerHeight;
                scope.windowWidth  = $window.innerWidth;
            };
            angular.element($window).bind('resize', function() {
                scope.initializeWindowSize();
                scope.$apply();
            });
            scope.initializeWindowSize();
        }
    }
})();
