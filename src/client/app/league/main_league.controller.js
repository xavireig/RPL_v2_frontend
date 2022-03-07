(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('MainLeagueController', MainLeagueController);

    app.filter('stringGdToInteger', function() {
        return function(input) {
            angular.forEach(input, function(value) {
                value.data_tt_gd =  parseInt(value.data_tt_gd);
            })
            return input;
        };
    });

    MainLeagueController.$inject = [
        '$state', 'logger', 'LeagueModel',
        'requestservice', '$stateParams', '$q',
        'ClubModel', 'CommonModel', 'MessageModel',
        'VirtualFixtureModel', 'EplFixtureModel', 'TransferModel', 'fayeservice',
        'UserModel', 'ChatModel', '$timeout', '$scope', '$filter',
        '$anchorScroll', '$location', 'ActionCableChannel'
    ];
    /* @ngInject */
    function MainLeagueController(
        $state, logger, LeagueModel,
        requestservice, $stateParams, $q,
        ClubModel, CommonModel, MessageModel,
        VirtualFixtureModel, EplFixtureModel, TransferModel, fayeservice,
        UserModel, ChatModel, $timeout, $scope, $filter,
        $anchorScroll, $location, ActionCableChannel
    ) {
        var vm = this;

        vm.menu = {
            goLeagueSettings: goLeagueSettings,
            goToClubProfile: goToClubProfile,
            prevWeekFixtures: prevWeekFixtures,
            nextWeekFixtures: nextWeekFixtures,
            getEplFixtures: getEplFixtures,
            displayFixture: displayFixture,
            displayTable: displayTable,
            showSelectedClubFixtures: showSelectedClubFixtures,
            getMoveMatchDay: getMoveMatchDay,
            setTransferActivityOrder: setTransferActivityOrder,
            clubFixturesWasLoadOnce: false,
            messagesIsLoad: false,
            fixturesIsLoad: false,
            eplFixturesIsLoad: false,
            pageWasLoad: false,
            transferActivityOrderBy: ['-get_date'],
            transferActivityOrderReverse: false,
            chat: {
                sendMessage: chatSendMessage,
                keyUp: chatKeyUp
            },
            position: {
                Defender: {
                    id: 0,
                    title: 'Defender',
                    short: 'DEF'
                },
                Midfielder: {
                    id: 10,
                    title: 'Midfielder',
                    short: 'MID'
                },
                Forward: {
                    id: 20,
                    title: 'Forward',
                    short: 'FWD'
                },
                Goalkeeper: {
                    id: 30,
                    title: 'Goalkeeper',
                    short: 'GK'
                }
            }
        };

        vm.model = {
            leagues: LeagueModel,
            league: LeagueModel,
            club: ClubModel,
            common: CommonModel,
            messageBoard: MessageModel,
            fixtures: VirtualFixtureModel,
            eplFixtures: EplFixtureModel,
            mainStat: {},
            currentWeekNum: '',
            featuresList: {},
            transfers: TransferModel,
            tableType: 'default',
            selectedClub: undefined,
            chat: ChatModel
        };

        activate();

        function activate() {
            vm.model.roundWeekNum = vm.model.common.currentWeekNumber;
            getCurrentLeague();
            getTransferList();
            getEplFixtures();
            // ---------RESET CHAT MODEL ----------

            // return $q.all([getMainStatTable(), getEplFixtures(), getMessagesByLeague(), getFeaturesList()]).then(function() {
            return $q.all([chatGetMessages(true), getMainStatTable()]).then(function() {
                vm.menu.pageWasLoad = true;
                connectChatChannel();
            });
        }

        function connectChatChannel() {
            var consumer = new ActionCableChannel('ChatChannel', {league: vm.model.league.id});

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
                }).then(function(received) {
                    if (received.data.success === 0) {
                        containerScrollBottom = container.prop('scrollHeight') - container.scrollTop();
                        console.log(received);
                        vm.model.chat.parse(received);
                        $timeout(function() {
                            container.scrollTop(container.prop('scrollHeight') - containerScrollBottom);
                        }, 0);

                        if (isFirstRun) {
                            $timeout(function() {
                                //var container = angular.element(document.getElementById('chatScroll'));
                                container.on('scroll', function() {
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

        function chatSendMessage() {
            if (vm.model.chat.message.trim() !== '') {
                $scope.sendToChatChannel(vm.model.chat.message);
                vm.model.chat.message = '';
            }
        }

        function chatKeyUp($event) {
            if ($event.which === 13) {
                chatSendMessage();
            }
        }

        function chatSendUndone() {
            vm.model.chat.message = '[request undo]';
            chatSendMessage();
        }

        function goLeagueSettings() {
            $state.go('league_settings', {
                'league_id': $stateParams['league_id']
            });
        }

        function goToClubProfile(oneClub) {
            $state.go('club_profile', {
                'league_id': $stateParams['league_id'],
                'club_id': oneClub.id
            });
        }

        function prevWeekFixtures() {
            if ((vm.model.roundWeekNum - 1) >= vm.model.firstWeek) {
                vm.model.roundWeekNum--;
                getLeagueFixtures();
            }
        }

        function nextWeekFixtures() {
            if ((vm.model.roundWeekNum + 1) <= vm.model.lastWeek) {
                vm.model.roundWeekNum++;
                getLeagueFixtures();
            }
        }

        function displayFixture() {
            if (vm.menu.pageWasLoad) {
                if (!vm.menu.clubFixturesWasLoadOnce) {
                    getClubFixturesResults(CommonModel.selectedClub.id);
                }

                vm.model.tableType = 'fixtures';
            }

        }

        function displayTable() {
            vm.model.tableType = 'default';
        }

        function showSelectedClubFixtures(club) {
            vm.model.selectedClub = club;
            getClubFixturesResults(club.id);
        }

        function setTransferActivityOrder(fieldsArray) {
            var currentSortableField = vm.menu.transferActivityOrderBy[0].substr(1);
            var receivedField = fieldsArray[0];
            var orderSymbol = !vm.menu.transferActivityOrderReverse ? '-' : '+';
            if (currentSortableField === receivedField) {
                vm.menu.transferActivityOrderBy.length = 0;
                vm.menu.transferActivityOrderReverse = !vm.menu.transferActivityOrderReverse;
                fieldsArray.forEach(function(field) {
                    vm.menu.transferActivityOrderBy.push(orderSymbol + field);
                });
            } else {
                vm.menu.transferActivityOrderBy.length = 0;
                vm.menu.transferActivityOrderReverse = false;
                fieldsArray.forEach(function(field) {
                    vm.menu.transferActivityOrderBy.push('+' + field);
                });
            }
        }

        function getClubFixturesResults(clubId) {
            return requestservice.run('getClubFixturesResults', {
                'url_params': {
                    ':club_id': clubId
                }
            }).then(function(received) {
                console.log('getClubFixturesResults');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.fixtures.parseClubFixtures(received);
                    vm.menu.clubFixturesWasLoadOnce = true;
                    logger.success('Fixtures data was received');
                }

                return received;
            });
        }

        function getMainStatTable() {
            return requestservice.run('getMainStatTable', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function(received) {
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.club.clear();
                    vm.model.club.parse(received);
                }

                return received;
            });
        }

        function getMessagesByLeague() {
            return requestservice.run('getMessagesByLeague', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function(received) {
                console.log('MESSAGES');
                console.log(received);
                if (received.data.success === 0) {
                    vm.menu.messagesIsLoad = true;
                    vm.model.messageBoard.clear();
                    vm.model.messageBoard.parse(received);
                }

                return received;
            });
        }
        function getEplFixtures() {
            return requestservice.run('getEplFixtures', {
                'url_params': {
                    ':league_id': $stateParams['league_id'],
                }
            }).then(function(received) {
                if (received.data.success === 0) {
                    vm.menu.eplFixturesIsLoad = true;
                    vm.model.eplFixtures.clear();
                    vm.model.eplFixtures.parse(received);
                    vm.model.eplFixtures.getHash(getEplFixturesHash(received.data.result));
                    scrollTo(received.data.result);
                }
                return received;
            });
        }

        function scrollTo(result) {
            var today = new Date();
            var allDates = [];
            for (var i = 0; i < result.length; i++) {
                var eachDate = new Date(result[i].scheduled);
                if (allDates.indexOf(eachDate) === -1) {
                    allDates.push(eachDate);
                }
            }
            var closestDate = new Date(closest(today, allDates));
            var closestFormattedDate = $filter('date')(closestDate, 'EEE_MMM_dd_yyyy');
            $location.hash(closestFormattedDate);
            $anchorScroll();
        }

        function closest (num, arr) {
            var curr = arr[0];
            var diff = Math.abs (num - curr);
            for (var val = 0; val < arr.length; val++) {
                var newDiff = Math.abs (num - arr[val]);
                if (newDiff < diff) {
                    diff = newDiff;
                    curr = arr[val];
                }
            }
            return curr;
        }

        function getEplFixturesHash(result) {
            var hash = {};
            for (var i = 0; i < result.length; i++) {
                var date = result[i].scheduled;
                if (!hash.hasOwnProperty(date)) {
                    hash[date] = [];
                }
                hash[date].push({
                    round: result[i]['virt_round'],
                    homeScore: result[i]['home_score'],
                    awayScore: result[i]['away_score'],
                    awayRealTeamName: result[i]['away_real_team']['short_club_name'],
                    homeRealTeamName: result[i]['home_real_team']['short_club_name'],
                    isDone: result[i]['is_done'],
                    nowPlay: result[i]['now_play'],
                });
            }
            return hash;
        }

        function getLeagueFixtures() {
            return requestservice.run('getRoundInfo', {
                'url_params': {
                    ':league_id': $stateParams['league_id'],
                    ':round_week_num': vm.model.roundWeekNum
                }
            }).then(function(received) {
                console.log('LEAGUE FIXTURES');
                console.log(received);
                if (received.data.success === 0) {
                    vm.menu.fixturesIsLoad = true;
                    vm.model.fixtures.clear();
                    vm.model.fixtures.parse(received);
                }

                return received;
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
                    vm.model.league = received.data.result;
                    vm.model.league.scoringType = received.data.result['league_scoring_type'];
                    vm.model.firstWeek = received.data.result['start_round_num'];
                    vm.model.lastWeek = received.data.result['start_round_num'] + received.data.result['num_matches'];
                    if (vm.model.roundWeekNum < vm.model.firstWeek) {
                        vm.model.roundWeekNum = vm.model.firstWeek;
                    }
                    customStatsOrderBy();
                    getLeagueFixtures();
                }
                return received;
            });
        }

        function getFeaturesList() {
            return requestservice.run('getFeatures', {
                'url_params': ''
            }).then(function(received) {
                if (received.data.success === 0) {
                    vm.model.featuresList = received.data.result;
                }

                return received;
            });
        }

        function getTransferList() {
            return requestservice.run('getListTransfer', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function(received) {
                if (received.data.success === 0) {
                    console.log('Transfer activity');
                    console.log(received);
                    vm.model.transfers.clear();
                    vm.model.transfers.parse(received);
                }

                return received;
            });
        }

        function getMoveMatchDay(gameId, gameWeek) {
            $state.go('match_day', {
                'league_id': $stateParams['league_id'],
                'club_id': $stateParams['club_id'],
                'round_week_num':gameWeek,
                'game_id':gameId
            });
        }

        function customStatsOrderBy() {
            vm.model.customStatsOrderBy = vm.model.league.scoringType === 'point' ? ['-data_tt_pts', '-data_tt_score', 'id'] : ['-data_tt_pts', '-data_tt_gd', 'id'];
        }
    }
})();
