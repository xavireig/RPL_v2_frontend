(function() {
    'use strict';

    angular
        .module('app.draft')
        .filter('FootballerAge', FootballerAgeFilter);

    FootballerAgeFilter.$inject = ['moment'];
    /* @ngInject */
    function FootballerAgeFilter(moment) {
        return function(input) {
            var age = Math.floor(moment.duration(moment().diff(input)).asYears());
            return age;
        };
    }
})();
