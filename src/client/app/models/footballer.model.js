(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('FootballerModel', FootballerModel);

    FootballerModel.$inject = ['moment'];
    /* @ngInject */
    function FootballerModel(moment) {
        var footballerModel;
        var NEW_NEWS_BOUNDARY = 72;
        var OLD_NEWS_BOUNDARY = 120;
        var newsIcons = {
            new: '/images/player_state_icons/news_new.svg',
            old: '/images/player_state_icons/news_old.svg'
        };

        footballerModel = {
            hashData: {},
            data: [],
            total: 0,
            parse: parse,
            clear: clear,
            getNewsStatusIcon: getNewsStatusIcon
        };

        return footballerModel;

        function getNewsStatusIcon(hours) {
            if (hours && hours <= NEW_NEWS_BOUNDARY) {
                return newsIcons.new;
            }
            else if (hours > NEW_NEWS_BOUNDARY && hours < OLD_NEWS_BOUNDARY) {
                return newsIcons.old;
            }
        }

        function parse(data) {
            data.data.result.forEach(function(footballer) {
                footballerModel.data.push(footballer);
                footballerModel.hashData[footballer.id] = footballer;
            });
            //footballerModel.data = data.data.result;
            footballerModel.total += data.data.result.length;
            /*
            for (var ind = 0; ind < footballerModel.data.length; ind++) {
                footballerModel.hashData[footballerModel.data[ind].id] = footballerModel.data[ind];
            }*/
        }

        function clear() {
            footballerModel.data = [];
            footballerModel.total = 0;
        }
    }
})();
