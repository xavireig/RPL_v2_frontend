(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('PredraftLeagueController', PredraftLeagueController);

    PredraftLeagueController.$inject = [
        '$state', 'logger', 'requestservice', '$stateParams',
        '$q', 'UserModel', 'moment', '$timeout', '$scope', 'ngDialog',
        'CommonModel', 'ChatModel', 'ActionCableChannel'
    ];
    /* @ngInject */
    function PredraftLeagueController($state, logger, requestservice, $stateParams, $q, UserModel, moment, $timeout, $scope, ngDialog, CommonModel, ChatModel, ActionCableChannel) {
        var vm = this;
        vm.menu = {
            chat: {
                sendMessage: chatSendMessage,
                keyUp: chatKeyUp
            },
            userIsLeagueOwner: userIsLeagueOwner,
            goToDraft: goToDraft,
            sendReminder: sendReminder,
            inviteMoreOwners: inviteMoreOwners,
            editDraft: editDraft,
            editLeagueInfo: editLeagueInfo,
            editTeamsInLeague: editTeamsInLeague,
            editScoringAndRules: editScoringAndRules
        };

        vm.model = {
            league: {},
            chat: ChatModel,
            draftDaysLeft: null,
            draftHoursLeft: null,
            draftMinutesLeft: null,
            draftTimerRenderTimeout: 10 * 1000,
            commonModel: CommonModel,
            leagueLoaded: false
        };

        activate();

        function activate() {
            return $q.all([getLeagueInfo()]).then(function() {
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

        function getLeagueInfo() {
            return requestservice.run('oneLeague', {
                'url_params': {
                    ':id': $stateParams['league_id']
                }
            }).then(function (received) {
                console.log('Predrafted League');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.league = received.data.result;
                    calculateDraftDate();
                    vm.model.league['league_invites'].forEach(function(invite) {
                        getUserByInvite(invite);
                    });
                    // getSquadSize();
                    if (!vm.model.leagueLoaded) {
                        vm.model.chat.clear();
                        $timeout(function() {
                            chatGetMessages(true);
                        }, 500, false);
                    }
                    vm.model.leagueLoaded = true;
                }
                return received;
            });
        }

        function getSquadSize() {
            for (var i = 0; i < vm.model.league['league_settings_positions'].length; i++) {
                if (vm.model.league['league_settings_positions'][i].position === 'squad') {
                    vm.model.league.squadSize = vm.model.league['league_settings_positions'][i].max;
                }
            }
        }

        function getUserByInvite(invite) {
            requestservice.run('getUserByEmail', {
                'email': invite['email']
            }).then(function(received) {
                if (received.data.success === 0) {
                    invite.owner = received.data.result;
                }
            });
        }

        function userIsLeagueOwner() {
            return UserModel.data.id === (vm.model.league || {})['user'].id;
        }

        function calculateDraftDate() {
            var draftDate = vm.model.league['draft_time'];
            $timeout(function() {
                $scope.$apply(function() {
                    vm.model.draftDaysLeft = Math.max(moment(draftDate).diff(moment(), 'days') , 0);
                    vm.model.draftHoursLeft =  Math.max(moment(draftDate).diff(moment(), 'hours') - 24 * vm.model.draftDaysLeft, 0);
                    vm.model.draftMinutesLeft = Math.max(moment(draftDate).diff(moment(), 'minutes') - 60 * 24 * vm.model.draftDaysLeft - 60 * vm.model.draftHoursLeft, 0);
                });
            }, 0);
            console.log('calculating');
            console.log(draftDate);
            console.log(vm.model.draftDaysLeft);
            console.log(vm.model.draftHoursLeft);
            console.log(vm.model.draftMinutesLeft);
            if (vm.model.draftDaysLeft !== 0 || vm.model.draftHoursLeft !== 0 || vm.model.draftMinutesLeft !== 0) {
                setTimeout(calculateDraftDate, vm.model.draftTimerRenderTimeout);
            }
        }

        function goToDraft() {
            $state.go('draft', {'league_id': $stateParams['league_id'], 'club_id': vm.model.commonModel.selectedClub.id});
        }

        function sendReminder(email) {
            requestservice.run('sendReminder',
                {
                    'league_id': $stateParams['league_id'],
                    'user_email': email
                }
            ).then(function(received) {
                if (received.data.success === 0) {
                    logger.success('Notification was successfully sent');
                } else {
                    logger.error(received.data.message);
                }
            });
        }

        function inviteMoreOwners() {
            $state.go('league_settings', {
                'league_id': $stateParams['league_id'],
                settingsTab: 'basics'
            });
        }

        function editDraft() {
            $state.go('league_settings', {
                'league_id': $stateParams['league_id'],
                settingsTab: 'draft'
            });
        }

        function editLeagueInfo() {
            $state.go('league_settings', {
                'league_id': $stateParams['league_id'],
                settingsTab: 'basics'
            });
        }

        function editTeamsInLeague() {
            ngDialog.open({
                template: 'app/league/predraft_state/delete_team_dialog.html',
                className: 'transfer-dialog ngdialog-theme-default radius',
                controller: 'DeleteTeamController',
                controllerAs: 'vm',
                showClose: false,
                data: {
                    clubList: vm.model.league.clubs
                }
            });
        }

        function editScoringAndRules() {
            $state.go('league_settings', {
                'league_id': $stateParams['league_id'],
                settingsTab: 'scoring'
            });
        }
    }
})();
