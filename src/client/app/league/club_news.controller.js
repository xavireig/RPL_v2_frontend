(function () {
    'use strict';

    angular
        .module('app.club')
        .controller('ClubNewsController', ClubNewsController);

    ClubNewsController.$inject = ['requestservice', '$stateParams', 'NewsModel', '$state'];
    /* @ngInject */
    function ClubNewsController(requestservice, $stateParams, NewsModel, $state) {
        var vm = this;

        vm.menu = {
            goNews: goNews,
            toggleNews: toggleNews
        };

        vm.model = {
            news: NewsModel,
            currentNewsDisplay: 'all',
            newsAreLoaded: false
        };

        vm.view = {
            returnCurrentNewsStyle: returnCurrentNewsStyle,
        };

        activate();

        function activate() {
            vm.model.news.clear();
            if ($stateParams['league_id'] !== '0') {
                getLastNews();
            }
        }

        function getLastNews() {
            return requestservice.run('getLastNews', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                },
                mode: vm.model.currentNewsDisplay
                //'per_page': 5  //5 last news
            }).then(function (received) {
                console.log('NEWS');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.newsAreLoaded = true;
                    vm.model.news.clear();
                    vm.model.news.parse(received);
                }
                return received;
            });
        }

        function goNews() {
            $state.go('news', {
                'league_id': $stateParams['league_id']
            });
        }

        function toggleNews(mode) {
            if (mode !== vm.model.currentNewsDisplay) {
                vm.model.currentNewsDisplay = mode;
                vm.model.newsAreLoaded = false;
                getLastNews();
            }
        }

        function returnCurrentNewsStyle(newsMode) {
            return {
                'current': newsMode === vm.model.currentNewsDisplay
            };
        }
    }
})();
