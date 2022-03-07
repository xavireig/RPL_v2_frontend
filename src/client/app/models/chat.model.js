(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('ChatModel', ChatModel);

    ChatModel.$inject = [];
    /* @ngInject */
    function ChatModel() {
        var chatModel;

        chatModel = {
            isLoading: false,
            dataLastSent: [],
            message: '',
            data: [],
            total: 0,
            paging: {
                'page': 1,
                'per_page': 20
            },
            parse: parse,
            clear: clear
        };

        return chatModel;

        function parse(data) {
            chatModel.total = data.data.total;
            for (var ind = 0; ind < data.data.result.length; ind++) {
                chatModel.data.unshift(data.data.result[ind]);
            }
            console.log(chatModel.data);
        }

        function clear() {
            chatModel.data = [];
            chatModel.dataLastSent = [];
            chatModel.paging.page = 1;
            chatModel.total = 0;
        }
    }
})();
