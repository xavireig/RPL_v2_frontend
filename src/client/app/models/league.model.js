(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('LeagueModel', LeagueModel);

    LeagueModel.$inject = ['moment'];
    /* @ngInject */
    function LeagueModel(moment) {
        var leagueModel;

        leagueModel = {
            one: {
                title: '',
                'req_teams': 12,
                'start_round_num': 10,
                'num_matches': 28,
                'draft_time': '', //"27-10-2015T12:10:00"
                'league_type': '',
                'description': ''
            },
            clubsHash: {},
            data: {
                myLeagues: [],
                invitedLeagues: []
            },
            total: 0,
            paging: {
                'page': 1,
                'per_page': 200
            },
            parse: parse,
            parseOne: parseOne,
            clear: clear
        };

        return leagueModel;

        function parse(data) {
            leagueModel.data.myLeagues = data.data.result['my_leagues'];
            leagueModel.data.invitedLeagues = data.data.result['invited_leagues'];
            leagueModel.total = data.data.total;
        }

        function parseOne(data, league, clubs) {
            leagueModel.one = league || data.data.result;
            leagueModel.one.clubs = clubs || data.data.result.clubs || [];
            leagueModel.one['draft_time_milliseconds'] = moment(leagueModel.one['draft_time']).unix() * 1000;
            for (var ind = 0; ind < leagueModel.one.clubs.length; ind++) {
                leagueModel.clubsHash[leagueModel.one.clubs[ind].id] = leagueModel.one.clubs[ind];
            }
        }

        function clear() {
            leagueModel.data.myLeagues = [];
            leagueModel.data.invitedLeagues = [];
            leagueModel.paging.page = 1;
            leagueModel.total = 0;
        }
    }
})();
