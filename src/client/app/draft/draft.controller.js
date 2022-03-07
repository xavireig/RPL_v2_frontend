(function () {
    'use strict';

    angular
        .module('app.draft')
        .controller('DraftController', DraftController)
        .run(function(ActionCableConfig, UserModel, config, $q) {
            UserModel.load();
            ActionCableConfig.wsUri = config.actionCableUrl + '/cable?token=' + UserModel.data['auth_token'];
            // this is done because angular older version does not have resolve function which action cable supports
            $q.resolve = $q.defer().resolve;
        });

    DraftController.$inject = [
        '$state', 'logger', '$stateParams',
        'fayeservice', 'requestservice',
        'UserModel', 'ChatModel', '$q',
        'FootballerModel', 'ngTableParams',
        '$filter', 'QueueModel', 'LeagueModel',
        '$timeout', 'DraftStatusModel',
        'DraftResultModel', '$scope', '$mdDialog',
        'CommonModel', 'moment', 'ngDialog', 'ClubModel',
        'ActionCableChannel'
    ];
    /* @ngInject */
    function DraftController(
        $state, logger, $stateParams, fayeservice, requestservice,
        UserModel, ChatModel, $q, FootballerModel, ngTableParams,
        $filter, QueueModel, LeagueModel, $timeout, DraftStatusModel,
        DraftResultModel, $scope, $mdDialog, CommonModel,
        moment, ngDialog, ClubModel, ActionCableChannel
    ) {
        var vm = this;

        vm.menu = {
            chat: {
                sendMessage: chatSendMessage,
                keyUp: chatKeyUp
            },
            table: {
                toggleRow: toggleRow,
                expandRow: expandRow,
                collapseRows: collapseRows
            },
            letStartDraft: letStartDraft,
            goDashboard: goDashboard,
            switchDraftResult: switchDraftResult,
            goToLeagueDashboard: goToLeagueDashboard,
            goToLeagueSettings: goToLeagueSettings,
            treeOptions: {
                dropped: dragAndDropFinished
            },
            toggleAutopick: toggleAutopick,
            draftIsLoading: true,
            positions: [
                'position',
                'forward',
                'defender',
                'midfielder',
                'goalkeeper'
            ],
            getSearchFilter: getSearchFilter,
            startDraftButtonAllowed: startDraftButtonAllowed,
            isChairman: isChairman,
            turnAutoPickOn: turnAutoPickOn,
            turnAutoPickOff: turnAutoPickOff,
            setFootballerDetails: setFootballerDetails,
            showNumberOfTurns: showNumberOfTurns,
            connectionLostDialog: connectionLostDialog
        };

        vm.model = {
            user: UserModel,
            footballerDetails: null,
            chat: ChatModel,
            queue: QueueModel,
            footballers: FootballerModel,
            leagues: LeagueModel,
            draftStatus: DraftStatusModel,
            draftResult: DraftResultModel,
            commonModel: CommonModel,
            footballerExpandedId: 0,
            realTeams: [],
            search: {
                'full_name': '',
                'position': 'position',
                'real_team': {
                    'name': 'club'
                }
            },
            currentDraftResultPoint: {
                name: 'All',
                id: 0
            },
            autopickValue: false,
            'max_iter': 17,
            isDraftGoing: isDraftGoing,
            isDraftCanBegin: isDraftCanBegin,
            isDraftWaitClubs: isDraftWaitClubs,
            isDraftClosed: isDraftClosed,

            showTimer: true,
            timerFinished: timerFinished,

            resetTimerId: 0,
            resetTimerOut: 20,
            currentClub: ClubModel,
            autoPickTurnedOn: false,
            draftStatusLoaded: false,
            seasons: []
        };
        $scope.objectKeys = function(obj) {
            var keyArray = Object.keys(obj);
            var key1Index = keyArray.indexOf('current_iteration');
            var key2Index = keyArray.indexOf('current_step');
            var key3Index = keyArray.indexOf('time_to_end_step');

            if (key1Index > -1) {
                keyArray.splice(key1Index, 1);
            }

            if (key2Index > -1) {
                keyArray.splice(key2Index, 1);
            }


            if (key3Index > -1) {
                keyArray.splice(key2Index, 1);
            }

            return keyArray;
        };

        activate();

        function activate() {
            // socketActivate();
            return $q.all([getAllSeasons(), getCurrentLeague(true), getRealTeams(), getClubInfo()]).then(function() {
                //logger.info('Activated Draft View');
                connectChatChannel();
                connectDraftChannel();
                connectUserChannel();
            });
        }

        function showNumberOfTurns() {
            var ClubsList = [];
            vm.model.draftStatus.data[0].queue.forEach(function(club, index) {
                ClubsList.push(club.id);
            });
            var clubId = vm.model.commonModel.selectedClub.id || $stateParams['club_id'];
            var lowerIndex = ClubsList.indexOf(parseInt(clubId));
            var upperIndex = ((ClubsList.length * 2) - 1) - lowerIndex;
            var currentTurn = (((vm.model.draftStatus.data['current_iteration']) % 2) * ClubsList.length) + vm.model.draftStatus.data['current_step'];

            if (currentTurn === lowerIndex || currentTurn === upperIndex) {
                return 0;
            } else if (currentTurn < lowerIndex) {
                return (lowerIndex - currentTurn);
            } else if (currentTurn > lowerIndex && currentTurn < upperIndex) {
                return (upperIndex - currentTurn);
            } else {
                return (((((ClubsList.length * 2) - 1) - currentTurn) + lowerIndex) + 1);
            }
        }

        $scope.selectFootballer = function(event) {
            $(event.target).addClass('next-auto-pick');
        };

        // modal that will pop-up once actioncable disconnects
        function connectionLostDialog() {
            ngDialog.open({
                template: 'app/draft/connection_lost_dialog.html',
                className: 'player-card ngdialog-theme-default confirmation-dialog confirm-revoke-dialog',
                controller: 'DraftController',
                controllerAs: 'vm',
                showClose: false,
                data: {
                    title: 'CHECK CONNECTION',
                    text: 'Looks like you\'ve been disconnected. Please check your internet connection.',
                }
            });
        }

        function setFootballerDetails(footballerDetails) {
            console.log(footballerDetails);
            vm.model.footballerDetails = footballerDetails;
            vm.model.footballerDetails['age'] = moment().diff(footballerDetails['birth_date'], 'year');
            vm.model.footballerDetails['epl_image_path'] = '../../images/epl_crests/' + footballerDetails['real_team']['short_club_name'].toLowerCase().replace(/ /g, '_') + '.svg';
        }

        function getClubInfo() {
            return requestservice.run('oneClub', {
                'url_params': {
                    ':id': vm.model.commonModel.selectedClub.id || $stateParams['club_id']
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    vm.model.currentClub.parseOne(received);
                    console.log('Selected Club');
                    console.log(vm.model.currentClub.one);
                }
                return received;
            });
        }

        function timerFinished() {
            $timeout(function() {
                console.log('FINISH');
                vm.model.showTimer = false;
                vm.model.resetTimerId = $timeout(goTimerErrorConnect, vm.model.resetTimerOut * 1000);
                $scope.$apply();
            }, 200, false);
        }

        function connectChatChannel() {
            var consumer = new ActionCableChannel('ChatChannel', {league: vm.model.leagues.one.id});

            $scope.sendToChatChannel = function(message) {
                consumer.send(message, 'create');
            };

            consumer.subscribe(function(message) {
                vm.model.chat.data.push(message);
            });

            $scope.$on('$destroy', function() {
                consumer.unsubscribe().then(function() {
                    $scope.sendToChatChannel = undefined;
                });
            });
        }

        function connectUserChannel() {
            var consumer = new ActionCableChannel('UserChannel');

            $scope.addToQueue = function(footballer) {
                consumer.send({'virtual_footballer_id': footballer.id, 'virtual_club_id': (vm.model.commonModel.selectedClub.id || $stateParams['club_id'])}, 'add_to_queue');
            };

            $scope.removeFromQueue = function(preferredFootballerId, index) {
                consumer.send({'preferred_footballer_id': preferredFootballerId}, 'remove_from_queue');
            };

            $scope.rearrangePersonalQueue = function (preferredFootballer, newPosition) {
                consumer.send({'preferred_footballer_id': preferredFootballer.id, 'new_position': newPosition}, 'rearrange_queue');
            };

            consumer.subscribe(function(data) {
                switch (data.type) {
                    case 'added_to_queue':
                        if (data['preferred_footballer']) {
                            logger.info(data.message);
                            vm.model.queue.data.push(data['preferred_footballer']);
                        } else {
                            logger.error(data.message);
                        }
                        break;

                    case 'removed_from_queue':
                        logger.info(data.message);
                        angular.forEach(vm.model.queue.data, function(value, index) {
                            if (value.id === data['preferred_footballer_id']) {
                                vm.model.queue.data.splice(index, 1);
                            }
                        });
                        break;

                    case 'rearranged_queue':
                        logger.info(data.message);
                        break;
                    case 'not_your_turn':
                        logger.info(data.message);
                        break;
                    case 'player_taken':
                        logger.error(data.message);
                        break;
                }
            });

            $scope.$on('$destroy', function() {
                consumer.unsubscribe().then(function() {
                    $scope.addToQueue = undefined;
                });
            });
        }
        function connectDraftChannel() {
            var consumer = new ActionCableChannel('DraftChannel', {league: vm.model.leagues.one.id});
            console.log('Connect Draft Channel');
            $scope.startDraft = function() {
                consumer.send('', 'start_draft');
            };

            $scope.draftPlayer = function(virtualFootballer) {
                consumer.send({'virtual_footballer_id': virtualFootballer.id}, 'draft_player');
            };

            consumer.subscribe(function(data) {
                switch (data.type) {
                    case 'draft_started':
                        logger.info(data.message);
                        vm.model.leagues.one['draft_status'] = data.league['draft_status'];
                        break;
                    case 'footballer_recruited':
                        vm.model.draftResult.data.unshift(data['draft_history']);
                        vm.model.draftResult.last = data['draft_history'];
                        if (vm.model.footballers.hashData[vm.model.draftResult.last['footballer_id']]) {
                            vm.model.footballers.hashData[vm.model.draftResult.last['footballer_id']]['is_drafted'] = true;
                        }
                        break;
                    case 'next_auto_pick':
                        vm.model.draftHistoryId = -1;
                        vm.model.draftStatus.data['current_step'] = data['current_step'];
                        vm.model.draftStatus.data['current_iteration'] = data['current_iteration'];
                        showNumberOfTurns();
                        break;
                    case 'draft_ended':
                        vm.model.draftStatus.data['current_step'] = data['current_step'];
                        vm.model.draftStatus.data['current_iteration'] = data['current_iteration'];
                        vm.model.leagues.one['draft_status'] = data.league['draft_status'];
                        logger.success(data.message);
                        break;
                    case 'update_draft_order':
                        vm.model['max_iter'] = data.league.data.result.league['squad_count'];
                        vm.model.leagues.clear();
                        vm.model.leagues.parseOne(data.league, data.league.data.result.league, data.league.data.result['clubs_list']);
                        vm.model.draftStatus.clear();
                        vm.model.draftStatus.parse(data['draft_order']);
                        vm.model.draftStatus.data['current_step'] = data['draft_order'].data.result['current_step'];
                        vm.model.draftStatus.data['current_iteration'] = data['draft_order'].data.result['current_iteration'];
                        logger.info('Draft Order Updated!');
                        break;
                    case 'restart_timer':
                        vm.model.draftStatus['timer_milliseconds'] =  moment().unix() * 1000 + data['time_to_end_step'] * 1000;
                        timerRestart();
                }
            });

            $scope.$on('$destroy', function() {
                consumer.unsubscribe().then(function() {
                    $scope.startDraft = undefined;
                });
            });
        }

        function switchDraftResult(oneClub) {
            if (oneClub.id !== vm.model.currentDraftResultPoint.id) {
                vm.model.currentDraftResultPoint = oneClub;
            }
        }
        $scope.draftHistoryFilter = function(data) {
            if (vm.model.currentDraftResultPoint.id === 0) {
                return true;
            } else if (data.club.id === vm.model.currentDraftResultPoint.id) {
                return true;
            } else {
                return false;
            }
        };

        function timerRestart() {
            $scope.$broadcast('timer-reset');
            $scope.$broadcast('timer-start');
            $timeout(function() {
                console.log('START');
                vm.model.showTimer = true;
                $timeout.cancel(vm.model.resetTimerId);
                $scope.$apply();
            }, 200, false);
        }

        function goDashboard() {
            $state.go('dashboard', {
                'league_id': $stateParams['league_id']
            });
        }

        function isDraftClosed() {
            return vm.model.leagues.one.id && (vm.model.leagues.one['draft_status'] === 'completed' || vm.model.leagues.one['draft_status'] === 'processing');
        }

        function isDraftGoing() {
            return vm.model.leagues.one.id && vm.model.leagues.one['draft_status'] === 'running';
        }

        function isDraftCanBegin() {
            return vm.model.leagues.one.id && (vm.model.leagues.one['draft_status'] === 'pending') && (vm.model.leagues.one['num_teams'] !== vm.model.leagues.one['req_teams']);
        }

        function isDraftWaitClubs() {
            return vm.model.leagues.one.id && (vm.model.leagues.one['draft_status'] === 'pending') && (vm.model.leagues.one['num_teams'] === vm.model.leagues.one['req_teams']);
        }

        function isChairman() {
            return vm.model.leagues.one['user_id'] === vm.model.user.data.id;
        }

        function chatSendMessage() {
            if (vm.model.chat.message.trim() !== '') {
                $scope.sendToChatChannel(vm.model.chat.message);
                vm.model.chat.message = '';
            }
        }

        function chatGetMessages(isFirstRun) {
            if (!vm.model.chat.isLoading) {
                vm.model.chat.isLoading = true;

                var container = angular.element(document.getElementById('chatScroll'));
                var containerScrollBottom = 0;

                return requestservice.run('getMessages', {
                    'page': vm.model.chat.paging.page++,
                    'per_page': vm.model.chat.paging['per_page'],
                    'url_params': {
                        ':league_id': $stateParams['league_id']
                    }
                }).then(function (received) {
                    if (received.data.success === 0) {
                        containerScrollBottom = container.prop('scrollHeight') - container.scrollTop();
                        console.log(received);
                        vm.model.chat.parse(received);
                        $timeout(function() {
                            container.scrollTop(container.prop('scrollHeight') - containerScrollBottom);
                        }, 0);

                        if (isFirstRun) {
                            $timeout(function () {
                                //var container = angular.element(document.getElementById('chatScroll'));
                                container.on('scroll', function () {
                                    if ((container.scrollTop() <= 100) && (vm.model.chat.data.length < vm.model.chat.total)) {
                                        chatGetMessages(false);
                                    }
                                });
                            }, 500, false);
                        }

                        vm.model.chat.isLoading = false;
                    }
                    return received;
                });
            }
        }

        function chatKeyUp($event) {
            if ($event.which === 13) {
                chatSendMessage();
            }
        }

        function getCurrentLeague(isFirstLoad) {
            return requestservice.run('getLeagueClubsListWithPatterns', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    console.log('First league loaded');
                    console.log(received);
                    vm.model['max_iter'] = received.data.result.league['squad_count'];
                    vm.model.leagues.parseOne(received, received.data.result.league, received.data.result['clubs_list']);

                    if (isFirstLoad) {
                        getDraftStatus();
                        vm.model.chat.clear();
                        $timeout(function() {
                            chatGetMessages(true);
                        }, 500, false);

                        $timeout(function() {
                            getFootballerList();
                        }, 1500, false);
                    }
                }
                return received;
            });
        }

        function getRealTeams() {
            return requestservice.run('getRealTeamsList', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    console.log('Teams loaded');
                    console.log(received);
                    vm.model.realTeams = received.data.result;
                }
                return received;
            });
        }

        function getAllSeasons() {
            return requestservice.run('getAllSeason', {
            }).then(function (received) {
                if (received.data.success === 0) {
                    console.log('Seasons loaded');
                    console.log(received);
                    vm.model.seasons = received.data.result;
                    $scope.previousSeasonId = vm.model.seasons[1].id;
                    console.log($scope.previousSeasonId);
                }
                return received;
            });
        }

        function getDraftStatus() {
            return requestservice.run('draftStatus', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    console.log('draft status');
                    console.log(received);
                    vm.model.draftStatus.parse(received);
                    console.log(vm.model.draftStatus.data);
                    vm.model.draftStatusLoaded = true;
                    // showNumberOfTurns();
                    vm.model.autopickValue = received.data.result['auto_pick'];
                    timerRestart();
                } else {
                    console.log(received);
                }
                return received;
            });
        }

        function getDraftResult(clubId) {
            clubId = clubId || 0;
            var sendData = {
                    'url_params': {
                        ':league_id': $stateParams['league_id']
                    }
                };

            if (clubId !== 0) {
                sendData['filter'] = 'club';
                sendData['club_id'] = clubId;
            }

            return requestservice.run('draftResult', sendData).then(function (received) {
                if (received.data.success === 0) {
                    console.log('DRAFT HISTORY');
                    console.log(received);
                    vm.model.draftResult.parse(received);
                    for (var ind = 0; ind < vm.model.draftResult.data.length; ind++) {
                        if (vm.model.footballers.hashData[vm.model.draftResult.data[ind]['footballer_id']]) {
                            vm.model.footballers.hashData[vm.model.draftResult.data[ind]['footballer_id']]['is_drafted'] = true;
                        }
                    }
                } else {
                    console.log(received.message);
                }
                return received;
            });
        }

        function getFootballerList() {
            return requestservice.run('footballersList', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    console.log('Footballers');
                    console.log(received);
                    vm.model.footballers.clear();
                    vm.model.footballers.parse(received);

                    vm.tableParams = new ngTableParams(
                        {
                            sorting: {
                                'rank': 'asc'
                            }
                        },
                        {
                            filterDelay: 0,
                            getData: function($defer, params) {
                                $scope.orderedData = params.sorting() ?
                                    $filter('orderBy')(vm.model.footballers.data, params.orderBy()) :
                                    vm.model.footballers.data;

                                $defer.resolve($scope.orderedData);
                            }
                        }
                    );

                    getPersonalQueue();
                    getDraftResult();

                }
                return received;
            });
        }

        function getPersonalQueue() {
            return requestservice.run('personalQueue', {
                'url_params': {
                    ':virtual_club_id': vm.model.commonModel.selectedClub.id || $stateParams['club_id']
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    console.log(received);
                    vm.model.queue.parse(received);
                    vm.menu.draftIsLoading = false;
                    for (var ind = 0; ind < vm.model.queue.data.length; ind++) {
                        vm.model.footballers.hashData[vm.model.queue.data[ind]['footballer_id']]['is_personal_queue'] = true;
                    }
                }
                return received;
            });
        }

        function collapseRows() {
            vm.model.footballerExpandedId = 0;
        }

        function expandRow(oneFootballer) {
            vm.model.footballerExpandedId = oneFootballer.id;
        }

        function toggleRow(oneFootballer) {
            if (vm.model.footballerExpandedId === oneFootballer.id) {
                vm.model.footballerExpandedId = 0;
            } else {
                vm.model.footballerExpandedId = oneFootballer.id;
            }
        }

        function letStartDraft() {
            $scope.startDraft();
        }

        function dragAndDropFinished(event) {
            if (event.source.index !== event.dest.index) {
                $scope.rearrangePersonalQueue(event.source.nodeScope.$modelValue,  event.dest.index);
            }
        }

        function turnAutoPickOn() {
            vm.model.autopickValue = true;
            toggleAutopick();
        }

        function openAutoPickModal() {
            ngDialog.open({
                template: 'app/directives/confirmation/confirmation_dialog.html',
                className: 'player-card ngdialog-theme-default confirmation-dialog confirm-revoke-dialog',
                controller: 'GlobalConfirmationDialogController',
                controllerAs: 'vm',
                showClose: false,
                data: {
                    title: 'HEADS-UP',
                    text: 'Auto-pick is now turned on. </br> A pick will be made for you unless you turn off auto-pick.',
                    confirm: {
                        buttonTitle: 'TURN OFF',
                        action: function () {
                            turnAutoPickOff();
                        }
                    },
                    cancel: {
                        buttonTitle: 'OKAY',
                        action: angular.noop
                    }
                }
            });
        }

        function turnAutoPickOff() {
            vm.model.autopickValue = false;
            toggleAutopick();
        }

        function toggleAutopick() {
            return requestservice.run('toggleAutopick', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                },
                'toggle': vm.model.autopickValue
            }).then(function(received) {
                if (received.data.success === 0) {
                    console.log(received.data.result['auto_pick']);
                    vm.model.autopickValue = received.data.result['auto_pick'];
                    if (vm.model.autopickValue) {
                        openAutoPickModal();
                    }
                } else {
                    logger.error(received.data.message);
                    console.log(vm.model.queue.data);
                    vm.model.autopickValue = !vm.model.autopickValue;
                }
                return received;
            });
        }

        function getSearchFilter() {
            return {'full_name': vm.model.search['full_name'],
                'position': vm.model.search.position === 'position' ? '' : vm.model.search.position,
                'real_team': {
                    'name': vm.model.search['real_team'].name === 'club' ? '' : vm.model.search['real_team'].name
                }
            };
        }

        function goTimerErrorConnect() {
            if (vm.model.showTimer) {
                return;
            }
            console.log('Connect to server');
            /*
            logger.success('Connect to server');
            $timeout.cancel(vm.model.resetTimerId);
            location.href = location.href;
            */
        }

        function startDraftButtonAllowed() {
            var draftDate = vm.model.leagues.one['draft_time'];
            return vm.model.leagues.one['user_id'] === vm.model.user.data.id &&
                   moment(draftDate).diff(moment(), 'seconds') <= 0 && isDraftWaitClubs();
        }

        function goToLeagueDashboard() {
            $state.go('league_before_draft', {
                'club_id': $stateParams['club_id'] || vm.model.commonModel.selectedClub.id,
                'league_id': $stateParams['league_id'] || vm.model.commonModel.selectedClub['league_id']
            });
        }

        function goToLeagueSettings() {
            $state.go('league_settings', {
                'league_id': $stateParams['league_id'] || vm.model.commonModel.selectedClub['league_id'],
                settingsTab: 'scoring'
            });
        }
    }
})();
