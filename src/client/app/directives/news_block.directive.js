(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('newsBlock', newBlock);

    newBlock.$inject = [];
    /* @ngInject */
    function newBlock() {
        var directive = {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/directives/news_block.html',
            scope: {
                news: '=',
                personal: '='
            },
            link: function (scope, elem, attr) {
                scope.headersColor = attr.headersColor;
                scope.getFootballersNames = function(footballers) {
                    if (footballers.length) {
                        return footballers.map(function (footballer) {
                            return footballer['full_name'];
                        }).join(', ');
                    }
                    return '';
                };
            }
        };
        return directive;
    }
})();
