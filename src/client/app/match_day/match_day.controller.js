(function () {
    'use strict';

    angular
        .module('app.match_day')
        .controller('MatchDayController', MatchDayController)
        .run(function(ActionCableConfig, UserModel, config, $q) {
            UserModel.load();
            ActionCableConfig.wsUri = config.actionCableUrl + '/cable?token=' + UserModel.data['auth_token'];
            // this is done because angular older version does not have resolve function which action cable supports
            $q.resolve = $q.defer().resolve;
        });

    MatchDayController.$inject = [
        '$state', 'logger', 'MatchDayModel', 'requestservice', '$stateParams', '$q',
        'UserModel', 'moment', 'CommonModel', '$timeout', 'ngDialog', '$scope',
        'StatIconsModel', 'ActionCableChannel'
    ];
    /* @ngInject */
    function MatchDayController($state, logger, MatchDayModel, requestservice, $stateParams, $q, UserModel, moment, CommonModel, $timeout, ngDialog, $scope, StatIconsModel, ActionCableChannel) {
        var vm = this;

        vm.menu = {
            getRoundInfo: getRoundInfo,
            showMatchDetailed: showMatchDetailed,
            sortFootballerPosition: sortFootballerPosition,
            returnRoleInRoundSymbol: returnRoleInRoundSymbol,
            returnBetterStatParamStyle: returnBetterStatParamStyle,
            matchIsInProgressOrFinished: matchIsInProgressOrFinished,
            getCarouselPosition: getCarouselPosition,
            getNumberPlace: getNumberPlace,
            showPlayerCard: showPlayerCard,
            clubCtrl: clubCtrl,
            clubOne: clubOne
        };

        vm.model = {
            matchDay: MatchDayModel,
            commonModel: CommonModel,
            getNewRoundInfo: getNewRoundInfo,
            roundList: [],
            roundListIsLoad: false,
            allowUpdateMatchDayInfo: true,
            selectedRound: {
                expanded: false,
                data: {}
            },
            selectedMatch: {
                id: undefined,
                data: {},
                pair: {}
            },
            cable: {
                lastUpdatedAt: moment(),
                timeout: 2, //Interval in minutes to update if cable failed...
                intervalId: null,
                updateInterval: 60000
            },
            position: {
                defender: 3,
                midfielder: 2,
                forward: 1,
                goalkeeper: 4
            },
            leagueScoringType: {},
            leaguePointsByPositions: {
                defender: {},
                forward: {},
                goalkeeper: {},
                midfielder: {}
            }
        };

        vm.view = {
            categoryIcons: StatIconsModel.categoryIcons,
            pointIcons: StatIconsModel.pointIcons,
            categories: StatIconsModel.categories,
            roundStatusToText: {
                'pending': 'Pending',
                'completed': 'Finished',
                'running': 'In progress'
            },
            roleToSymbol: {
                'defender': 'D',
                'midfielder': 'M',
                'goalkeeper': 'G',
                'forward': 'F'
            },
            roleInRoundToSymbol: {
                'player_is_not_declared': 'OUT',
                'in_reserve': 'BN',
                'in_game': 'XI',
                'unknown': 'OUT'
            },
            Arraylize: Arraylize,
            subStatus: subStatus,
            ArraylizeCeil: ArraylizeCeil,
            scoringTypeIsPoint: scoringTypeIsPoint,
            showLegendIcon: showLegendIcon,
            showPointLegendIcon: showPointLegendIcon,
            leagueScoringTypeIsPoints: leagueScoringTypeIsPoints,
            leagueScoringTypeIsCategories: leagueScoringTypeIsCategories,
            toFloat: parseFloat,
            showTwoGSForLosers: showTwoGSForLosers
        };

        activate();

        function activate() {
            return $q.all([getScoringTypeData($stateParams['league_id']), getRoundList()]).then(function(received) {
                connectMatchDayChannel();
            });
        }

        function subStatus(footballer) {
            if(!footballer.subbed_out && !footballer.subbed_in) {
                return 'not_subbed';
            }
            else if(footballer.subbed_out) {
                return 'subbed_out';
            }
            else {
                return 'subbed_in';
            }
        }

        function getScoringTypeData(leagueId) {
            return requestservice.run('getCategoriesData', {
                'url_params': {
                    ':league_id': leagueId
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    vm.model.leagueScoringType = received.data.result;
                    console.log(' ==== vm.model.leagueScoringType ==== ');
                    if (vm.model.leagueScoringType['league_sco_type']['scoring_type'] === 'point') {
                        parsePointsByPositions(vm.model.leagueScoringType['league_sco_points']);
                    }
                    console.log(vm.model.leagueScoringType);
                }
                return received;
            });
        }

        function parsePointsByPositions(pointValuesArray) {
            pointValuesArray.forEach(function (pointValuesHash) {
                vm.model.leaguePointsByPositions[pointValuesHash['position']] = pointValuesHash;
            });
            console.log('+++ vm.model.leaguePointsByPositions +++');
            console.log(vm.model.leaguePointsByPositions);
        }

        function updateMatchInfo() {
            if ($state.current.name === 'match_day') {
                vm.model.cable.lastUpdatedAt = moment();
                if (vm.model.selectedMatch.pair.expanded) {
                    console.log('getting new MatchDay info');
                    getMatchDayInfo(vm.model.selectedMatch.pair.id, false);
                }
            } else {
                clearInterval(vm.model.cable.intervalId);
                console.log('Interval cleared');
            }
        }

        function connectMatchDayChannel() {
            var globalInterval = setInterval(function () {
                console.log("========================Cable Fail safe=========================");
                if ($state.current.name === 'match_day') {
                    // if (moment().diff(vm.model.cable.lastUpdatedAt, 'minutes') > vm.model.cable.timeout) {

                            console.log('Cable failed. Set auto update');
                            updateMatchInfo();
                            getRoundInfo(true);

                    // }
                } else {
                    clearInterval(globalInterval);
                }
            }, vm.model.cable.timeout * 60 * 1000);
        }

        function disallowUpdateMatchDayInfo() {
            vm.model.allowUpdateMatchDayInfo = false;
            $timeout(function () {
                vm.model.allowUpdateMatchDayInfo = true;
            }, 7000);
        }

        function matchIsInProgressOrFinished(footballer) {

            // console.log('footballer-------------------');
            // console.log(footballer);
            var footballerMatchData = footballer['match_data'];
            if (!footballerMatchData) {
                return false;
            }
            return footballerMatchData['is_done'] || footballerMatchData['now_play'];
        }

        function returnRoleInRoundSymbol(footballer) {
            var gameRole = footballer['footballer_role_in_round']['game_role'];
            if (!footballer['match_data']) {
                return vm.view.roleInRoundToSymbol['player_is_not_declared'];
            }
            var scheduled = footballer['match_data']['scheduled'];
            var diffInTime = moment(scheduled).diff(moment(), 'minutes');

            if (gameRole === 'in_game' || gameRole === 'in_reserve' || diffInTime >= 55) {
                if (gameRole === 'unknown' || gameRole === 'player_is_not_declared') {
                    return '';
                } else {
                    return vm.view.roleInRoundToSymbol[gameRole];
                }
            } else {
                return vm.view.roleInRoundToSymbol[gameRole];
            }
        }

        function returnBetterStatParamStyle(parameter, firstTeam, secondTeam) {
            if (vm.model.selectedMatch.data && vm.model.selectedMatch.data[firstTeam + '_line_up_full_data'] && vm.model.selectedMatch.data[secondTeam + '_line_up_full_data']) {
                if (['cat_turn_over'].lastIndexOf(parameter) !== -1) {
                    return {
                        'rounded-num': parseFloat(vm.model.selectedMatch.data[firstTeam + '_line_up_full_data'][firstTeam + '_result'][parameter]) <
                        parseFloat(vm.model.selectedMatch.data[secondTeam + '_line_up_full_data'][secondTeam + '_result'][parameter])
                    };
                } else {
                    return {
                        'rounded-num': parseFloat(vm.model.selectedMatch.data[firstTeam + '_line_up_full_data'][firstTeam + '_result'][parameter]) >
                        parseFloat(vm.model.selectedMatch.data[secondTeam + '_line_up_full_data'][secondTeam + '_result'][parameter])
                    };
                }
            } else {
                return {};
            }
        }

        function getCarouselPosition() {
            var tmp = vm.model.roundWeekNum - vm.model.firstWeek;
            if (vm.model.firstWeek > vm.model.roundWeekNum) {
                tmp += 1;
            }
            return tmp;
        }

        function getNewRoundInfo(param) {
            if (param.page.index !== -1) {
                vm.model.roundWeekNum = vm.model.firstWeek + param.page.index;
                getRoundInfo(false);
            }
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
                    vm.model.firstWeek = vm.model.roundList[0]['number'];
                    vm.model.lastWeek = vm.model.roundList[vm.model.roundList.length - 1]['number'];
                    vm.model.roundWeekNum = parseInt($stateParams['round_week_num']);
                    if (vm.model.roundWeekNum < vm.model.firstWeek) {
                        vm.model.roundWeekNum = vm.model.firstWeek;
                    }
                    if (vm.model.roundWeekNum > vm.model.lastWeek) {
                        vm.model.roundWeekNum = vm.model.lastWeek;
                    }
                    /*
                     vm.model.firstWeek = vm.model.roundList[0]['week'];
                     if (vm.model.commonModel.currentWeekNumber >= vm.model.firstWeek) {
                     vm.model.roundWeekNum = vm.model.commonModel.currentWeekNumber;
                     } else {
                     vm.model.roundWeekNum = vm.model.firstWeek;
                     }*/
                    vm.model.roundListIsLoad = true;
                    getRoundInfo(false);
                } else {
                    logger.error(received.data.message);
                }
            });
        }

        function getRoundInfo(checkSelectedMatch) {
            clearInterval(vm.model.cable.intervalId);
            console.log('--getRoundInfo')
            console.log(vm.model.roundWeekNum + ' ---'+ vm.model.firstWeek);
            console.log(Math.max(vm.model.roundWeekNum, vm.model.firstWeek));
            return requestservice.run('getRoundInfo', {
                'url_params': {
                    ':league_id': $stateParams['league_id'],
                    ':round_week_num': Math.max(vm.model.roundWeekNum, vm.model.firstWeek)
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    if (checkSelectedMatch && vm.model.selectedMatch.data.vf) {
                        received.data.result.vfs.forEach(function (game) {
                            game.expanded = (vm.model.selectedMatch.data.vf['away_club_id'] === game['away_club_id'] ||
                            vm.model.selectedMatch.data.vf['home_club_id'] === game['home_club_id']);
                        });
                    }
                    vm.model.selectedRound.data = received.data.result;
                    console.log('Round Info');
                    console.log(vm.model.selectedRound);

                    if ($stateParams['game_id']) {
                        vm.model.selectedRound.data.vfs.forEach(function (game) {
                            if ($stateParams['game_id'] === game.id) {
                                showMatchDetailed(game);
                            }
                        });
                    }

                } else {
                    logger.error(received.data.message);
                }
            });
        }

        function showMatchDetailed(pair) {
            var sameMatch = vm.model.selectedMatch.id === pair.id;
            vm.model.selectedRound.data.vfs.forEach(function (match) {
                if (match.id !== pair.id) {
                    match.expanded = false;
                } else {
                    pair.expanded = !pair.expanded;
                }
            });

            if (pair.expanded) {
                if (!sameMatch) {
                    vm.model.selectedMatch.id = pair.id;
                    vm.model.selectedMatch.data = {};
                }
                vm.model.selectedMatch.pair = pair;
                getMatchDayInfo(pair.id, false);
            }
        }

        function getMatchDayInfo(fixtureId, isMessage) {
            return requestservice.run('getFullVirtualFixtureDataFromCache', {
                'url_params': {
                    ':league_id': $stateParams['league_id'],
                    ':round_week_num': Math.min(Math.max(vm.model.roundWeekNum, vm.model.firstWeek), vm.model.lastWeek),
                    ':virt_fixture_id': fixtureId
                }
            }).then(function (received) {
                console.log('Match Day Info');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.selectedMatch.data = received.data.result;
                    console.log( vm.model.selectedMatch.data);
                    if (isMessage) {
                        logger.success('MatchDay information successfully loaded');
                    }
                } else {
                    console.error(received.data.message);
                }
                return received;
            });
        }

        function Arraylize(num) {
            num = Math.floor(Math.abs(parseFloat(num)));
            if (num > 0) {
                return new Array(num);
            }
        }

        function ArraylizeCeil(num, full) {
            num = Math.abs(parseFloat(num));
            var arnum = Math.floor(num);
            if (full) {
                return new Array(arnum);
            } else if (num > arnum) {
                return new Array(1);
            }
            return new Array(0);
        }

        function sortFootballerPosition(footballer) {
            return vm.model.position[footballer.footballer.position];
        }

        function getNumberPlace(number) {
            var str = number;
            switch (number) {
                case 1:
                    str += 'st';
                    break;
                case 2:
                    str += 'nd';
                    break;
                case 3:
                    str += 'rd';
                    break;
                default:
                    str += 'th';
            }
            return str;
        }

        function showPlayerCard(event, footballer) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            console.log('footballer');
            ngDialog.open({
                template: 'app/players/player_card.html',
                className: 'player-card ngdialog-theme-default',
                scope: $scope,
                controller: 'PlayerCardController',
                controllerAs: 'vm',
                data: {
                    'player_id': footballer['footballer_id'],
                    'league_id': $stateParams['league_id'],
                    'week_num': vm.model.roundWeekNum,
                    'player': footballer
                }
            });
        }

        function scoringTypeIsPoint() {
            return vm.model.leagueScoringType['league_sco_type'] && vm.model.leagueScoringType['league_sco_type']['scoring_type'] === 'point';
        }

        function showLegendIcon(icon) {
            var result = false;
            if (!icon['categories'] || icon['categories'].length === 0) {
                result = true;
            } else {
                icon['categories'].forEach(function (category) {
                    result = result || vm.model.leagueScoringType['league_sco_cat'][category];
                });
            }
            return result;
        }

        function showPointLegendIcon(icon) {
            var result = false;
            if (!icon['pointCategories'] || icon['pointCategories'].length === 0) {
                result = true;
            } else {
                icon['pointCategories'].forEach(function (category) {
                    vm.model.leagueScoringType['league_sco_points'].forEach(function (hash) {
                        result = result || parseFloat(hash[category]) !== 0;
                    });
                });
            }
            return result;
        }

        function leagueScoringTypeIsPoints() {
            return vm.model.leagueScoringType['league_sco_type']['scoring_type'] === 'point';
        }

        function leagueScoringTypeIsCategories() {
            return vm.model.leagueScoringType['league_sco_type']['scoring_type'] === 'category';
        }

        function showTwoGSForLosers(footballer) {
            return false;
            // return (
            //     ['defender', 'midfielder', 'goalkeeper'].indexOf(footballer.footballer.position) !== -1 &&
            //     footballer['footballer_stat_in_round']['out_minutes'] === 0 &&
            //     footballer['match_data']['is_done']
            // );
        }

        function clubCtrl($event) {
            $event.stopPropagation();
        }

        function clubOne($event) {
            angular.element('#clubView li').removeClass('active');
            angular.element(event.target).addClass('active');
            angular.element('.match-mini-tables-container').hide();
            angular.element('.' + $event).show();
        }
    }
})();
