(function () {
    'use strict';

    angular
        .module('app.core', [
            'ngAnimate', 'ngSanitize',
            'blocks.exception', 'blocks.logger', 'blocks.router',
            'ui.router', 'ngplus', 'base64', 'ngStorage', 'ui.mask',
            'ngMaterial', 'ngFacebook', 'ui.bootstrap',
            'luegg.directives', 'jqueryModule', 'ngDialog', 'uiSwitch', 'datatables',
            'FayeClientWrapper', 'ui.tree', 'ngDfp', 'ngActionCable', 'angular-clipboard'
        ])
        .config(function($mdThemingProvider) {
            $mdThemingProvider.theme('md-draft-theme');
            $mdThemingProvider.alwaysWatchTheme(true);
        })
        .config(function (DoubleClickProvider) {
            DoubleClickProvider
                .defineSlot('/45285806/RPL_Footer_728x90', [728, 90], 'div-gpt-ad-1475081669507-0')
                .defineSlot('/45285806/RPL_Leaderboard_728x90', [728, 90], 'div-gpt-ad-1475081736741-0')
                .defineSlot('/45285806/RPL_LeftRail_160x600', [160, 600], 'div-gpt-ad-1475081850362-0')
                .defineSlot('/45285806/RPL_RightRail_300x250', [300, 250], 'div-gpt-ad-1475081907262-0');
        })
        .run(['requestservice', 'CommonModel', function(requestservice, CommonModel) {
            getCurrentWeekNumber();
            getCurrentSeason();

            function getCurrentWeekNumber() {
                return requestservice.run('getCurrentWeekNumber', {
                }).then(function (received) {
                    console.log('currentWeek Number');
                    console.log(received);
                    if (received.data.success === 0) {
                        CommonModel.currentWeekNumber = received.data.result;
                    }
                    return received;
                });
            }

            function getCurrentSeason() {
                requestservice.run('getCurrentSeason', {
                }).then(function(received) {
                    if (received.data.success === 0) {
                        CommonModel.currentSeason = received.data.result;
                        console.log('CommonModel.currentSeason');
                        console.log(CommonModel.currentSeason);
                    }
                });
            }
        }]);
})();
