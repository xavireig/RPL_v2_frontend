(function () {
    'use strict';

    angular
        .module('app.lineup')
        .controller('LineupController', LineupController);

    LineupController.$inject = [
        '$state', 'logger', 'LineUpModel',
        'requestservice', '$q', '$stateParams', 'RealTeamModel',
        'LeagueModel', 'ClubModel', 'ngDialog', '$scope', '$timeout', '$rootScope',
        'CommonModel'
    ];
    /* @ngInject */
    function LineupController(
        $state, logger, LineUpModel,
        requestservice, $q, $stateParams, RealTeamModel,
        LeagueModel, ClubModel, ngDialog, $scope, $timeout, $rootScope,
        CommonModel
    ) {
        var vm = this;

        vm.menu = {
            goDashboard: goDashboard,
            returnCurrentFormationStyle: returnCurrentFormationStyle,
            returnSelectedFootballerJerseyOpacity: returnSelectedFootballerJerseyOpacity,
            returnFootballerJerseyData: returnFootballerJerseyData,
            goToNextWeek: goToNextWeek,
            goToPrevWeek: goToPrevWeek,
            goToOtherWeek: goToOtherWeek,
            returnCurrentFormation: returnCurrentFormation,
            returnVirtualWeekNum: returnVirtualWeekNum,
            setNoActive: setNoActive,
            clubDataIsLoad: false,
            leagueDataIsReady: false,
            replaceAction: false,
            statsPlayer: statsPlayer,
            'is_change_match': true,
            CheckClubCapacity: checkClubCapacity,
            saveAutoSub: saveAutoSub
        };

        vm.model = {
            commonModel: CommonModel,
            realTeams: RealTeamModel,
            currentLeague: LeagueModel,
            lineUp: LineUpModel,
            currentClub: ClubModel,
            firstWeek: '',
            lastWeek: '',
            auto_sub: false,
            footballerPositionsHash: LineUpModel.footballerPositionsSymbols,
            footballerExtendedPositionsHash: {
                forward: 'FWD',
                midfielder: 'MID',
                defender: 'DEF',
                goalkeeper: 'GK'
            },
            roundWeekNum: '',
            currentFormation: '',
            replaceDataHash: {
                replacingPosition: '',
                fromTeamFootballerId: undefined,
                toTeamFootballerId: undefined,
                inStarting: false
            },
            listOfChanges: [], //[{in: {}, out: {}}]
            checkBeforeReplaceAction: checkBeforeReplaceAction,
            replaceFootballers: replaceFootballers,
            changeFormation: changeFormation,
            movePlayer: movePlayer
        };

        activate();

        function activate() {
            vm.model.roundWeekNum = $stateParams['round_week_num'];
            console.log('ROUND WEEK NUM');
            console.log(vm.model.roundWeekNum);
            //logger.info('Activated Lineup View')
            return $q.all([getCurrentLeague($stateParams['league_id']), getRealTeams($stateParams['league_id']), getLineUp()]).then(function() {
                checkClubCapacity();
                //logger.info('Activated Dashboard View');
                vm.model.auto_sub = vm.model.lineUp.data.auto_pick;
                console.log('lineup-controller');
                console.log(vm.model.lineUp);
            });
        }

        function saveAutoSub() {
            console.log(vm.model.lineUp.data.id);
            console.log(vm.model.auto_sub);
            return requestservice.run('saveAutoSub', {
                    'id': vm.model.lineUp.data.id, //game week id
                    'auto_sub': vm.model.auto_sub // true or false
                }).then(function (received) {
                    if (received.data.success === 200) {
                        logger.success(received.data.message);
                    } else {
                        logger.error(received.data.message);
                    }
                    return received;
                });
        }

        function checkClubCapacity() {
            if (vm.model.lineUp.total > vm.model.currentLeague.one['squad_size']) {
               ngDialog.open({
                template: 'app/directives/confirmation/confirmation_dialog.html',
                className: 'player-card ngdialog-theme-default confirmation-dialog confirm-revoke-dialog',
                controller: 'GlobalConfirmationDialogController',
                controllerAs: 'vm',
                showClose: false,
                data: {
                    title: 'HEADS-UP',
                    text: 'Your squad is currently over your league’s max size of ' + vm.model.currentLeague.one['squad_size'] + '.You must drop a footballer in order to perform any transactions',
                    cancel: {
                        buttonTitle: 'OKAY',
                        action: angular.noop
                    }
                }
            });
            }
        }

        function goDashboard() {
            $state.go('dashboard');
        }

        function goToPrevWeek() {
            if (vm.model.roundWeekNum > vm.model.firstWeek) {
                vm.model.roundWeekNum = parseInt(vm.model.roundWeekNum) - 1;
                console.log(vm.model.roundWeekNum);
                $state.go('lineup', {
                    'league_id': $stateParams['league_id'],
                    'round_week_num': vm.model.roundWeekNum
                });
            }
        }

        function goToNextWeek() {
            if (vm.model.roundWeekNum < vm.model.lastWeek) {
                vm.model.roundWeekNum = parseInt(vm.model.roundWeekNum) + 1;
                $state.go('lineup', {
                    'club_id': $stateParams['club_id'],
                    'round_week_num': vm.model.roundWeekNum
                });
            }
        }

        function returnVirtualWeekNum() {
            if (vm.menu.leagueDataIsReady) {
                return vm.model.roundWeekNum - vm.model.firstWeek + 1;
            }
        }

        function goToOtherWeek(weekNumber) {

            vm.model.roundWeekNum = weekNumber;

            $state.go('lineup', {
                'club_id': $stateParams['club_id'],
                'round_week_num': vm.model.roundWeekNum
            });
        }

        function returnCurrentFormationStyle(formation) {
            return {
                'active': formation === vm.model.currentFormation,
                'no-active': !vm.menu['is_change_match']
            };
        }

        function setNoActive() {
            return vm.model.lineUp.data['virt_footballers'][0]['virt_round']['round']['full_status'] === 'finished';
        }

        function returnSelectedFootballerJerseyOpacity(footballerId) {
            if (footballerId === vm.model.replaceDataHash.fromTeamFootballerId || !footballerId) {
                return 'fill-opacity: 0.5;';
            } else {
                return '';
            }
        }

        function returnFootballerJerseyData(footballer, output) {
            if (footballer) {
                if (footballer['id'] === vm.model.replaceDataHash.fromTeamFootballerId) {
                    return '';
                } else {
                    return footballer['footballer'][output];
                }
            } else {
                return '';
            }
        }

        function returnCurrentFormation(formation) {
            return formation === vm.model.currentFormation;
        }

        function changeFormation(formation) {
            if (vm.model.currentFormation !== formation && vm.menu['is_change_match']) {
                vm.menu.replaceAction = false;
                vm.model.replaceDataHash.fromTeamFootballerId = undefined;
                return requestservice.run('changeLineUpFormation', {
                    'new_formation': formation,
                    'url_params': {
                        ':club_id': $stateParams['club_id'],
                        ':round_week_num': vm.model.roundWeekNum
                    }
                }).then(function (received) {
                    if (received.data.success === 0) {
                        console.log('Formation');
                        console.log(received);
                        vm.model.currentFormation = formation;
                        vm.model.lineUp.parse(received);
                    } else {
                        logger.error(received.data.message);
                    }
                    return received;
                });
            }
        }

        function checkBeforeReplaceAction(footballer) {
            if (!footballer['match_data']) {
                return;
            }
            if (footballer && footballer['match_data']['is_ongoing'] === false) {
                replaceFootballers(footballer);
            }
        }

        function replaceFootballers(footballer) {
            if ((vm.menu.replaceAction && footballer['footballer']['position'] === vm.model.replaceDataHash.replacingPosition) || !vm.menu.setNoActive()) {
                if (vm.menu.replaceAction) {
                    vm.model.replaceDataHash.toTeamFootballerId = footballer['id'];
                    if (vm.model.replaceDataHash.fromTeamFootballerId === vm.model.replaceDataHash.toTeamFootballerId || vm.model.replaceDataHash.replacingPosition !== footballer['footballer']['position']&& !isReplaceable(footballer)) {
                            vm.model.replaceDataHash.fromTeamFootballerId = undefined;
                            vm.menu.replaceAction = false;
                        } else if (vm.model.replaceDataHash.inStarting !== footballer['on_starting_xi']) {
                            vm.model.movePlayer(vm.model.replaceDataHash.inStarting);
                        } else if (vm.model.replaceDataHash.inBench !== footballer['on_bench']) {
                            vm.model.movePlayer(vm.model.replaceDataHash.inBench);
                        } else if (vm.model.replaceDataHash.inReserve !== footballer['on_reserve']) {
                            vm.model.movePlayer(vm.model.replaceDataHash.inReserve);
                        } else {
                            logger.error('Cannot swap in  between starting XI/benched/reserve players!');
                        }
                } else {
                    vm.menu.replaceAction = true;
                    vm.model.replaceDataHash.fromTeamFootballerId = footballer['id'];
                    vm.model.replaceDataHash.replacingPosition = footballer['footballer']['position'];
                    vm.model.replaceDataHash.inStarting = footballer['on_starting_xi'];
                    vm.model.replaceDataHash.inBench = footballer['on_bench'];
                    vm.model.replaceDataHash.inReserve = footballer['on_reserve'];
                }
            }
        }

        function isReplaceable(footballer) {
                if (vm.model.replaceDataHash.inBench && footballer['on_reserve'] === true) {
                    return true;
                }

                if (vm.model.replaceDataHash.inReserve && footballer['on_bench'] === true) {
                    return true;
                }

                if (footballer['footballer']['position'] === vm.model.replaceDataHash.replacingPosition) {
                    return true;
                } else if (vm.model.replaceDataHash.replacingPosition === 'goalkeeper' ||
                    footballer['footballer']['position'] === 'goalkeeper') {
                    return false;
                } else if (footballer['on_starting_xi']) {
                    return false;
                } else {
                    return false;
                }
            }

        function checkPresenceFootballerInLineUp(inStarting) {
            if (inStarting) {
                return vm.model.replaceDataHash.fromTeamFootballerId;
            } else {
                return vm.model.replaceDataHash.toTeamFootballerId;
            }
        }

        function movePlayer(inStarting) {
            return requestservice.run('movePlayer', {
                'id': checkPresenceFootballerInLineUp(inStarting),
                'to_id': checkPresenceFootballerInLineUp(!inStarting)
            }).then(function (received) {
                console.log('After Move Player');
                console.log(received);
                if (received.data.success === 0) {

                    var change = {};
                    vm.model.lineUp.data['virt_footballers'].forEach(function(virtFootballer) {
                        if (virtFootballer['id'] === checkPresenceFootballerInLineUp(inStarting)) {
                            change.out = virtFootballer;
                        }
                        if (virtFootballer['id'] === checkPresenceFootballerInLineUp(!inStarting)) {
                            change.in = virtFootballer;
                        }

                    });
                    console.log('change');
                    console.log(change);
                    vm.model.listOfChanges.push(change);
                    $timeout(function() {
                        vm.model.listOfChanges.shift();
                    }, 10000);

                    vm.model.replaceDataHash.fromTeamFootballerId = undefined;
                    vm.menu.replaceAction = false;
                    vm.model.lineUp.parse(received);
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function getRealTeams(leagueId) {
            return vm.model.realTeams.load(leagueId);
        }

        function getLineUp() {
            return requestservice.run('getLineUpData', {
                'url_params': {
                    ':club_id': $stateParams['club_id'],
                    ':round_week_num': vm.model.roundWeekNum
                }
            }).then(function (received) {
                console.log('LineUp');
                console.log(received);
                if (received.data.success === 0) {
                    vm.menu.replaceAction = false;
                    vm.model.lineUp.parse(received);
                    vm.model.currentFormation = vm.model.lineUp.data.formation;
                    getClubInfo(vm.model.lineUp.data['club_id']);
                    determineStatusLineUp();

                    $rootScope.$on('subout_player', function(event, footballer) {
                        console.log('subout event emited');
                        console.log(footballer);
                        vm.model.checkBeforeReplaceAction(footballer);
                    });
                    if ($stateParams.callbackName && $stateParams.player) {
                        vm.model[$stateParams.callbackName]($stateParams.player);
                    }

                }
                return received;
            });
        }

        function getCurrentLeague(leagueId) {
            return requestservice.run('oneLeague', {
                'url_params': {
                    ':id': leagueId
                }
            }).then(function (received) {
                console.log('League');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.currentLeague.parseOne(received);
                    vm.model.firstWeek = vm.model.currentLeague.one['start_round_num'];
                    vm.model.lastWeek = vm.model.currentLeague.one['start_round_num'] + vm.model.currentLeague.one['num_matches'] - 1;
                    if (vm.model.roundWeekNum < vm.model.firstWeek) {
                        vm.model.roundWeekNum = vm.model.firstWeek;
                    }
                    if (vm.model.roundWeekNum > vm.model.lastWeek) {
                        vm.model.roundWeekNum = vm.model.lastWeek;
                    }
                    vm.menu.leagueDataIsReady = true;
                    if (vm.model.roundWeekNum < vm.model.firstWeek) {
                        $state.go('lineup', {
                            'club_id': $stateParams['club_id'],
                            'round_week_num': vm.model.firstWeek
                        });
                    }
                }
                return received;
            });
        }

        function getClubInfo(clubId) {
            return requestservice.run('getClubInfo', {
                'url_params': {
                    ':id': clubId
                }
            }).then(function (received) {
                console.log('Club');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.currentClub.parseOne(received);
                    vm.menu.clubDataIsLoad = true;
                }
                return received;
            });
        }

        function statsPlayer(footballer) {
            console.log('footballer');
            console.log(footballer);
            console.log('statsPlayer', footballer);
            ngDialog.open({
                template: 'app/players/player_card.html',
                className: 'player-card ngdialog-theme-default',
                scope: $scope,
                controller: 'PlayerCardController',
                controllerAs: 'vm',
                data: {
                    'virtual_footballer_id': footballer['id'],
                    'virtual_club_id': $stateParams['club_id'],
                    'week_num': vm.model.roundWeekNum,
                    'player': footballer,
                    afterTransfer: getLineUp
                }
            });
        }

        function determineStatusLineUp() {
            for (var index in vm.model.lineUp['players_starting_xi']) {
                if (vm.model.lineUp['players_starting_xi'].hasOwnProperty(index)) {
                    if (vm.model.lineUp['players_starting_xi'][index]['match_data']['is_ongoing'])  {
                        vm.menu['is_change_match'] = false;
                        return;
                    }
                }
            }
        }
    }
})();
