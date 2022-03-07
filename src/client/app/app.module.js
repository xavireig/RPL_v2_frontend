/* jshint -W117 */

(function () {
    'use strict';

    angular.module('app', [
        'app.core',
        'app.widgets',
        'app.dashboard',
        'app.public',
        'app.auth',
        'app.layout',
        'app.league',
        'app.club',
        'app.draft',
        'app.lineup',
        'app.match_day',
        'app.transfers',
        'app.bids',
        'app.news',
        'app.transfers_page',
        angularDragula(angular)
    ]);

})();
