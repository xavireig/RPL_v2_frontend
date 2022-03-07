(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('QueueModel', QueueModel);

    QueueModel.$inject = [];
    /* @ngInject */
    function QueueModel() {
        var queueModel;

        queueModel = {
            data: [],
            total: 0,
            parse: parse,
            clear: clear
        };

        return queueModel;

        function parse(data) {
            queueModel.data = data.data.result;
            queueModel.total = data.data.result.length;
        }

        function clear() {
            queueModel.data = [];
            queueModel.total = 0;
        }
    }
})();
