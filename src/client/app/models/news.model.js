(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('NewsModel', NewsModel);

    NewsModel.$inject = [];
    /* @ngInject */
    function NewsModel() {
        var newsModel;

        newsModel = {
            one: {},
            news: [],
            blog: [],
            data: [],
            total: 0,
            paging: {
                'page': 1,
                'per_page': 200
            },
            parse: parse,
            clear: clear
        };

        return newsModel;

        function parse(data, newsType) {
            if (newsType) {
                newsModel[newsType] = data.data.result;
            } else {
                newsModel.data = data.data.result;
            }
            newsModel.total = data.data.result.length;
        }

        function clear() {
            newsModel.data = [];
            newsModel.paging.page = 1;
            newsModel.total = 0;
        }
    }
})();
