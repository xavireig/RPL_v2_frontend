(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('NewLeagueInviteLinkController', NewLeagueInviteLinkController);

    NewLeagueInviteLinkController.$inject = [
        '$state', 'logger', '$stateParams', 'authservice',
        'gservice', 'requestservice', 'config', 'LeagueModel', 'moment', '$interval', '$localStorage', 'ngDialog', '$scope', 'UserModel'
    ];
    /* @ngInject */
    function NewLeagueInviteLinkController(
        $state, logger, $stateParams, authservice,
        gservice, requestservice, config, LeagueModel, moment, $interval, $localStorage, ngDialog, $scope, UserModel
    ) {
        var vm = this;

        vm.menu = {
            goToCreateClub: goToCreateClub,
            goToAccept: goToAccept,
            goToDecline: goToDecline,
            goToDashboard: goToDashboard
        };

        vm.model = {
            league: LeagueModel,
            'time_to_draft': {},
            'flag_decline': true
        };

        vm.view = {
            showInvite: showInvite
        };

        activate();

        function activate() {
            UserModel.load();
            console.log(UserModel.isSignedIn);
            console.log(UserModel);
            if (!UserModel.isSignedIn) {
                authservice.routeAuth({name: '/'}, '_', '_', '_');
            }

            getLeagueInfo();
            var decline = $localStorage['declineLeague' + $stateParams['league_code'] + UserModel.data.email];
            if (decline) {
                vm.model['flag_decline'] = false;
            }
        }

        function getLeagueInfo() {
            requestservice.run('getLeagueInfo', {
                'url_params': {
                    ':league_code': $stateParams['league_code']
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    if (received.data.result === '') {
                        $state.go('signin');
                        logger.error('Error to links');
                        return;
                    }
                    vm.model.league = received.data.result;
                    vm.model['time_to_draft']['time'] = moment(vm.model.league['draft_time']).diff(moment());
                    timeToDraft();
                } else {
                    logger.error(received.data.message);
                }
                console.log('--------THERE');
                console.log(vm.model.league);
                return received;
            });
        }

        function goToDashboard() {
            $state.go('main_league');
        }

        function timeToDraft() {
            if (vm.model['time_to_draft']['time'] < 0) {
                vm.model['time_to_draft']['dd'] = vm.model['time_to_draft']['hh'] = vm.model['time_to_draft']['mm'] = '00';
                $interval.cancel(vm.stopTime);
                return;
            }
            var dd = Math.floor(vm.model['time_to_draft']['time'] / 86400000);
            var hh = Math.floor((vm.model['time_to_draft']['time'] - dd * 86400000) / 3600000);
            var mm = Math.floor((vm.model['time_to_draft']['time'] - dd * 86400000 - hh * 3600000) / 60000);
            vm.model['time_to_draft']['dd'] = dd > 10 ? dd : '0' + dd;
            vm.model['time_to_draft']['hh'] = hh > 10 ? hh : '0' + hh;
            vm.model['time_to_draft']['mm'] = mm > 10 ? mm : '0' + mm;
        }

        function updateTime() {
            vm.model['time_to_draft']['time']--;
            timeToDraft();
        }

        vm.stopTime = $interval(updateTime, 60000);

        function goToCreateClub() {
            $localStorage['declineLeague' + $stateParams['league_code'] + UserModel.data.email] = 1;
            $state.go('new_club_form_without_user_signed_up_link', {
                'league_id': vm.model.league.id,
                'league': $stateParams['league_code'],
                redirectedFromInviteLink: true
            });
        }

        function goToAccept() {
            console.log('checking user signed in');
            UserModel.load();
            console.log(UserModel);
            if ($stateParams.redirectedFromClub === null || $stateParams.redirectedFromClub['league_id'] != null) {
                ngDialog.open({
                    template: 'app/league/league_accepted_invite.html',
                    className: 'transfer-dialog ngdialog-invite-link',
                    scope: $scope,
                    controller: 'LeagueAcceptedInviteController',
                    controllerAs: 'vmi',
                    showClose: false,
                    closeByDocument: false,
                    data: {
                        nameLeague: vm.model.league.title,
                        goToCreateClub: goToCreateClub
                    }
                });
            } else if ($stateParams.redirectedFromClub['league_id'] === null) {
                console.log(vm.model.league);
                console.log('--------------------------------------------------- league join ');
                requestservice.run('acceptInvitation', {
                    'url_params': {
                        ':league_id': vm.model.league.id,
                        ':club_id': $stateParams.redirectedFromClub.id
                    }
                }).then(function (received) {
                    console.log(received);
                    console.log('Came after league');
                    console.log(received.data.result);
                    if (received.data.success === 0) {
                        logger.success('Club has joined league successfully');
                        $state.go('dashboard', {
                            'club_id': $stateParams.redirectedFromClub.id,
                            'league_id': vm.model.league.id
                        });
                    }
                    else if (received.data.success === 500) {
                        logger.error(received.data.message);
                    }
                    return received;
                });
            }
        }

        function goToDecline() {
            $localStorage['declineLeague' + $stateParams['league_code'] + UserModel.data.email] = 1;
            vm.model['flag_decline'] = false;
            $state.go('public_leagues_list');
        }

        function showInvite() {
            return vm.model.league['num_teams'] < vm.model.league['req_teams'] &&
                vm.model['flag_decline'] &&
                vm.model.league['draft_status'] === 'pending';
        }
    }
})();
