(function() {
    'use strict';

    angular
        .module('app.core')
        .filter('showTimePassed', ShowTimePassedFilter);

    ShowTimePassedFilter.$inject = [
        'moment'
    ];
    /* @ngInject */
    function ShowTimePassedFilter(moment) {
        return function(input) {
            var dateFormats = ['year', 'month', 'week', 'day', 'hour', 'minute'];
            var timeNow = moment();
            var result = 'about ';

            dateFormats.some(function(dateFormat) {
                var tmp = timeNow.diff(input, dateFormat + 's');
                var tail = '';
                if (tmp === 1 && dateFormat === 'day') {
                    result = 'yesterday';
                    return true;
                }

                if (tmp > 0) {
                    if (dateFormat === 'minutes') {
                        tail = tmp === 1 ? ' ago' : 'es ago';
                    } else {
                        tail = tmp === 1 ? ' ago' : 's ago';
                    }
                    result = result + tmp + ' ' + dateFormat + tail;
                    return true;
                }
            });

            return result;
        };
    }
})();
