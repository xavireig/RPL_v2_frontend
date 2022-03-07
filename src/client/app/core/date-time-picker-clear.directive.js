(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('dateTimePickerClear', dateTimePickerClear);

    dateTimePickerClear.$inject = ['config', 'moment'];
    /* @ngInject */
    function dateTimePickerClear (config, moment) {
        var directive = {
            link: link,
            restrict: 'A',
            scope: {
                dateModel: '=',
                format: '=',
                flag: '='
            }
        };
        return directive;

        function link(scope, element, attrs) {
            element.datetimepicker(
                {
                    sideBySide: true,
                    format: scope.format,
                    defaultDate: scope.dateModel
                });
            element.on('dp.change', function(event) {
                scope.$apply(function () {
                    scope.dateModel = moment(event.date).utc().format();
                    scope.flag = true;
                });
            });
        }
    }
})();
