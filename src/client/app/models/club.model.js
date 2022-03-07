(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('ClubModel', ClubModel);

    ClubModel.$inject = ['UserModel'];
    /* @ngInject */
    function ClubModel(UserModel) {
        var clubModel;

        clubModel = {
            one: {
                clubStatGraphParams: [],
                name: '',
                color1: '#E6E2D9',
                color2: '#293E4B',
                color3: '#FCFEEF',
                'crest_pattern_id': 0
            },
            data: [],
            clubsHash: {},
            allocateFundsData: {},
            total: 0,
            paging: {
                'page': 1,
                'per_page': 200
            },
            maxStatHash: {
                'out_goals': 0,
                'out_pass': 0,
                'out_pass_pers': 0,
                'out_minutes': 0,
                'out_discipline': 0,
                'out_gls_conc': 0,
                'out_clean_sheet': 0
            },
            currentUserIsClubOwner: currentUserIsClubOwner,
            parse: parse,
            clear: clear,
            parseOne: parseOne,
            parseAllocateFundsData: parseAllocateFundsData,
            clearOne: clearOne,
            getClubStatGraphParams: getClubStatGraphParams,
            menuDataClear: menuDataClear,
            parseToHashBy: parseToHashBy
        };

        return clubModel;

        function currentUserIsClubOwner(clubObject, clubUserId) {
            if (clubObject) {
                return UserModel.data.id === clubObject['user_id'];
            }
        }

        function parse(data) {
            clubModel.data = data.data.result;
            clubModel.total = data.data.result.length;
        }

        function parseOne(data) {
            clubModel.one = data.data.result;
        }

        function parseAllocateFundsData(data) {
            clubModel.data = [];
            data.data.result['clubs_budget'].forEach(function(club, index) {
                clubModel.data.push(club);
                //clubModel.data[index].budget = clubModel.data[index].budget + 'M';
            });
        }

        //looking for parameters for club statistic graph
        function getClubStatGraphParams(data) {
            var temp = 0;
            var allClubs = data.data.result['all_clubs'];
            var myClub = data.data.result['my_club'];
            clubModel.one.clubStatGraphParams = [];
            getMaxLeagueStatParams(allClubs);
            console.log(clubModel.maxStatHash);
            //pushing into array graph parameters
            //example: if quotient of user club stat parameter and max league stat parameter is 0.53 (53%)
            //then push into array value 5
            for (var index in clubModel.maxStatHash) {
                if (clubModel.maxStatHash.hasOwnProperty(index)) {
                    if (index === 'out_pass_pers') {
                        myClub[index] = myClub[index] * 10;
                    }
                    if (parseInt(clubModel.maxStatHash[index]) === 0) {
                        temp = (100 + myClub[index] * 10) / 100;
                        clubModel.one.clubStatGraphParams.push(parseInt(temp * 10, 10));
                    } else if (parseInt(clubModel.maxStatHash[index]) < 0) {
                        temp = clubModel.maxStatHash[index] / myClub[index];
                        clubModel.one.clubStatGraphParams.push(parseInt(temp * 10, 10));
                    } else {
                        temp = myClub[index] / clubModel.maxStatHash[index];
                        clubModel.one.clubStatGraphParams.push(parseInt(temp * 10, 10));
                    }
                }
            }
        }

        function menuDataClear() {
            clubModel.menuData = [];
        }

        function clearOne() {
            clubModel.one = {
                clubStatGraphParams: [],
                name: '',
                color1: '#E6E2D9',
                color2: '#293E4B',
                color3: '#FCFEEF',
                'crest_pattern_id': 0
            };
        }

        function clear() {
            clubModel.data = [];
            clubModel.paging.page = 1;
            clubModel.total = 0;
        }

        function parseToHashBy(data, fieldName) {
            data.forEach(function(club) {
                clubModel.clubsHash[club[fieldName]] = club;
            });
        }

        /*
        * private
        * */
        function getMaxLeagueStatParams(allClubs) {
            for (var firstClubParam in clubModel.maxStatHash) {
                if (clubModel.maxStatHash.hasOwnProperty(firstClubParam)) {
                    if (firstClubParam === 'out_pass_pers') {
                        clubModel.maxStatHash[firstClubParam] = allClubs[0][firstClubParam] * 10;
                    } else {
                        clubModel.maxStatHash[firstClubParam] = allClubs[0][firstClubParam];
                    }
                }
            }
            defineMaxLeagueStatParams(allClubs);
        }

        function defineMaxLeagueStatParams(allClubs) {
            for (var i = 1; i < allClubs.length; i++) {
                for (var statParam in clubModel.maxStatHash) {
                    if (clubModel.maxStatHash.hasOwnProperty(statParam)) {
                        if (statParam === 'out_pass_pers') {
                            allClubs[i][statParam] = allClubs[i][statParam] * 10;
                        }
                        if (parseFloat(allClubs[i][statParam]) > parseFloat(clubModel.maxStatHash[statParam])) {
                            clubModel.maxStatHash[statParam] = allClubs[i][statParam];
                        }
                    }
                }
            }
        }
    }
})();
