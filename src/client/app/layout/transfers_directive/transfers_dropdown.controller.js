(function () {
    'use strict';

    angular
        .module('app.layout')
        .controller('TransfersDropdownController', TransfersDropdownController);

    TransfersDropdownController.$inject = ['requestservice', '$state', '$stateParams', 'CommonModel'];
    /* @ngInject */
    function TransfersDropdownController(requestservice, $state, $stateParams, CommonModel) {
        var vm = this;

        vm.menu = {
            markNotificationViewed: markNotificationViewed,
            goToTransfersPage: goToTransfersPage
        };

        vm.model = {
            transferNotifications: [],
            commonModel: CommonModel
        };

        vm.view = {
            noTransfers: noTransfers
        };

        activate();

        function activate() {
            getTransferNotifications();
        }

        function getTransferNotifications() {
            requestservice.run('getNotifications', {
                filter: 'transfer',
                'league_id': $stateParams['league_id']
            }).then(function (received) {
                if (received.data.success === 0) {
                    vm.model.transferNotifications = received.data.result;
                    console.log('vm.model.transferNotifications');
                    console.log(vm.model.transferNotifications);
                }
            });
        }

        function markNotificationViewed(event, notification) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();

            requestservice.run('markNotificationViewed', {
                id: notification.id
            }).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    getTransferNotifications();
                }
            });
        }

        function goToTransfersPage() {
            $state.go('transfers_page', {
                'league_id': vm.model.commonModel.selectedClub['league_id'] || $stateParams['league_id'],
                'club_id': vm.model.commonModel.selectedClub.id || $stateParams['club_id']
            });
        }

        function noTransfers() {
            return vm.model.transferNotifications.length === 0;
        }
    }
})();
