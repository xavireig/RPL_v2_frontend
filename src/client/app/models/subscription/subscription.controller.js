(function () {
    'use strict';

    angular
        .module('app.core')
        .controller('SubscriptionController', SubscriptionController);

    SubscriptionController.$inject = ['$scope', 'SubscriptionService', '$localStorage', 'UserModel', 'config'];
    /* @ngInject */
    function SubscriptionController($scope, SubscriptionService, $localStorage, UserModel, config) {
        var vm = this;

        vm.model = {
            subscriptionService: SubscriptionService,
            selectedSubscription: null,
            agreedToTerms: false,
            subscriptionFeaturesUrl: config.protocol + '://' + config.domainEndpoint + config.portEndpoint + '#Shutupandtakemymoney'
        };

        vm.menu = {
            toggleAgreement: toggleAgreement
        };

        vm.view = {
            userAgreedToTermsAndConditions: userAgreedToTermsAndConditions
        };

        activate();

        function activate() {
            $scope.ngDialogData.subscriptions.forEach(function(subscription) {
                var subscriptionName = $scope.ngDialogData.preSelectedSubscription || $localStorage.showSubscriptionDialog;
                if (subscription.name === subscriptionName) {
                    vm.model.selectedSubscription = subscription;
                }
            });
            vm.model.selectedSubscription = vm.model.selectedSubscription || $scope.ngDialogData.subscriptions[0];

            delete $localStorage.showSubscriptionDialog;
            $scope.$on('$destroy', function () {
                SubscriptionService.dialogStarted = false;
            });

        }

        function toggleAgreement() {
            vm.model.agreedToTerms = !vm.model.agreedToTerms;
        }

        function userAgreedToTermsAndConditions() {
            return vm.model.agreedToTerms;
        }

    }
})();
