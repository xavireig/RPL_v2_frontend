(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('CommonModel', CommonModel);

    CommonModel.$inject = [];
    /* @ngInject */
    function CommonModel() {
        var commonModel;

        var formations = {
            'f442': '4-4-2',
            'f433': '4-3-3',
            'f451': '4-5-1',
            'f352': '3-5-2',
            'f343': '3-4-3',
            'f541': '5-4-1',
            'f532': '5-3-2'
        };

        commonModel = {
            menuSideBarWasLoadOnce: false,
            currentWeekNumber: 0,
            currentSeason: {},
            clubsList: [],
            currentSeasonClubs: [],
            oldSeasonClubs: [],
            selectedClub: {},
            parseClubsList: parseClubsList,
            returnSubscription: returnSubscription,
            subscription: {
                draft: undefined,
                'match_day': undefined
            },
            formations: formations,
            leagueClubs:[],
            selectedLeagueClubId: null,

            playerStats: {
                '3': {
                    calculated: false,
                    data: {}
                },
                '6': {
                    calculated: false,
                    data: {}
                },
                '40': {
                    calculated: false,
                    data: {}
                }
            },
            topBarMenu: {
                currentSeasonClubs: {},
                oldSeasonClubs: {}
            },
            clear: clear
        };

        return commonModel;

        function parseClubsList(data) {
            commonModel.clubsList = data.data.result;

            commonModel.currentSeasonClubs = [];
            commonModel.oldSeasonClubs = [];
            commonModel.clubsList.forEach(function(club) {
                if (club['season_id'] === commonModel.currentSeason.id) {
                    commonModel.currentSeasonClubs.push(club);
                } else {
                    commonModel.oldSeasonClubs.push(club);
                }
            });

        }

        function returnSubscription(stateName) {
            return commonModel.subscription[stateName];
        }

        function clear() {
            commonModel.menuSideBarWasLoadOnce = false;
            commonModel.currentSeason = {};
            commonModel.clubsList = [];
            commonModel.currentSeasonClubs = [];
            commonModel.oldSeasonClubs = [];
            commonModel.selectedClub = {};
            commonModel.leagueClubs = [];
        }
    }
})();
