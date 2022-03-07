(function () {
    'use strict';

    angular
        .module('app.core')
        .controller('CommercialController', CommercialController);

    CommercialController.$inject = ['UserModel', 'requestservice', 'SubscriptionService'];
    /* @ngInject */
    function CommercialController(UserModel, requestservice, SubscriptionService) {
        var vm = this;
        
        vm.model = {
            user: UserModel,
        }

        vm.menu = {
            createSubscription: SubscriptionService.createSubscription
        };

        vm.view = {
            showAds: showAds,
            showUpgradeNow: showUpgradeNow,
        };

        activate();

        function activate() {
            if (UserModel.subscription.statusIdentified) {
                return;
            }

            return requestservice.run('getUserSubscriptionStatus', {})
                .then(function (received) {
                    if (received.data.success === 0) {
                        UserModel.subscription.statusIdentified = true;
                        UserModel.subscription.statusPrepaid = received.data.result.prepaid;
                        console.log('UserModel.subscription');
                        console.log(UserModel.subscription);
                    }
                    return received;
                });

        }

        function showAds() {
            return !vm.model.user.data.subscription.isActive || (vm.model.user.data.subscription.isActive && vm.model.user.data.subscription.isTrial);
        }

        function showUpgradeNow() {
            return !vm.model.user.data.subscription.isActive || (vm.model.user.data.subscription.isActive && vm.model.user.data.subscription.isTrial);
        }
    }
})();
