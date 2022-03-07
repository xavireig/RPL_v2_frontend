(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('getDataOnScroll', getDataOnScroll);

    getDataOnScroll.$inject = ['config', '$window'];
    /* @ngInject */
    function getDataOnScroll (config, $window) {
        //Usage:
        //<div resizable ng-style='{ width: windowWidth, height: windowHeight }'></div>
        var directive = {
            link: link,
            restrict: 'A',
            scope: {
                load: '='
            }
        };
        return directive;

        function link(scope, element, attrs) {
            element.on('scroll', function(event) {
                if ((this.scrollTop + this.scrollWidth) > (this.scrollHeight - 250)) {
                    scope.load();
                }
            });
        }
    }
})();
