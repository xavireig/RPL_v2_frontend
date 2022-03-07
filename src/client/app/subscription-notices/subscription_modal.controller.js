(function () {
    'use strict';

    angular
        .module('app.auth')
        .controller('SubscriptionModalController', SubscriptionModalController);

    SubscriptionModalController.$inject = [
        '$q', 'authservice', 'UserModel', 'ngDialog',
        'logger', '$state', 'fbservice',  '$scope', '$rootScope', 'SubscriptionService',
        'CommonModel', '$localStorage', '$base64', 'requestservice', 'moment'
    ];
    /* @ngInject */
    function SubscriptionModalController(
        $q, authservice, UserModel, ngDialog,
        logger, $state, fbservice, $scope, $rootScope, SubscriptionService,
        CommonModel, $localStorage, $base64, requestservice, moment
    ) {
        var vm = this;
        vm.model = {
            commonModel: CommonModel,
        };

        vm.tryUsFree = function() {
            // $rootScope.$broadcast('goSignUp', 'app/auth/signup.html');
            joinLeagueDialog();
            requestservice.run('startTrial', {
                'url_params': {
                    ':user_id': UserModel.data.id,
                }
            }).then(function (result) {
                var data = {};
                data['data'] = {};
                data['data']['result'] = {};
                data['data']['result']['subscription'] = {};

                data['data']['result']['subscription'] = {
                    'isTrial': result.data.isTrial,
                    'end_date': result.data['end_date']
                };

                UserModel.parseSubscription(data);
                UserModel.save();
            });
        };

        vm.payNow = function (preSelectedSubscription) {
            ngDialog.closeAll();
            SubscriptionService.createSubscription(preSelectedSubscription);
        };

        function joinLeagueDialog() {
            ngDialog.closeAll();
            if (vm.model.commonModel.selectedClub['league_id'] === null) {
                ngDialog.open({
                    templateUrl: 'app/league/after_club_create_options.html',
                    className: 'player-card ngdialog-theme-default confirmation-dialog confirm-revoke-dialog',
                    controllerAs: vm,
                    data: vm.model.commonModel.selectedClub
                });
            }
        }
    }
})();
