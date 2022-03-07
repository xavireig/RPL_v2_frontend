(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('dateTimePickerWrapped', dateTimePickerWrapped);

    dateTimePickerWrapped.$inject = ['config', 'moment'];
    /* @ngInject */
    function dateTimePickerWrapped (config, moment) {
        var directive = {
            link: link,
            restrict: 'A',
            scope: {
                dateModel: '='
            }
        };
        return directive;

        function link(scope, element, attrs) {
            console.log(scope.dateModel['draft_time']);
            element.datetimepicker(
                {
                    format: 'MMM D, YYYY h:mma',
                    //debug: true,
                    sideBySide: true,
                    defaultDate: scope.dateModel['draft_time']
                });
            element.on('dp.change', function(event) {
                scope.dateModel['draft_time'] = moment(event.date).utc();
            });
        }
    }
})();
