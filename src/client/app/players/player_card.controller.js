(function () {
    'use strict';

    angular
        .module('app.core')
        .controller('PlayerCardController', PlayerCardController);

    PlayerCardController.$inject = [
        '$state', 'logger', 'requestservice', '$stateParams',
        '$q', '$scope', 'moment', 'NewsModel',
        'UserModel', 'TransferModel', 'ngDialog',
        'CommonModel', '$timeout', '$rootScope', 'dialogWindowService', 'StatIconsModel',
        'RealTeamModel'
    ];
    /* @ngInject */
    function PlayerCardController(
        $state, logger, requestservice, $stateParams,
        $q, $scope, moment, NewsModel,
        UserModel, TransferModel, ngDialog,
        CommonModel, $timeout, $rootScope, dialogWindowService, StatIconsModel,
        RealTeamModel
    ) {
        var vm = this;

        vm.menu = {
            intervals: {
                0: {id: 40, title: 'Season'},
                1: {id: 6, title: 'Last 6'},
                2: {id: 3, title: 'Last 3'}
            },
            offerButtonText: '',
            returnMatchData: returnMatchData,
            playerAge: playerAge,
            clickInterval: clickInterval,
            showValue: showValue,
            dropPlayer: dropPlayer,
            subOutPlayer: subOutPlayer,
            playerCardButtonCallback: undefined
        };

        vm.model = {
            virtualEngagement: {},
            realTeam: RealTeamModel,
            statIconsModel: StatIconsModel,
            showTableStat: [],
            player: {},
            matchData: {},
            'game_log':{},
            news: NewsModel,
            'virtual_footballer_id': 0,
            'form': 40,
            'virtual_club_id': 0,
            'week_num': 0,
            playerStatusText: {
                'free_agent': 'Free agent',
                'waiver': 'Waiver'
            },
            playerStats: CommonModel.playerStats,
            leagueScoringType: {},
            leaguePointsByPositions: {
                defender: {},
                forward: {},
                goalkeeper: {},
                midfielder: {}
            },
            virtEngagementId:0
        };

        vm.view = {
            allowShowSubOut: allowShowSubOut,
            showStatColumn: showStatColumn
        };

        activate();

        function activate() {
            for (var stat in vm.model.playerStats) {
                if (vm.model.playerStats.hasOwnProperty(stat)) {
                    vm.model.playerStats[stat].calculated = false;
                }
            }

            vm.model['virtual_footballer_id'] = $scope.ngDialogData['virtual_footballer_id'];
            vm.model['virtual_club_id'] = $scope.ngDialogData['virtual_club_id'];
            vm.model['week_num'] = $scope.ngDialogData['week_num'];
            vm.model.virtFootballer = $scope.ngDialogData['player'];
            vm.model.afterTransfer = $scope.ngDialogData['afterTransfer'];
            console.log(vm.model['week_num']);
            console.log(CommonModel.currentWeekNumber);
            getScoringTypeData($stateParams['league_id']);
            loadPlayerBasicInfo(true).then(function() {
                vm.menu.offerButtonText = getOfferButtonText();
            //     loadPlayerNews();
            });
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

        function loadPlayerBasicInfo(player) {
            return requestservice.run('getPlayersBasic', {
                'id': vm.model['virtual_footballer_id'],
                'form': vm.model.form,
                'virtual_club_id': vm.model['virtual_club_id'],
                'week_num': vm.model['week_num']
            }).then(function (received) {
                console.log('Player Basic Info');
                console.log(received);
                if (received.data.success === 0) {
                    if (player) {
                        vm.model.virtualEngagement = received.data.result;
                        vm.model.virtEngagementId = received.data.result.id;
                        vm.model.player = received.data.result.footballer;
                        vm.model.player.owner = received.data.result.owner;
                        vm.model.player['player_status'] = received.data.result['player_status'];
                        vm.model.matchData = received.data.result['match_data'];
                    } else {
                        vm.model.player['current_stats'] = received.data.result.footballer['current_stats'];
                    }
                    // loadAllPlayersStats();
                    // vm.model['game_log'] = received.data.result['game_log'];
                }
                return received;
            });
        }

        function playerAge() {
            return moment().diff(vm.model.player['birth_date'], 'year');
        }

        function clickInterval(id) {
            vm.model.form = id;
            loadPlayerBasicInfo(false);
        }

        function showValue(value) {
            return value === undefined ? '-' : value;
        }

        function returnMatchData(matchData) {
            return moment(matchData['scheduled']).format('MM/DD');
        }

        function getOfferButtonText() {
            if (vm.model.player['player_status'] === 'Outbound') {
                vm.menu.playerCardButtonCallback = null;
                vm.model.btnClass = 'btn-red';
                return 'Player Outbound';
            }

            if (vm.model.player['player_status'] === 'Owned' && vm.model.player['owner']['user_id'] === UserModel.data.id) {
                vm.menu.playerCardButtonCallback = dropPlayer;
                vm.model.btnClass = 'btn-red';
                return 'Drop';
            }

            if (vm.model.player['player_status'] === 'left_epl' && vm.model.player['owner']['user_id'] === UserModel.data.id) {
                vm.menu.playerCardButtonCallback = dropPlayer;
                vm.model.btnClass = 'btn-red';
                return 'Drop';
            }

            if (vm.model.player['player_status'] === 'Free Agent') {
                vm.menu.playerCardButtonCallback = takeFreeAgent;
                vm.model.btnClass = 'btn-green';
                return 'Add';
            }
            if (vm.model.player['player_status'] === 'Waiver') {
                vm.menu.playerCardButtonCallback = makeBetOnTheWaiver;
                vm.model.btnClass = 'btn-green';
                return 'Make offer';
            }
            if (vm.model.player['player_status'] === 'Owned' && vm.model.player['owner']['user_id'] !== UserModel.data.id) {
                vm.menu.playerCardButtonCallback = makeTransferTeamToTeam;
                vm.model.btnClass = 'btn-green';
                return 'Make offer';
            }
        }

        function dropPlayer() {
            console.log(vm.model.virtEngagementId);
            if (vm.model['week_num'] >= CommonModel.currentWeekNumber) {
                var apiData = {
                    virtEngagementId: vm.model.virtEngagementId
                };
                dialogWindowService.confirmationDialog.open({
                    data: {
                        title: 'Warning!',
                        text: '<p>You are about to drop this player from your team to the waiver wire.</p>' +
                            '<p>Are you sure you wish to remove this player from your squad?</p>',
                        confirm: {
                            buttonTitle: 'Confirm',
                            action: function () {
                                TransferModel.api.dropPlayer(apiData, false).then(function(data) {
                                    if (data.data.success === 0) {
                                        vm.model.afterTransfer(true);
                                        $scope.closeThisDialog();
                                    }
                                });
                            }
                        },
                        cancel: {
                            buttonTitle: 'Cancel',
                            action: angular.noop
                        }
                    }
                });
            } else {
                logger.error('You can\'t drop player from past week');
            }
        }

        function takeFreeAgent(footballer) {
            ngDialog.open({
                template: 'app/transfers/take_free_agent.dialog.html',
                className: 'transfer-dialog ngdialog-theme-default',
                controller: 'TransfersController',
                controllerAs: 'vm',
                data: {
                    dialogType: 'takeFreeAgent',
                    freeAgent: footballer,
                    afterTransfer: $scope.ngDialogData['afterTransfer']
                }
            });
            $scope.closeThisDialog();
        }

        function makeBetOnTheWaiver(footballer) {
            ngDialog.open({
                template: 'app/transfers/waiver.dialog.html',
                className: 'transfer-dialog ngdialog-theme-default',
                controller: 'TransfersController',
                controllerAs: 'vm',
                data: {
                    dialogType: 'betOnTheWaiver',
                    waiver: footballer,
                    afterTransfer: $scope.ngDialogData['afterTransfer']
                }
            });
            $scope.closeThisDialog();
        }

        function makeTransferTeamToTeam(player) {
            var footballer = {footballer: player}
            ngDialog.open({
                template: 'app/transfers/team_to_team_transfer_dialog.html',
                className: 'transfer-dialog ngdialog-theme-default',
                controller: 'TransfersController',
                controllerAs: 'vm',
                data: {
                    dialogType: 'createTransfer',
                    chosenFootballerFromClub: footballer,
                    virtEngagementId: vm.model.virtEngagementId,
                    acceptor: player['owner'],
                    offerer: CommonModel.selectedClub,
                    afterTransfer: $scope.ngDialogData['afterTransfer']
                }
            });
            $scope.closeThisDialog();
        }

        function allowShowSubOut() {
            return vm.model.player['player_status'] === 'Owned' &&
                   vm.model.player['owner']['user_id'] === UserModel.data.id &&
                   !vm.model.matchData['now_play'] &&
                   !vm.model.matchData['is_done'];
        }

        function subOutPlayer(footballer) {
            ngDialog.close();
            if ($state.current.name === 'lineup') {
                $rootScope.$emit('subout_player', footballer);
            } else {
                $state.go('lineup', {
                    callbackName: 'checkBeforeReplaceAction',
                    player: footballer,
                    'league_id': $stateParams['league_id'],
                    'round_week_num': CommonModel.currentWeekNumber,
                    'club_id': footballer.footballer.owner.id
                });
            }
        }

        function loadPlayerNews() {
            return requestservice.run('getPlayersNews', {
                'footballer_id': vm.model['player_id']
            }).then(function (received) {
                if (received.data.success === 0) {
                    vm.model.news.clear();
                    vm.model.news.parse(received);
                    console.log('vm.model.news', vm.model.news);
                }
                return received;
            });
        }

        function loadAllPlayersStats() {
            if (!vm.model.playerStats[vm.model.form].calculated) {
                return requestservice.run('getAllPlayersStats', {
                    'form': vm.model.form,
                    'league_id': vm.model['league_id']
                }).then(function (received) {
                    if (received.data.success === 0) {
                        parseAllPlayersStats(received);
                    }
                    return received;
                });
            } else {
                parseAllPlayersStats();
            }
        }

        function parseAllPlayersStats(received) {
            if (received) {
                vm.model.playerStats[vm.model.form].data = received.data.result;
                //ToDo: This should be refactored because it's DAMN not good
                StatIconsModel.tableStats.forEach(function(oneStat) {
                    vm.model.playerStats[vm.model.form].data.forEach(function(serverStat) {
                        if (serverStat['key'] === oneStat['parameter']) {
                            angular.extend(serverStat, oneStat);
                        }
                    });
                });

                vm.model.playerStats[vm.model.form].calculated = true;
            }

            var onePlayerStats = vm.model.player['current_stats'];
            vm.model.playerStats[vm.model.form].data.forEach(function(oneValue) {
                if (oneValue.max !== oneValue.min) {

                    if (oneValue.key === 'owned_percentage') {
                        oneValue.value = Math.floor((parseFloat(vm.model.player['owned_percentage']) - oneValue.min) / (oneValue.max - oneValue.min) * 10);
                    } else {
                        if (oneValue.key === 'points') {
                            oneValue.value = Math.floor((parseFloat(vm.model.player['points']) - oneValue.min) / (oneValue.max - oneValue.min) * 10);
                        } else {
                            oneValue.value = Math.floor((parseFloat(onePlayerStats[oneValue.key]) - oneValue.min) / (oneValue.max - oneValue.min) * 10);
                        }
                    }

                    if (oneValue.key === 'owned_percentage') {
                        oneValue.curValue = vm.model.player['owned_percentage'] + '%';
                    } else {
                        if (oneValue.key === 'points') {
                            oneValue.curValue = vm.model.player['points'];
                        } else {
                            if (oneValue.key === 'out_pass_pers') {
                                if (oneValue.text === 'PsC/PsA') {
                                    oneValue.curValue = vm.menu.showValue(onePlayerStats['int_accurate_pass']) + '/' + vm.menu.showValue(onePlayerStats['int_total_pass_add']);
                                } else {
                                    oneValue.curValue = vm.menu.showValue(parseInt(100 * onePlayerStats['out_pass_pers']) + '%');
                                }
                            } else {
                                oneValue.curValue = parseFloat(onePlayerStats[oneValue.key]);
                            }
                        }
                    }
                }

                if (oneValue.inverted) {
                    oneValue.value = 10 - oneValue.value;
                }
            });

            filterStatsTitles();
        }

        function showStatColumn(icon) {
            var result = false;
            if (leagueScoringTypeIsPoints()) {
                result = showPointLegendIcon(icon);
            }
            if (leagueScoringTypeIsCategories()) {
                result = showLegendIcon(icon);
            }
            //Check if blocked by footballer position
            if ((vm.model.player.position === 'forward' || vm.model.player.position === 'midfielder') && icon.parameter === 'int_clean_sheet') {
                result = false;
            }
            if (vm.model.player.position === 'forward' && icon.parameter === 'int_team_goal_conceded') {
                result = false;
            }
            return result;
        }

        function showLegendIcon(icon) {
            var result = false;
            if (!icon['catsAffected'] || icon['catsAffected'].length === 0) {
                result = true;
            } else {
                icon['catsAffected'].forEach(function (category) {
                    result = result || vm.model.leagueScoringType['league_sco_cat'][category];
                });
            }
            return result;
        }

        function showPointLegendIcon(icon) {
            var result = false;
            if (!icon['pointAffected'] || icon['pointAffected'].length === 0) {
                result = true;
            } else {
                icon['pointAffected'].forEach(function (category) {
                    vm.model.leagueScoringType['league_sco_points'].forEach(function (hash) {
                        result = result || parseFloat(hash[category]) !== 0;
                    });
                });
            }
            return result;
        }

        function leagueScoringTypeIsPoints() {
            return vm.model.leagueScoringType['league_sco_type'] && vm.model.leagueScoringType['league_sco_type']['scoring_type'] === 'point';
        }

        function leagueScoringTypeIsCategories() {
            return vm.model.leagueScoringType['league_sco_type'] && vm.model.leagueScoringType['league_sco_type']['scoring_type'] === 'category';
        }

        function filterStatsTitles() {
            $timeout(function() {
                $scope.$apply(function() {
                    vm.model.showTableStat = [];
                    for (var i = 0; i < vm.model.statIconsModel.tableStats.length; i++) {
                        if (vm.view.showStatColumn(vm.model.statIconsModel.tableStats[i])) {
                            vm.model.showTableStat.push(vm.model.statIconsModel.tableStats[i]);
                        }
                    }
                });
            }, 10);
        }
    }
})();
