(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('DraftResultModel', DraftResultModel);

    DraftResultModel.$inject = [];
    /* @ngInject */
    function DraftResultModel() {
        var draftResultModel;

        draftResultModel = {
            last: {},
            data: [],
            parse: parse,
            clear: clear
        };

        return draftResultModel;

        function parse(data) {
            draftResultModel.data = data.data.result;
            draftResultModel.last = draftResultModel.data[0] || {};
        }

        function clear() {
            draftResultModel.data = {};
        }
    }
})();
