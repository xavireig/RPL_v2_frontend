(function () {
    'use strict';

    angular
        .module('app.dashboard')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = [
        '$state', 'logger', 'UserModel', 'LeagueInviteModel',
        'authservice', 'LeagueModel',
        'requestservice', '$q', 'ClubModel', 'CommonModel', 'ngDialog', 'SubscriptionService', '$localStorage',
        '$rootScope', '$scope', '$stateParams'
    ];
    /* @ngInject */
    function DashboardController(
        $state, logger, UserModel, LeagueInviteModel,
        authservice, LeagueModel,
        requestservice, $q, ClubModel, CommonModel, ngDialog, SubscriptionService, $localStorage,
        $rootScope, $scope, $stateParams
    ) {
        var vm = this;

        vm.menu = {
            goNewLeague: goNewLeague,
            goNewClub: goNewClub,
            acceptLeague: acceptLeague,
            rejectLeague: rejectLeague,
            updateClub: updateClub,
            goUpdateClub: goUpdateClub,
            goNewClubFromInvite: goNewClubFromInvite,
            deleteAccount: deleteAccount,
            joinLeagueDialog: joinLeagueDialog,
            joinNewLeagueDialog: joinNewLeagueDialog
        };

        vm.view = {
            selectedLeague: {},
            clubEditMode: false,
            SwitchToEditMode: SwitchToEditMode,
            FieldsToSave: {
                name: '',
                abbr: '',
                stadium: '',
                motto: '',
                'manager_name': ''
            }
        };

        vm.model = {
            commonModel: CommonModel,
            leagueInvites: LeagueInviteModel,
            leagues: LeagueModel,
            clubs: ClubModel,
            user: UserModel,
            currentWeekNum: undefined,
            hideCreateClubs: false,
        };

        activate();

        function activate() {
            return $q.all([getMyClubs()]).then(function () {
                console.log('SELECTED CLUB');
                console.log(vm.model.commonModel.selectedClub);
                showTrynowSubModal();
                getCurrentWeekNumber();
                getMyLeagues();
                getInvitesMeToLeagues();
                //TODO: Temporary advertisement blocking
                if ($localStorage.showSubscriptionDialog) {
                    SubscriptionService.createSubscription();
                }
            });
        }

        function goNewLeague() {
            ngDialog.closeAll();
            ngDialog.open({
                templateUrl: 'app/league/choose_league_type.html',
                className: 'player-card ngdialog-theme-default confirm-revoke-dialog custom-border custom-padding custom-height custom-alignment custom-width-800',
            });
        }

        function goNewClub() {
            $state.go('new_club_form');
        }

        function goNewClubFromInvite(currentInvitation) {
            console.log(vm.model.commonModel.selectedClub);
            if (typeof vm.model.commonModel.selectedClub.league === 'undefined' ||
                vm.model.commonModel.selectedClub.league === null) {

                requestservice.run('acceptInvitation', {
                    'url_params': {
                        ':league_id': currentInvitation.league.id,
                        ':club_id': vm.model.commonModel.selectedClub.id
                    }
                }).then(function (received) {
                    console.log(received);
                    console.log('Came after league');
                    console.log(received.data.result);

                    if (received.data.success === 500) {
                        return;
                    }

                    if (received.data.success === 0) {
                        logger.success('Club has joined league successfully');
                    }
                    else if (received.data.success === 200) {
                        logger.success(received.data.message);
                    }

                    window.location.reload(true);
                    return received;
                });
            }
            else {

                $state.go('new_club_form_without_user_signed_up_link', {
                    'league_id': currentInvitation.league.id,
                    'league': '',
                    redirectedFromInviteLink: true
                });
            }

            // $state.go('new_club_form', {
            //     redirectedFromLeague: leagueInviteId
            // });
        }

        function acceptLeague(currentInvitation) {
            goNewClubFromInvite(currentInvitation);
        }

        function getMyLeagues() {
            vm.model.leagues.clear();
            return requestservice.run('listOfLeagues', {
                'page': vm.model.leagues.paging.page++,
                'per_page': vm.model.leagues.paging['per_page']
            }).then(function (received) {
                console.log('get my leagues');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.leagues.parse(received);
                    vm.view.selectedLeague = vm.model.leagues.data.myLeagues[0] || vm.model.leagues.data.invitedLeagues[0];
                }
                return received;
            });
        }

        function getMyClubs() {
            return requestservice.run('listOfClubs', {
                'page': vm.model.clubs.paging.page++,
                'per_page': vm.model.clubs.paging['per_page']
            }).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.clubs.clear();
                    vm.model.clubs.parse(received);
                    console.log('CLUBS');
                    console.log(received);
                    console.log('Selected Club');
                    console.log(vm.model.commonModel.selectedClub);
                    if (vm.model.commonModel.selectedClub.id === '0') {
                        vm.model.commonModel.selectedClub = vm.model.clubs.data[0];
                        console.log('Selected Club');
                        console.log(vm.model.commonModel.selectedClub);
                    } else {
                        vm.model.clubs.data.forEach(function (club) {
                            if (club.id === parseInt(vm.model.commonModel.selectedClub.id || parseInt($stateParams['league_id']) === club['league_id'])) {
                                vm.model.commonModel.selectedClub = club;
                                console.log(vm.model.commonModel.selectedClub);
                            }
                        });
                        console.log('Selected Club');
                        console.log(vm.model.commonModel.selectedClub);
                    }
                }
                return received;
            });
        }

        function getInvitesMeToLeagues() {
            return requestservice.run('myInvitesInLeagues', {
                'filter': 'waiting'
            }).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.leagueInvites.clear();
                    vm.model.leagueInvites.parse(received);
                }
                return received;
            });
        }

        function checkIfLeagueCanAcceptInvite(currentInvitation, callback) {
            console.log(currentInvitation);
            return requestservice.run('checkIfLeagueCanAcceptInvite', {
                'url_params': {
                    ':invite_id': currentInvitation.id
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    callback();
                } else {
                    logger.error(received.data.message);
                }
                getInvitesMeToLeagues();
                return received;
            });
        }

        function rejectLeague(currentInvitation) {
            return requestservice.run('rejectInvitation', {
                'url_params': {
                    ':league_id': currentInvitation.league.id
                }
            }).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    logger.info('You\'ve rejected the invitation to the league "' + currentInvitation.league.title + '".');
                    getInvitesMeToLeagues();
                }
                return received;
            });
        }

        function getAnyClubWithoutLeague() {
            return CommonModel.clubsList.filter(function (element) {
                return !element['league_id'];
            });
        }

        function updateClub(club) {
            return requestservice.run('updateClub', {
                'url_params': {
                    ':id': club.id
                },
                club: {
                    name: vm.view.FieldsToSave.name,
                    abbr: vm.view.FieldsToSave.abbr,
                    motto: vm.view.FieldsToSave.motto,
                    stadium: vm.view.FieldsToSave.stadium,
                    'manager_name': vm.view.FieldsToSave['manager_name']
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    logger.success('Club was successfully updated');
                    SaveEditMode(club);
                } else {
                    logger.error(received.data.message);
                }
            });
        }

        function goUpdateClub(club) {
            $state.go('update_club_form', {
                'club_id': club.id
            });
        }

        function SwitchToEditMode(club) {
            vm.view.clubEditMode = true;
            vm.view.FieldsToSave.name = club.name;
            vm.view.FieldsToSave.abbr = club.abbr;
            vm.view.FieldsToSave.stadium = club.stadium;
            vm.view.FieldsToSave.motto = club.motto;
            vm.view.FieldsToSave['manager_name'] = vm.model.user.data.fname;
        }

        function SaveEditMode(club) {
            vm.view.clubEditMode = false;
            club.name = vm.view.FieldsToSave.name;
            club.abbr = vm.view.FieldsToSave.abbr;
            club.stadium = vm.view.FieldsToSave.stadium;
            club.motto = vm.view.FieldsToSave.motto;
            vm.model.user.data.fname = vm.view.FieldsToSave['manager_name'];
        }

        function getCurrentWeekNumber() {
            return requestservice.run('getCurrentWeekNumber', {
            }).then(function (received) {
                console.log('Week Num');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.currentWeekNum = received.data.result;
                }
                return received;
            });
        }

        function deleteAccount() {
            ngDialog.open({
                template: 'app/dashboard/delete_account.template.html',
                className: 'transfer-dialog ngdialog-theme-default',
                controller: 'DeleteAccountController',
                controllerAs: 'vm',
                data: {}
            });
        }

        function joinLeagueDialog() {
            if (vm.model.commonModel.selectedClub['league_id'] === null) {
                ngDialog.open({
                    templateUrl: 'app/league/after_club_create_options.html',
                    className: 'player-card ngdialog-theme-default confirmation-dialog confirm-revoke-dialog',
                    controllerAs: vm,
                    data: vm.model.commonModel.selectedClub
                });
            }
        }

        function showTrynowSubModal() {
            if (UserModel.data.subscription.isActive) {
                joinLeagueDialog();
                return true;
            }

            // show subscription modal with no subscription
            // it will  pop out only when user login.
            if ($stateParams.redirectedFromSignin) {
                ngDialog.open({
                    templateUrl: 'app/subscription-notices/subscription_modal.html',
                    className: 'sub-notice-modal'
                });
            }
        }

        function joinNewLeagueDialog() {
            ngDialog.open({
                templateUrl: 'app/league/join_private_league.html',
                className: 'player-card ngdialog-theme-default confirmation-dialog confirm-revoke-dialog',
                controller: 'LeagueJoinDialogController',
                controllerAs: vm,
                data: vm.model.commonModel.selectedClub
            });
        }
    }
})();
