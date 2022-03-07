(function () {
    'use strict';

    angular
        .module('app.club')
        .controller('ClubSquadController', ClubSquadController);

    ClubSquadController.$inject = ['LineUpModel', 'requestservice', '$stateParams', 'ngDialog', 'CommonModel',
        '$scope', 'InjuryAndSuspensionModel', 'FootballerModel', 'LeagueModel', '$q'];
    /* @ngInject */
    function ClubSquadController(LineUpModel, requestservice, $stateParams, ngDialog, CommonModel, $scope,
                                 InjuryAndSuspensionModel, FootballerModel, LeagueModel, $q) {
        var vm = this;

        vm.menu = {
            dialogPlayerInfo: dialogPlayerInfo,
            makeTeamToTeamTransfer: makeTeamToTeamTransfer
        };

        vm.model = {
            currentLeague: LeagueModel,
            firstWeek: '',
            lastWeek: '',
            roundWeekNum: '',
            footballer: FootballerModel,
            lineUp: LineUpModel,
            commonModel: CommonModel,
            injuryModel: InjuryAndSuspensionModel
        };

        activate();

        function activate() {
            vm.model.roundWeekNum = vm.model.commonModel.currentWeekNumber;
            return $q.all([getCurrentLeague($stateParams['league_id'])]).then(function() {
                getLineUp();
                //logger.info('Activated Dashboard View');
            });
        }

         function getCurrentLeague(leagueId) {
            return requestservice.run('oneLeague', {
                'url_params': {
                    ':id': $stateParams['league_id']
                }
            }).then(function (received) {
                console.log('League');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.currentLeague.parseOne(received);
                    vm.model.firstWeek = vm.model.currentLeague.one['start_round_num'];
                    vm.model.lastWeek = vm.model.currentLeague.one['start_round_num'] + vm.model.currentLeague.one['num_matches'];
                    if (vm.model.roundWeekNum < vm.model.firstWeek) {
                        vm.model.roundWeekNum = vm.model.firstWeek;
                    }
                    if (vm.model.roundWeekNum > vm.model.lastWeek) {
                        vm.model.roundWeekNum = vm.model.lastWeek;
                    }
                    vm.menu.leagueDataIsReady = true;
                }
                return received;
            });
        }

        function getLineUp() {
            return requestservice.run('getLineUpDataByClub', {
                'url_params': {
                    ':club_id': $stateParams['club_id'],
                    ':round_week_num':  vm.model.roundWeekNum
                }
            }).then(function (received) {
                console.log('LineUp');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.lineUp.parseByPositionName(received);
                }
                vm.menu.lineUpIsLoad = true;
                return received;
            });
        }

        function dialogPlayerInfo(player) {
            console.log('player');
            console.log(player);
            ngDialog.open({
                template: 'app/players/player_card.html',
                className: 'player-card ngdialog-theme-default',
                controller: 'PlayerCardController',
                controllerAs: 'vm',
                data: {
                    'virtual_footballer_id': player['id'],
                    'virtual_club_id': $stateParams['club_id'],
                    'week_num': vm.model.roundWeekNum,
                    'player': player,
                    afterTransfer: getLineUp
                }
            });
        }

        function makeTeamToTeamTransfer() {
            console.log('inspecting commonmodel');
            console.log(vm.model.commonModel.selectedClub);
            ngDialog.open({
                template: 'app/transfers/team_to_team_transfer_dialog.html',
                className: 'transfer-dialog ngdialog-theme-default',
                controller: 'TransfersController',
                controllerAs: 'vm',
                data: {
                    dialogType: 'createTransfer',
                    acceptor: $scope.club,
                    offerer: vm.model.commonModel.selectedClub,
                    afterTransfer: function() {}
                }
            });
        }
    }
})();
