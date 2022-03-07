(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('SubscriptionService', SubscriptionService);

    SubscriptionService.$inject = ['requestservice', 'logger', 'ngDialog'];
    /* @ngInject */
    function SubscriptionService(requestservice, logger, ngDialog) {
        var subscription;

        subscription = {
            dialogStarted: false,
            subscriptions: [],
            clientToken: '',
            preSelected: null,
            createSubscription: getSubscriptions,
            subscriptionDetails: {
                premier: {description: '/ league'},
                pro: {description: '/ season'}
            }
        };

        return subscription;

        function getSubscriptions(subscriptionName) {
            if (subscription.dialogStarted) {
                return;
            }
            subscription.dialogStarted = true;
            subscription.preSelected = subscriptionName;
            return requestservice.run('getSubscriptions', {})
                .then(function (received) {
                    if (received.data.success === 0) {
                        subscription.subscriptions = received.data.result;
                        getClientToken(openDialog);
                    } else {
                        logger.error(received.data.message);
                    }
                    return received;
                });
        }

        function getClientToken(callback) {
            return requestservice.run('getClientToken', {})
                .then(function (received) {
                    if (received.data.success === 0) {
                        subscription.clientToken = received.data.result;
                        callback();
                    } else {
                        logger.error(received.data.message);
                    }
                    return received;
                });
        }

        function openDialog() {
            ngDialog.open({
                template: 'app/models/subscription/subscription.template.html',
                className: 'subscription-dialog ngdialog-theme-default',
                showClose: false,
                controller: 'SubscriptionController',
                controllerAs: 'vm',
                data: {
                    subscriptions: subscription.subscriptions,
                    token: subscription.clientToken,
                    preSelectedSubscription: subscription.preSelected,
                }
            });
        }
    }
})
();
