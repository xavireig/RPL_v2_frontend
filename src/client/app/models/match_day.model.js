(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('MatchDayModel', MatchDayModel);

    MatchDayModel.$inject = [];
    /* @ngInject */
    function MatchDayModel() {
        var matchDayModel;

        matchDayModel = {
            one: {},
            data: {},
            total: 0,
            parse: parse,
            parseOne: parseOne,
            clear: clear
        };

        return matchDayModel;

        function parse(data) {
            matchDayModel.data = data.data.result;
        }

        function parseOne(data) {
            matchDayModel.one.awayClubData = data.data.result['away_line_up_full_data'];
            matchDayModel.one.homeClubData = data.data.result['home_line_up_full_data'];
            matchDayModel.one.vf = data.data.result['vf'];
        }

        function clear() {
            matchDayModel.data = {};
            matchDayModel.one = {};
        }
    }
})();
