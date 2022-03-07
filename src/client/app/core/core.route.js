(function () {
    'use strict';

    angular
        .module('app.core')
        .run(appRun);

    /* @ngInject */
    function appRun(
        routerHelper, $urlRouter, $rootScope, ngDialog,
        UserModel, authservice, $state, $timeout
    ) {
        var otherwise = '/404';
        routerHelper.configureStates(getStates(), otherwise);

        // (function (d) {
        //     // load the Facebook javascript SDK

        //     var js,
        //         id = 'facebook-jssdk',
        //         ref = d.getElementsByTagName('script')[0];

        //     if (d.getElementById(id)) {
        //         return;
        //     }

        //     js = d.createElement('script');
        //     js.id = id;
        //     js.async = true;
        //     js.src = '//connect.facebook.net/en_US/sdk.js' +
        //         '#xfbml=1&version=v2.4&appId=933423210029516'; // all.js (deprecated)

        //     ref.parentNode.insertBefore(js, ref);

        // }(document));

        $rootScope.$on('$stateChangeStart', function (
            evt, toState, toParams, fromState, fromParams
        ) {
            console.log('-------------- UserModel data is ');
            console.log(UserModel);
            if (!UserModel.isSignedIn) {
                UserModel.load();
                if (shouldBeCheckedAccess(toState)) {
                    if (!UserModel.isAuthChecked) {
                        if (toState.name !== '404' && !toState.settings.noLogin) {
                            evt.preventDefault();
                            return authservice.routeAuth(
                                toState, toParams, fromState, fromParams
                            );
                        } else if (toState.name === 'home') {
                            evt.preventDefault();
                            return authservice.routeAuth(
                                toState, toParams, fromState, fromParams
                            );
                        }
                    }
                }
            } else {
                console.log('//----------- user is signedin-----------///');
                showTrailEndNotice(UserModel, ngDialog);
                showUpgradeNowNotice(UserModel, ngDialog);
            }
        });
    }

    function shouldBeCheckedAccess(toState) {
        return (toState.toState !== 'new_club_form_without_user_signed_up' && toState.name !== 'signup');
    }

    function getStates() {
        return [
            {
                state: '404',
                config: {
                    url: '/404',
                    templateUrl: 'app/core/404.html',
                    title: '404'
                }
            },
            {
                state: 'public',
                config: {
                    url: '/public/*',
                    templateUrl: 'app//public/*',
                    title: '404'
                }
            },
            {
                state: 'style-guide',
                config: {
                    url: '/style-guide',
                    templateUrl: 'example.html',
                    title: 'example',
                    settings: {
                        noLogin: true
                    }
                }
            }
        ];
    }

    function showTrailEndNotice(UserModel, ngDialog) {
        if (!UserModel.isTrailEndNotice()) {
            return true;
        }

        // show subscription modal is no subscription
        ngDialog.open({
            templateUrl: 'app/subscription-notices/trial_ending_modal.html',
            className: 'sub-notice-modal trial-modal'
        });
    }

    function showUpgradeNowNotice(UserModel, ngDialog) {
        if (UserModel.data.subscription.isActive && UserModel.data.subscription.endDate < Date.now()) {
            console.log('within if');
            ngDialog.open({
                templateUrl: 'app/subscription-notices/upgrade_now_modal.html',
                className: 'sub-notice-modal upgrade-now-modal'
            });
        }
    }

})();
