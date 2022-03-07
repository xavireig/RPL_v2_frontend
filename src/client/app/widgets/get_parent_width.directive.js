(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('getParentWidth', getParentWidth);

    getParentWidth.$inject = ['config', '$window'];
    /* @ngInject */
    function getParentWidth(config, $window) {
        //Usage:
        //<div resizable ng-style='{ width: windowWidth, height: windowHeight }'></div>
        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            scope.$watch(
                function () {
                    return element.parent().width();
                },
                function (newValue, oldValue) {
                    element.width(newValue);
                });
        }
    }
})();
