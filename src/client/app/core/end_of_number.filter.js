(function() {
    'use strict';

    angular
        .module('app.core')
        .filter('EndOfNumber', EndOfNumberFilter);

    EndOfNumberFilter.$inject = [
        'moment'
    ];
    /* @ngInject */
    function EndOfNumberFilter() {
        var endsOfNumbers = {
            '1': 'st',
            '2': 'nd',
            '3': 'rd'
        };
        return function(input) {
            if (input) {
                return input < 4 ? input.toString() + endsOfNumbers[input] : input.toString() + 'th';
            } else {
                return '';
            }
        };
    }
})();
