(function () {
    'use strict';

    angular
        .module('app.widgets')

        .directive('dotDotDot', ['$', function ($) {
            return {
                restrict: 'A',
                link: function (scope, element) {
                        element.dotdotdot({
                            watch: true,
                            height: 60
                        });
                    }
            };
        }]);
})();

