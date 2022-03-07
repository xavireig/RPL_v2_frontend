(function () {
    'use strict';

    angular
        .module('app.layout')
        .controller('ApproveTransferController', ApproveTransferController);

    ApproveTransferController.$inject = [
        '$state', 'logger', '$stateParams',
        '$q', 'ngDialog', '$scope', 'LineUpModel', 'BidModel',
        'requestservice'
    ];
    /* @ngInject */
    function ApproveTransferController(
        $state, logger, $stateParams,
        $q, ngDialog, $scope, LineUpModel, BidModel,
        requestservice
    ) {
        var vm = this;

        vm.menu = {
            confirmVeto: confirmVeto,
            approveBid: approveBid
        };

        vm.model = {
            bids: BidModel,
            lineUpModel: LineUpModel
        };

        activate();

        function activate() {
            console.log('Approve transfer dialog opened');
        }

        function approveBid(bid, index) {
            return requestservice.run('acceptBid', {
                'bid_id': bid.id,
                'from_admin': true
            }).then(function (received) {
                console.log('approveBid');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.bids.notApprovedBids.splice(index, 1);
                    console.log(vm.model.bids.notApprovedBids);
                    logger.success('Bid has approved');
                } else {
                    logger.error(received.data.message);
                    console.log(received.data.message);
                }
            });
        }

        function confirmVeto(selectedBid, index) {
            ngDialog.open({
                template: 'app/layout/confirm_veto.dialog.html',
                className: 'transfer-dialog ngdialog-theme-default confirm-dialog',
                controller: 'ConfirmVetoController',
                controllerAs: 'vm',
                showClose: false,
                data: {
                    bid: selectedBid,
                    bidIndexInModel: index,
                    callIfBidsListEmpty: $scope.closeThisDialog
                }
            });
        }
    }
})();
