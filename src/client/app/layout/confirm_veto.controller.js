(function () {
    'use strict';

    angular
        .module('app.layout')
        .controller('ConfirmVetoController', ConfirmVetoController);

    ConfirmVetoController.$inject = [
        '$state', 'logger', '$stateParams',
        '$q', 'requestservice', '$scope', 'BidModel'
    ];
    /* @ngInject */
    function ConfirmVetoController(
        $state, logger, $stateParams,
        $q, requestservice, $scope, BidModel
    ) {
        var vm = this;

        vm.menu = {
            vetoBid: vetoBid
        };

        vm.model = {
            bids: BidModel,
            selectedBid: $scope.ngDialogData.bid,
            selectedBidIndexInModel: $scope.ngDialogData.bidIndexInModel
        };

        activate();

        function activate() {
            return $q.all([]).then(function () {

            });
        }

        function vetoBid() {
            return requestservice.run('vetoBid', {
                'url_params': {
                    ':league_id': $stateParams['league_id'],
                    ':bid_id': vm.model.selectedBid.id
                }
            }).then(function (received) {
                console.log('vetoBid');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.bids.notApprovedBids.splice(vm.model.selectedBidIndexInModel, 1);
                    logger.success('Bid was vetoed');
                    console.log(vm.model.bids.notApprovedBids.length);
                    if (vm.model.bids.notApprovedBids.length === 0) {
                        $scope.ngDialogData.callIfBidsListEmpty();
                    }
                    $scope.closeThisDialog();
                } else {
                    logger.error(received.data.message);
                    console.log(received.data.message);
                }
                return received;
            });
        }
    }
})();
