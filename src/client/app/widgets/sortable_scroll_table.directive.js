(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('sortableScrollTable', sortableScrollTable);

    sortableScrollTable.$inject = ['config', '$window'];
    /* @ngInject */
    function sortableScrollTable (config, $window) {
        //Usage:
        //<div resizable ng-style='{ width: windowWidth, height: windowHeight }'></div>
        var directive = {
            link: link,
            restrict: 'A',
            scope: {
                load: '='
            }
        };
        return directive;

        function link(scope, element, attrs) {
            var oTable = element.DataTable({
                'scrollY': '300px',
                'overflow-y': 'visible',
                'overflow-x': 'disable',

                'scrollCollapse': true,
                'bScrollCollapse': true,
                'paging':         false,
                'bFilter':false,
                'bProcessing': false,
                'bSort': false,
                'oLanguage': {'sZeroRecords': '', 'sEmptyTable': ''},
                'fixedColumns': true,
                'bAutoWidth': false,
                'bStateSave': false,
                'dom': 'frtp',
                'bDestroy' : true
                /*
                'scrollCollapse': true,
                'paging':         false,
                'dom': '<"top"i>rt<"bottom"flp><"clear">',
                'bLengthChange':false,
                'bFilter':false,
                'bPaginate':false,
                'oLanguage': {'sZeroRecords': '', 'sEmptyTable': ''}/*,
                'bScrollCollapse': true,
                'bProcessing': true*/
            });
            element.on('scroll', function() {
                //if (this.scrollTop / this.scrollHeight > 0.70) {
                if ((this.scrollTop + this.scrollWidth) > (this.scrollHeight - 250)) {
                    scope.load();
                }
            });
        }
    }
})();
