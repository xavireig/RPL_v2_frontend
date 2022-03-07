(function() {
    'use strict';

    angular
        .module('app.draft')
        .filter('DateTimeLeft', DateTimeLeftFilter);

    DateTimeLeftFilter.$inject = ['moment'];
    /* @ngInject */
    function DateTimeLeftFilter(moment) {
        return function(input, type) {

            var dateTime = 0,
                dateFuture = moment(input),
                dateNow = moment(),

                seconds = Math.floor((dateFuture - (dateNow)) / 1000),
                minutes = Math.floor(seconds / 60),
                hours = Math.floor(minutes / 60),
                days = Math.floor(hours / 24);

            hours = hours - (days * 24);
            minutes = minutes - (days * 24 * 60) - (hours * 60);
            seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);

            if (type === 'days') {
                dateTime = days;
            } else if (type === 'hours') {
                dateTime = hours;
            } else if (type === 'minutes') {
                dateTime = minutes;
            } else if (type === 'seconds') {
                dateTime = seconds;
            }

            dateTime = Math.floor(dateTime);

            if ((dateTime < 10) && ((type === 'hours') || (type === 'minutes') || (type === 'seconds'))) {
                dateTime = '0' + dateTime;
            }

            return dateTime;
        };
    }
})();
