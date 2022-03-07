(function () {
    'use strict';

    angular
        .module('app.core')

        .directive('fixedTableHeaders', ['$timeout', function($timeout) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    $timeout(function() {
                        var container = element.parentsUntil(attrs.fixedTableHeaders);
                        element.stickyTableHeaders({
                            scrollableArea: container,
                            'fixedOffset': 0
                        });
                    }, 0);
                }
            };
        }]);

})();
