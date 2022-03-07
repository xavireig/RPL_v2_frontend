(function() {
    'use strict';

    angular
        .module('app.core')
        .filter('range', WeakRangeFilter);

    WeakRangeFilter.$inject = [];
    /* @ngInject */
    function WeakRangeFilter() {
        return function(input, total) {
            var limit = parseInt(total) + 1;
            var count = 1;
            while (count < limit) {
                input.push(count);
                count = count + 1;
            }
            return input;
        };
    }
})();
