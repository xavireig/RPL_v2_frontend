(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('LeagueJoinDialogController', LeagueJoinDialogController);

    LeagueJoinDialogController.$inject = ['$rootScope', '$state', 'requestservice',
        'logger', 'ngDialog', 'LeagueModel', '$stateParams', 'CommonModel'
    ];
    /* @ngInject */
    function LeagueJoinDialogController($rootScope, $state, requestservice,
        logger, ngDialog, LeagueModel, $stateParams, CommonModel
    ) {
        var vm = this;

        vm.menu = {
            goPrivate: goPrivate,
            createLeague: createLeague,
            changeLeagueType: changeLeagueType,
            getLeagueTypeClass: getLeagueTypeClass,
            goNewLeague: goNewLeague,
            cancelGoPrivate: cancelGoPrivate,
            goPublicLeagues: goPublicLeagues,
            getLeagueFromCode: getLeagueFromCode,
            confirmLeagueJoin: confirmLeagueJoin,
            getMyFirstClub: getMyFirstClub
        };

        vm.model = {
            leagues: LeagueModel,
            leagueType: 'private',
            leagueCode: '',
            club: '',
            invitedLeague: '',
            commonModel: CommonModel,
        };

        activate();

        function activate() {
            vm.model.leagues.one['league_type'] = 'private';
        }

        function goPrivate() {
            ngDialog.closeAll();
            ngDialog.open({
                templateUrl: 'app/league/join_private_league.html',
                className: 'player-card ngdialog-theme-default confirmation-dialog confirm-revoke-dialog',
                controller: 'LeagueJoinDialogController',
                controllerAs: vm
            });
        }

        function cancelGoPrivate() {
            ngDialog.closeAll();
            ngDialog.open({
                templateUrl: 'app/league/after_club_create_options.html',
                className: 'player-card ngdialog-theme-default confirmation-dialog confirm-revoke-dialog',
                controller: 'LeagueJoinDialogController',
                controllerAs: vm
            });
        }

        function createLeague() {
            ngDialog.closeAll();
            ngDialog.open({
                templateUrl: 'app/league/choose_league_type.html',
                className: 'player-card ngdialog-theme-default confirm-revoke-dialog custom-border custom-padding custom-height custom-alignment custom-width-800',
            });
        }

        function changeLeagueType(leagueType) {
            vm.model.leagues.one['league_type'] = leagueType;
        }

        function getLeagueTypeClass(leagueType) {
            return (vm.model.leagues.one['league_type'] === leagueType) ? 'active' : ' ';
        }

        function goPublicLeagues() {
            ngDialog.closeAll();
            $state.go('public_leagues_list', {redirectedFromClub: vm.model.commonModel.selectedClub});
        }

        function goNewLeague() {
            ngDialog.closeAll();
            console.log(vm.model.commonModel.selectedClub);
            console.log(vm.model.commonModel.selectedClub['league_id']);
            if (vm.model.commonModel.selectedClub['league_id'] === null) {
                console.log(vm.model.commonModel.selectedClub);
                $state.go('new_league_form', {redirectedFromClub: vm.model.commonModel.selectedClub, leagueType: vm.model.leagues.one['league_type']});
            } else {
                $state.go('new_league_form', {leagueType: vm.model.leagues.one['league_type']});
            }
        }

        function getLeagueFromCode() {
            requestservice.run('getLeagueInfo', {
                'url_params': {
                    ':league_code': vm.model.leagueCode
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    vm.model.invitedLeague = received.data.result;
                    ngDialog.closeAll();
                    if (vm.model.commonModel.selectedClub['league_id'] === null) {
                        $state.go('new_league_invite_link', {'league_code': vm.model.invitedLeague['uniq_code'], redirectedFromClub: vm.model.commonModel.selectedClub});
                    } else {
                        $state.go('new_league_invite_link', {'league_code': vm.model.invitedLeague['uniq_code']});
                    }
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function getMyFirstClub() {
            return requestservice.run('listOfClubs', {
            }).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.club = received.data.result[0];
                }
                return received;
            });
        }

        function confirmLeagueJoin(league, club) {
            requestservice.run('acceptInvitation', {
                'url_params': {
                    ':league_id': league.id,
                    ':club_id': club.id
                }
            }).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    console.log('Came after league');
                    console.log(received.data.result);
                    logger.success('Club has joined league successfully');
                }
                return received;
            });
        }
    }
})();
