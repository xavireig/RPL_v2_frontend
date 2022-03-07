(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('RealTeamModel', RealTeamModel);

    RealTeamModel.$inject = ['$localStorage', 'requestservice', '$base64'];
    /* @ngInject */
    function RealTeamModel($localStorage, requestservice, $base64) {
        var realTeamModel;

        realTeamModel = {
            data: [],
            dataHash: {},
            load: load,
            clear: clear,
            getCrest: getCrest
        };

        return realTeamModel;

        function parse(data) {
            realTeamModel.data = data.data.result;
            generateHash();
        }

        function generateHash() {
            for (var ind = 0; ind < realTeamModel.data.length; ind++) {
                realTeamModel.dataHash[realTeamModel.data[ind].id] = realTeamModel.data[ind];
            }
        }

        function clear() {
            realTeamModel.data = [];
        }

        function load(leagueId) {
            loadRemote(leagueId);
        }

        function loadRemote(leagueId) {
            return requestservice.run('getRealTeams', {
                'url_params': {
                    ':league_id': leagueId
                }
            }).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    parse(received);
                }
                return received;
            });
        }

        function getCrest(optaId) {
            if (!optaId) {
                return;
            }
            var crestImageBasePath = '../images/epl_crests/';

            var optaIdToCrest = {
                '1': 'man_utd.svg', // Manchester United
                '11': 'everton.svg', // Everton
                '110': 'stoke.svg', // Stoke City
                '13': 'leicester.svg', // Leicester City
                '14': 'liverpool.svg', // Liverpool
                '20': 'southampton.svg', // Southampton
                '21': 'west_ham.svg', // West Ham United
                '25': 'middlesbrough.svg', // Middlesbrough
                '3': 'arsenal.svg', // Arsenal
                '31': 'crystal_palace.svg', // Crystal Palace
                '35': 'west_brom.svg', // West Bromwich Albion
                '43': 'man_city.svg', // Manchester City
                '56': 'sunderland.svg', // Sunderland
                '57': 'watford.svg', // Watford
                '6': 'tottenham.svg', // Tottenham Hotspur
                '8': 'chelsea.svg', // Chelsea
                '80': 'swansea.svg', // Swansea City
                '88': 'hull.svg', // Hull City
                '90': 'burnely.svg', // Burnley
                '91': 'bournemouth.svg' // Bournemouth
            };

            var crest = optaIdToCrest[optaId.toString()];

            return crest ? crestImageBasePath + crest : null;
        }
    }
})();
