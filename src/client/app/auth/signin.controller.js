(function () {
    'use strict';

    angular
        .module('app.auth')
        .controller('SignInController', SignInController);

    SignInController.$inject = [
        '$q', 'authservice', 'UserModel', 'ngDialog',
        'logger', '$state', 'fbservice',  '$scope', '$rootScope',
        'CommonModel', '$localStorage', '$base64', 'requestservice', 'moment',
        'ActionCableConfig', 'config'
    ];
    /* @ngInject */
    function SignInController(
        $q, authservice, UserModel, ngDialog,
        logger, $state, fbservice, $scope, $rootScope,
        CommonModel, $localStorage, $base64, requestservice, moment,
        ActionCableConfig, config
    ) {
        var vm = this;

        vm.menu = {
            goSignUp: goSignUp,
            goForgotPassword: goForgotPassword,
            keyUp: keyUp,
            getStarted: getStarted
        };

        vm.form = {
            data: {
                user: {
                    email: '',
                    password: '',
                    provider: 'base'
                }
            },
            submit: signIn,
            facebookClick: facebookClick
        };

        activate();

        function activate() {
            // activated SignInController
        }

        function keyUp($event) {
            if ($event.which === 13) {
                signIn();
            }
        }

        function goSignUp() {
            $rootScope.$broadcast('goSignUp', 'app/auth/signup.html');
        }

        function goForgotPassword() {
            console.log('checking state -------------------------');
            console.log($state.is('home'));
            if($state.is('home')){
                $rootScope.$broadcast('goForgotPassword', 'app/auth/forgot_password.html');
            }
            else {
                $state.go('forgot_password');
            }
        }

        function signIn() {
            vm.form.data.user.provider = 'base';
            signInProcess();
        }

        function facebookClick() {
            fbservice.signIn(function(data) {
                vm.form.data.user = {
                    'provider': 'fc',
                    'fc_user_id': UserModel['fbUserId'],
                    'fc_user_token': UserModel['fbAccessToken']
                };

                signInProcess();
            });
        }

        function signInProcess() {
            vm.form.data['local_time'] = moment().format('YYYY-MM-DDTHH:mm:ssZZ');
            return authservice.signIn(vm.form.data).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    ngDialog.closeAll();
                    CommonModel.selectedClub = {};
                    UserModel.parse(received);
                    console.log(UserModel.data);
                    // createClubAfterSignIn();
                    ActionCableConfig.wsUri = config.actionCableUrl + '/cable?token=' + UserModel.data['auth_token'];
                    $state.go('dashboard', {
                        redirectedFromSignin: true,
                    });
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function createClubAfterSignIn() {
            var clubInstance = '';
            if (typeof $localStorage.newClub !== 'undefined' && $localStorage.userCache !== null) {
                try {
                    /*global escape: true */
                    clubInstance = JSON.parse(decodeURIComponent(escape($base64.decode($localStorage.newClub))));
                    delete $localStorage.newClub;
                } catch (err) {
                    $state.go('main_league');
                    return;
                }
            }
            if (!clubInstance) {
                $state.go('dashboard');
                return;
            }
            return requestservice.run('createClub', {
                club: clubInstance
            }).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    logger.success('Your club "' + clubInstance.name + '" was created!');
                    var createdClubId = received.data.result.id;
                    if (clubInstance['league_id']) {
                        acceptLeagueInvite(createdClubId, clubInstance['league_id']);
                    } else {
                        $state.go('main_league');
                    }
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function acceptLeagueInvite(clubId, leagueId) {
            requestservice.run('acceptInvitation', {
                'url_params': {
                    ':league_id': leagueId,
                    ':club_id': clubId
                }
            }).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    if (received.data.result.league['user_id'].toString() === UserModel.data.id.toString()) {
                        $state.go('new_league_checklist', {'league_id': leagueId});
                    } else {
                        $state.go('main_league');
                    }
                }
                return received;
            });
        }

        function getStarted() {
            ngDialog.closeAll();
            $state.go('new_club_form');
        }
    }
})();
