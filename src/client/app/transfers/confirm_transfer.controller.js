(function () {
    'use strict';

    angular
        .module('app.transfers')
        .controller('ConfirmTransferController', ConfirmTransferController);

    ConfirmTransferController.$inject = [
        '$state', 'logger', 'requestservice', '$stateParams',
        '$q', '$scope', 'ngDialog', 'TransferModel', 'BidModel'
    ];
    /* @ngInject */
    function ConfirmTransferController(
        $state, logger, requestservice, $stateParams,
        $q, $scope, ngDialog, TransferModel, BidModel
    ) {
        var vm = this;

        vm.menu = {
            goToEditTransfer: goToEditTransfer,
            confirmType: ''
        };

        vm.model = {
            confirmDialogData: {},
            counterOffer: false,
            requestedVirtualFootballer: {}
        };

        vm.view = {
            buttonBlocked: false
        };

        activate();

        function activate() {
            vm.menu.confirmType = $scope.ngDialogData['confirmType'];
            if ($scope.ngDialogData['confirmType'] === 'waiver') {
                vm.model.confirmDialogData = $scope.ngDialogData;
                vm.menu.confirmButtonCallback = makeBetOnTheWaiver;
                vm.menu.goBack = goToEditWaiver;
                return;
            }

            if ($scope.ngDialogData['confirmType'] === 'team_to_team') {
                vm.model.confirmDialogData = $scope.ngDialogData;
                if (vm.model.confirmDialogData.requestedVirtualFootballer) {
                    vm.model.requestedVirtualFootballer = {footballer: vm.model.confirmDialogData.requestedVirtualFootballer};
                }
                vm.menu.confirmButtonCallback = makeTeamToTeamTransfer;
                vm.menu.goBack = goToEditTransfer;
                return;
            }

            if ($scope.ngDialogData['confirmType'] === 'bid') {
                vm.model.confirmDialogData = $scope.ngDialogData;
                vm.menu.confirmButtonTitle = 'Accept';
                vm.menu.cancelButtonTitle = 'Reject';
                vm.menu.confirmButtonCallback = acceptBid;
                vm.menu.goBack = rejectBid;
            }
        }

        function makeTeamToTeamTransfer() {
            if (vm.model.confirmDialogData.counterOffer && vm.model.confirmDialogData.counterOffer.action) {
                rejectOffer(vm.model.confirmDialogData.counterOffer.bid);
            }
            vm.view.buttonBlocked = true;
            var offeredVirtFootballerIdsArray = Object.keys(vm.model.confirmDialogData.footballersForDropHash);
            var requestedVirtFootballerIdsArray = Object.keys(vm.model.confirmDialogData.footballersForAddHash);
            console.log('yoyoyoyoy');
            console.log(vm.model.requestedVirtualFootballer);
            var moneyOffered = parseFloat(vm.model.confirmDialogData.moneyOffered);
            var message = vm.model.confirmDialogData.message;
            var roundWeekNum = vm.model.confirmDialogData.round;
            if (vm.model.confirmDialogData.requestedVirtualFootballer) {
               var apiData = {
                    offererVirtualClubId: vm.model.confirmDialogData.offerer['id'],
                    acceptorVirtualClubId: vm.model.confirmDialogData.acceptor['id'],
                    offeredVirtFootballerIdsArray: offeredVirtFootballerIdsArray,
                    requestedVirtFootballerIdsArray: requestedVirtFootballerIdsArray,
                    requestedVirtualFootballerId: vm.model.confirmDialogData.requestedVirtualFootballer.id,
                    moneyOffered: moneyOffered,
                    message: message
                };
            } else {
                var apiData = {
                    offererVirtualClubId: vm.model.confirmDialogData.offerer['id'],
                    acceptorVirtualClubId: vm.model.confirmDialogData.acceptor['id'],
                    offeredVirtFootballerIdsArray: offeredVirtFootballerIdsArray,
                    requestedVirtFootballerIdsArray: requestedVirtFootballerIdsArray,
                    moneyOffered: moneyOffered,
                    message: message
                };
            }

            TransferModel.api.transferTeamToTeam(apiData).then(function(data) {
                vm.view.buttonBlocked = false;
                if (data.data.success === 0) {
                    logger.success('Bid was created');
                    vm.model.confirmDialogData.afterTransfer(true);
                    $scope.closeThisDialog();
                } else {
                    logger.error(data.data.message);
                }
            });
        }

        function rejectOffer(bid) {
            BidModel.api.rejectBid(bid.id).then(function(data) {
                bid.hidden = true;
            });
        }

        function makeBetOnTheWaiver() {
            console.log('$scope.ngDialogData');
            console.log($scope.ngDialogData);
            var apiData = {
                clubId: vm.model.confirmDialogData.clubId || $stateParams['club_id'],
                footballerId: vm.model.confirmDialogData.waiver.id,
                moneyOffered: parseFloat(vm.model.confirmDialogData.moneyOffered),
                footballerToDropId: $scope.ngDialogData.footballerToDrop.id
            };
            TransferModel.api.createWaiverBid(apiData, false).then(function (data) {
                if (data.data.success === 0) {
                    if (vm.model.confirmDialogData.afterTransfer) {
                        vm.model.confirmDialogData.afterTransfer(true);
                    }
                    $scope.closeThisDialog();
                } else {
                    logger.error(data.data.message);
                }
            });
        }

        function goToEditWaiver() {
            ngDialog.open({
                template: 'app/transfers/waiver.dialog.html',
                className: 'transfer-dialog ngdialog-theme-default',
                controller: 'TransfersController',
                controllerAs: 'vm',
                data: {
                    dialogType: 'betOnTheWaiver',
                    waiver: vm.model.confirmDialogData.waiver,
                    moneyOffered: $scope.ngDialogData['moneyOffered'],
                    afterTransfer: $scope.ngDialogData['afterTransfer']
                }
            });
            $scope.closeThisDialog();
        }

        function goToEditTransfer() {
            ngDialog.open({
                template: 'app/transfers/team_to_team_transfer_dialog.html',
                className: 'transfer-dialog ngdialog-theme-default',
                controller: 'TransfersController',
                controllerAs: 'vm',
                data: {
                    dialogType: 'editTransfer',
                    footballersForDropHash: $scope.ngDialogData['footballersForDropHash'],
                    footballersForAddHash: $scope.ngDialogData['footballersForAddHash'],
                    moneyOffered: $scope.ngDialogData['moneyOffered'],
                    acceptor: $scope.ngDialogData['acceptor'],
                    offerer: $scope.ngDialogData['offerer'],
                    leagueId: $scope.ngDialogData['leagueId'],
                    afterTransfer: $scope.ngDialogData['afterTransfer'],
                    showClubList: true
                }
            });
            $scope.closeThisDialog();
        }

        function acceptBid() {
            vm.view.buttonBlocked = true;
            BidModel.api.acceptBid($scope.ngDialogData['bidId']).then(function(data) {
                vm.view.buttonBlocked = false;
                if (data.data.success === 0) {
                    vm.model.confirmDialogData.afterTransfer();
                    $scope.closeThisDialog();
                } else {
                    logger.error(data.data.message);
                }
            });

        }

        function rejectBid() {
            vm.view.buttonBlocked = true;
            BidModel.api.rejectBid($scope.ngDialogData['bidId']).then(function(data) {
                vm.view.buttonBlocked = false;
                if (data.data.success === 0) {
                    vm.model.confirmDialogData.afterTransfer();
                    $scope.closeThisDialog();
                }
            });
        }
    }
})();
