(function () {
    'use strict';

    angular
        .module('app.core')
        .controller('DeleteTeamController', DeleteTeamController);

    DeleteTeamController.$inject = [
        '$state', 'logger', 'requestservice', '$stateParams',
        '$q', '$scope', 'ngDialog'
    ];
    /* @ngInject */
    function DeleteTeamController($state, logger, requestservice, $stateParams, $q, $scope, ngDialog) {
        var vm = this;

        vm.menu = {
            deleteConfirmation: deleteConfirmation,
            deleteClub: deleteClub
        };

        vm.model = {

        };

        activate();

        function activate() {
            console.log('$scope.ngDialogData');
            console.log($scope.ngDialogData);

        }

        function deleteConfirmation(club) {
            ngDialog.open({
                template: 'app/league/predraft_state/delete_confirmation.html',
                className: 'player-card ngdialog-theme-default confirmation-dialog',
                controller: 'DeleteTeamController',
                controllerAs: 'vm',
                showClose: false,
                data: {
                    club: club,
                    clubList: $scope.ngDialogData.clubList
                }
            });
        }

        function deleteClub(clubId) {
            requestservice.run('removeClubFromLeague', {
                'url_params': {
                    ':league_id': $stateParams['league_id'],
                    ':club_id': clubId
                }
            }).then(function(received) {
                if (received.data.success === 0) {
                    logger.success('Club was successfully deleted');
                    removeClubFromList(clubId);
                    $scope.closeThisDialog();
                } else {
                    logger.error(received.data.message);
                }
            });
        }

        function removeClubFromList(clubId) {
            $scope.ngDialogData.clubList.forEach(function(club, index) {
                if (club.id === clubId) {
                    $scope.ngDialogData.clubList.splice(index, 1);
                }
            });
        }
    }
})();
