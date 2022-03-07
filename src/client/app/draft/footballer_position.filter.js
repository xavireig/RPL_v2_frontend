(function() {
    'use strict';

    angular
        .module('app.draft')
        .filter('FootballerPosition', FootballerPositionFilter);

    /* @ngInject */
    function FootballerPositionFilter() {
        return function(input) {
            var pos = {
                'Defender': 'DEF',
                'Midfielder': 'MID',
                'Forward': 'FWD',
                'Goalkeeper': 'GK'
            };
            return pos[input];
        };
    }
})();
