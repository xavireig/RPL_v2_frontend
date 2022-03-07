(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('fixedHeaderTable', ['$', function ($) {
            return {
                restrict: 'A',
                transclude: false,

                link: function (scope, element, attrs, controllers) {
                    scope.initTable = function (element) {
                        var container = element.parents('.fixed-header-container');
                        var head = container.find('.fixed-table-head');
                        var body = container.find('.fixed-table-body');
                        element.children().clone().prependTo(body);
                        element.find('th').append('<div class="fixed-table-resize"></div>');

                        var divsForSize = head.find('th div.fixed-table-resize');
                        var thsForSize = body.find('thead th');
                        var lastColumn = body.find('thead > tr:first > th:last-child')[0];
                        changeHeaderSize(divsForSize, thsForSize);

                        var last = lastColumn.offsetLeft;

                        setInterval(function () {
                            if (last !== lastColumn.offsetLeft) {
                                last = lastColumn.offsetLeft;
                                changeHeaderSize(divsForSize, thsForSize);
                            }
                        }, 1000);

                        // scope.$watch(
                        //     function () {
                        //         return firstColumn.width();
                        //     },
                        //     function () {
                        //         changeHeaderSize(divsForSize, thsForSize);
                        //     }
                        // );
                        body.parent().on('scroll', function () {
                            head.css('margin-left', -this.scrollLeft + 'px');
                        });

                        function changeHeaderSize(divs, ths) {
                            for (var i = 0; i < divs.length; i++) {
                                $(divs[i]).width($(ths[i]).width());
                            }
                        }
                    };
                }
            };
        }])

        .directive('fixedHeaderItem', ['$timeout', function ($timeout) {
            return {
                restrict: 'A',
                transclude: false,
                link: function (scope, element) {
                    // console.log('--------------------LAL!', scope);
                    // wait for the last item in the ng-repeat then call init
                    if (scope.$last) {
                        // console.log('-----------------LAL');
                        $timeout(function() {
                            scope.initTable(element.parents('table'));
                        }, 100);
                    }
                }
            };
        }]);
})();
