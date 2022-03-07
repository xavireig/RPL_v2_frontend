(function () {
    'use strict';

    angular
        .module('app.transfers_page')
        .controller('TransfersPageController', TransfersPageController);

    TransfersPageController.$inject = ['requestservice', 'logger', '$stateParams', 'LineUpModel', 'ngDialog', '$scope', 'BidModel', 'CommonModel',
        '$q'];
    /* @ngInject */
    function TransfersPageController(requestservice, logger, $stateParams, LineUpModel, ngDialog, $scope, BidModel, CommonModel,
        $q)
    {
        var vm = this;

        vm.menu = {
            revokeBidDialog: revokeBidDialog,
            openBidDialog: openBidDialog,
            rejectBidDialog: rejectBidDialog,
            deleteOneWaiverBidDialog: deleteOneWaiverBidDialog,
            deleteAllWaiverBidsDialog: deleteAllWaiverBidsDialog,
            makeTeamToTeamTransfer: makeTeamToTeamTransfer,
            showTransfers: showTransfers
        };

        vm.model = {
            bidModel: BidModel,
            commonModel: CommonModel,
            lineupModel: LineUpModel,
            leagueAuctionDate: null,
            myBids: [],
            bidsProposedToMe: [],
            waiverBids: []
        };

        activate();

        function activate() {
            return $q.all([loadLeagueBids()]).then(function(received) {
                loadLeagueWaiverBids();
            });
        }

        // function showTransfers(bid) {
        //     return (bid.league['chairman_vetto']) ? (!bid.hidden && !bid['accepted']) : !bid.hidden;
        // }

        function showTransfers(bid) {
            return (bid.status==='pending'|| bid.status==='approved');
        }

        function loadLeagueBids() {
            requestservice.run('getBids', {
                'club_id': $stateParams['club_id']
            }).then(function (received) {
                if (received.data.success === 0) {
                    console.log('Bids');
                    console.log(received);
                    vm.model.myBids = received.data.result['offered_bids'];
                    vm.model.bidsProposedToMe = received.data.result['requested_bids'];
                } else {
                    logger.error(received.data.message);
                }
            });
        }

        function loadLeagueWaiverBids() {
            requestservice.run('getWaiverBids', {
                'id': $stateParams['club_id']
            }).then(function (received) {
                console.log('Waiver Bid list');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.waiverBids = received.data.result['waiver_bids'];
                    vm.model.leagueAuctionDate = received.data.result['waiver_auction_date'];
                } else {
                    logger.error(received.data.message);
                }
            });
        }

        function revokeBidDialog(bid) {
            ngDialog.open({
                template: 'app/directives/confirmation/confirmation_dialog.html',
                className: 'player-card ngdialog-theme-default confirmation-dialog confirm-revoke-dialog',
                controller: 'GlobalConfirmationDialogController',
                controllerAs: 'vm',
                showClose: false,
                data: {
                    title: 'Revoke offer?',
                    text: 'Are you sure you wish to revoke this offer',
                    confirm: {
                        buttonTitle: 'Revoke',
                        action: function () {
                            revokeBidRequest(bid);
                        }
                    },
                    cancel: {
                        buttonTitle: 'Cancel',
                        action: angular.noop
                    }
                }
            });
        }

        function revokeBidRequest(transferOffer) {
            requestservice.run('revokeBid', {
                'id': transferOffer.id
            }).then(function (received) {
                if (received.data.success === 0) {
                    logger.success('Bid was successfully revoked');
                    loadLeagueBids();
                } else {
                    logger.error(received.data.message);
                }
            });
        }

        function openBidDialog(bid) {
            var offeredFootballers = vm.model.bidModel.parseFootballers(bid['offered_virt_footballers']);
            var requestedFootballers = vm.model.bidModel.parseFootballers(bid['requested_virt_footballers']);

            ngDialog.open({
                template: 'app/transfers/accept_transfer_dialog.html',
                className: 'transfer-dialog ngdialog-theme-default',
                controller: 'ConfirmTransferController',
                controllerAs: 'vm',
                scope: $scope,
                data: {
                    confirmType: 'bid',
                    bidId: bid.id,
                    bid: bid,
                    footballersForDropHash: offeredFootballers,
                    footballersForAddHash: requestedFootballers,
                    moneyOffered: bid['money_offered'],
                    acceptor: bid['acceptor_club'],
                    offerer: bid['offerer_club'],
                    leagueId: bid['acceptor_club']['league_id'],
                    afterTransfer: function() {
                        bid.status = 'accepted';
                    }
                }
            });
        }

        function rejectBidDialog(bid) {
            ngDialog.open({
                template: 'app/directives/confirmation/confirmation_dialog.html',
                className: 'player-card ngdialog-theme-default confirmation-dialog',
                controller: 'GlobalConfirmationDialogController',
                controllerAs: 'vm',
                data: {
                    title: 'Reject offer?',
                    text: 'Are you sure you wish to reject this offer?',
                    confirm: {
                        buttonTitle: 'Reject',
                        action: function () {
                            rejectBidRequest(bid);
                        }
                    },
                    cancel: {
                        buttonTitle: 'Cancel',
                        action: angular.noop
                    },
                    counterOffer: {
                        buttonTitle: 'Make Counter',
                        action: function() {
                            ngDialog.close();
                            makeCounterOffer(bid);
                        }
                    }
                }
            });
        }

        function rejectBidRequest(bid) {
            BidModel.api.rejectBid(bid.id).then(function(data) {
                bid.status = 'rejected';
            });
        }

        function deleteOneWaiverBidDialog(bid) {
            ngDialog.open({
                template: 'app/directives/confirmation/confirmation_dialog.html',
                className: 'player-card ngdialog-theme-default confirmation-dialog',
                controller: 'GlobalConfirmationDialogController',
                controllerAs: 'vm',
                data: {
                    title: 'Delete bid?',
                    text: 'Are you sure you wish to delete this bid on waiver?',
                    confirm: {
                        buttonTitle: 'Delete',
                        action: function () {
                            deleteOneWaiverBidRequest(bid);
                        }
                    },
                    cancel: {
                        buttonTitle: 'Cancel',
                        action: angular.noop
                    }
                }
            });
        }

        function deleteOneWaiverBidRequest(bid) {
            requestservice.run('deleteWaiverBid', {
                'id': bid.id
            }).then(function (received) {
                if (received.data.success === 0) {
                    logger.success('Bid was successfully deleted');
                    loadLeagueWaiverBids();
                } else {
                    logger.error(received.data.message);
                }
            });
        }

        function deleteAllWaiverBidsDialog() {
            ngDialog.open({
                template: 'app/directives/confirmation/confirmation_dialog.html',
                className: 'player-card ngdialog-theme-default confirmation-dialog',
                controller: 'GlobalConfirmationDialogController',
                controllerAs: 'vm',
                data: {
                    title: 'Delete all waiver bids?',
                    text: 'Are you sure you wish to delete all your bids on waivers?',
                    confirm: {
                        buttonTitle: 'Delete all',
                        action: function () {
                            vm.model.waiverBids.forEach(function(bid) {
                                deleteOneWaiverBidRequest(bid);
                            });
                        }
                    },
                    cancel: {
                        buttonTitle: 'Cancel',
                        action: angular.noop
                    }
                }
            });
        }

        function makeTeamToTeamTransfer() {
            ngDialog.open({
                template: 'app/transfers/team_to_team_transfer_dialog.html',
                className: 'transfer-dialog ngdialog-theme-default',
                scope: $scope,
                controller: 'TransfersController',
                controllerAs: 'vm',
                data: {
                    dialogType: 'createTransfer',
                    chosenFootballerForAdd: null,
                    chosenPlayerForAdd: null,
                    acceptor: null,
                    offerer: vm.model.commonModel.selectedClub,
                    showClubList: true,
                    counterOffer: {
                        action: false,
                        bidId: null
                    }
                }
            });
        }

        function makeCounterOffer(bid) {
            ngDialog.open({
                template: 'app/transfers/counter_offer_dialog.html',
                className: 'transfer-dialog ngdialog-theme-default',
                scope: $scope,
                controller: 'TransfersController',
                controllerAs: 'vm',
                data: {
                    dialogType: 'createTransfer',
                    chosenFootballerForAdd: null,
                    acceptor: getAcceptor(bid['offerer_club']['id']),
                    offerer: vm.model.commonModel.selectedClub,
                    showClubList: true,
                    counterOffer: {
                        action: true,
                        bid: bid
                    }
                }
            });
        }

        function getAcceptor(acceptorId) {
            var len = vm.model.commonModel.leagueClubs.length;
            for (var i = 0 ; i < len ; i++) {
                if (vm.model.commonModel.leagueClubs[i].id === acceptorId) {
                    return vm.model.commonModel.leagueClubs[i];
                }
            }
        }
    }
})();
