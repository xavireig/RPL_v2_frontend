(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('MessageModel', MessageModel);

    MessageModel.$inject = [];
    /* @ngInject */
    function MessageModel() {
        var messageModel;

        messageModel = {
            one: {},
            data: [],
            total: 0,
            paging: {
                'page': 1,
                'per_page': 200
            },
            parse: parse,
            clear: clear
        };

        return messageModel;

        function parse(data) {
            messageModel.data = data.data.result;
            messageModel.total = data.data.result.length;
        }

        function clear() {
            messageModel.data = [];
            messageModel.paging.page = 1;
            messageModel.total = 0;
        }
    }
})();
