(function() {
    'use strict';

    angular
        .module('app.core')
        .filter('FootballerFullName', FootballerFullNameFilter);

    FootballerFullNameFilter.$inject = [];
    /* @ngInject */
    function FootballerFullNameFilter() {
        var shortNameRegEx = /^(.).*?\s(.*)$/;
        var reverseNameRegEx = /^(.*?)\s(.*)$/;
        return function(input, length, reverse) {
            if (reverse) {
                return input.replace(reverseNameRegEx, '$2, $1');
            }

            if (length) {
                return input.length < length ? input : input.replace(shortNameRegEx, '$1. $2');
            } else {
                return input.replace(shortNameRegEx, '$1. $2');
            }
        };
    }
})();
