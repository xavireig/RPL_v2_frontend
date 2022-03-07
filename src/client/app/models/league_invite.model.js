(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('LeagueInviteModel', LeagueInviteModel);

    LeagueInviteModel.$inject = [];
    /* @ngInject */
    function LeagueInviteModel() {
        var leagueInviteModel;

        leagueInviteModel = {
            data: [],
            total: 0,
            parse: parse,
            clear: clear
        };

        return leagueInviteModel;

        function parse(data) {
            leagueInviteModel.data = data.data.result;
            leagueInviteModel.total = data.data.result.length;
        }

        function clear() {
            leagueInviteModel.data = [];
            leagueInviteModel.total = 0;
        }
    }
})();
