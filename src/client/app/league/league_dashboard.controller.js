(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('LeagueDashboardController', LeagueDashboardController);

    LeagueDashboardController.$inject = [
        '$state', 'logger', 'requestservice', '$q',
        '$stateParams', 'RealTeamModel',
        'ClubModel', 'CommonModel',
        'MatchDayModel'
    ];
    /* @ngInject */
    function LeagueDashboardController($state, logger, requestservice, $q,
                                       $stateParams, RealTeamModel,
                                       ClubModel, CommonModel,
                                       MatchDayModel) {
        var vm = this;

        vm.menu = {
            goClub: goClub,
            goMatchDay: goMatchDay,
            getMoveMatchDay: getMoveMatchDay,
            returnUserClubStyle: returnUserClubStyle,
            returnBestStatParamStyle: returnBestStatParamStyle,
            returnVirtualWeekNum: returnVirtualWeekNum,
            matchDayStatParams: [
                {
                    hashName: 'goals',
                    name: 'goals'
                },
                {
                    hashName: 'kpass',
                    name: 'key passes'
                },
                {
                    hashName: 'pass_pers',
                    name: 'pass %'
                },
                {
                    hashName: 'minutes',
                    name: 'mins. played'
                },
                {
                    hashName: 'discipline',
                    name: 'discipline'
                },
                {
                    hashName: 'goals',
                    name: 'goals against'
                },
                {
                    hashName: 'clean_sheet',
                    name: 'clean sheets'
                }
            ],
            returnBestStatParamImage: returnBestStatParamImage,
            getCarouselPosition: getCarouselPosition,
            matchDayDataIsLoad: false
        };

        vm.model = {
            realTeams: RealTeamModel,
            clubs: ClubModel,
            matchDay: MatchDayModel,
            commonModel: CommonModel,
            roundWeekNum: '',
            getNewMatchDay: getNewMatchDay,
            leagueIsLoad: false,
            test: [],
            featuresList: {}
        };

        activate();

        function activate() {
            if ($stateParams['league_id'] !== '0') {
                getRoundList();
                getCurrentLeague();
                return $q.all([getShortLeagueTable(), getFeaturesList()]).then(function () {
                    //logger.info('Activated Dashboard View');
                });
            }
        }

        function goClub(club) {
            $state.go('club_profile', {
                'league_id': $stateParams['league_id'],
                'club_id': club.id
            });
        }

        function goMatchDay() {
            $state.go('match_day', {
                'league_id': $stateParams['league_id'],
                'round_week_num': vm.model.roundWeekNum,
                'club_id': vm.model.commonModel.selectedClub.id
            });
        }

        function getMoveMatchDay(gameId, gameWeek) {
            $state.go('match_day', {
                'league_id': $stateParams['league_id'],
                'club_id': $stateParams['club_id'],
                'round_week_num': gameWeek,
                'game_id': gameId
            });
        }

        function returnUserClubStyle(clubId) {
            return {
                'dark-green-text': vm.model.commonModel.selectedClub.id === clubId
            };
        }

        function returnBestStatParamImage(param, firstParam, secondParam) {
            if (vm.menu.matchDayDataIsLoad && Object.keys(vm.model.matchDay.one).length !== 0) {
                return vm.model.matchDay.one[firstParam + 'ClubData']['out_' + param.hashName] > vm.model.matchDay.one[secondParam + 'ClubData']['out_' + param.hashName];
            }
        }

        function returnBestStatParamStyle(param, firstParam, secondParam) {
            if (vm.menu.matchDayDataIsLoad && Object.keys(vm.model.matchDay.one).length !== 0) {
                return {
                    'dark-green-text': vm.model.matchDay.one[firstParam + 'ClubData']['out_' + param.hashName] >
                    vm.model.matchDay.one[secondParam + 'ClubData']['out_' + param.hashName]
                };
            }
        }

        function returnVirtualWeekNum() {
            if (vm.model.leagueIsLoad) {
                return vm.model.roundWeekNum - vm.model.firstWeek + 1;
            }
        }

        function getCarouselPosition() {
            return (vm.model.roundWeekNum - vm.model.firstWeek);
        }

        function getNewMatchDay(param) {
            console.log(param);
            if (param.page.index !== -1) {
                vm.model.roundWeekNum = vm.model.firstWeek + param.page.index;
                getShortMatchDayInfo();
            }
        }

        function getShortLeagueTable() {
            return requestservice.run('getShortStatTable', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.clubs.parse(received);
                }
                return received;
            });
        }

        function getShortMatchDayInfo() {
            return requestservice.run('getShortMatchDayData', {
                'url_params': {
                    ':league_id': $stateParams['league_id'],
                    ':round_week_num': vm.model.roundWeekNum
                }
            }).then(function (received) {
                console.log(received);
                vm.model.matchDay.clear();
                if (received.data.success === 0) {
                    vm.model.matchDay.parseOne(received);
                    vm.menu.matchDayDataIsLoad = true;
                } else {
                    vm.menu.matchDayDataIsLoad = false;
                }
                return received;
            });
        }

        function getRoundList() {
            return requestservice.run('getRoundList', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    console.log('Round list');
                    console.log(received);
                    vm.model.roundList = received.data.result;
                } else {
                    logger.error(received.data.message);
                }
            });
        }

        function getCurrentLeague() {
            return requestservice.run('oneLeague', {
                'url_params': {
                    ':id': $stateParams['league_id']
                }
            }).then(function (received) {
                console.log('League');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.firstWeek = received.data.result['start_round_num'];
                    if (vm.model.commonModel.currentWeekNumber >= vm.model.firstWeek) {
                        vm.model.roundWeekNum = vm.model.commonModel.currentWeekNumber;
                    } else {
                        vm.model.roundWeekNum = vm.model.firstWeek;
                    }
                    vm.model.leagueIsLoad = true;
                    getShortMatchDayInfo();
                }
                return received;
            });
        }

        function getFeaturesList() {
            return requestservice.run('getFeatures', {
                'url_params': ''
            }).then(function (received) {
                console.log('getFeatures');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.featuresList = received.data.result;
                }
                return received;
            });
        }
    }
})();
