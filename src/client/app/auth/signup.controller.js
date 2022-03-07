(function () {
    'use strict';

    angular
        .module('app.auth')
        .controller('SignUpController', SignUpController);

    SignUpController.$inject = [
        '$q', 'authservice', 'UserModel',
        'logger', '$state', 'fbservice',
        '$stateParams', 'requestservice', '$localStorage', '$base64', 'moment', '$location', '$rootScope',
        'ngDialog', '$scope'
    ];
    /* @ngInject */
    function SignUpController(
        $q, authservice, UserModel,
        logger, $state, fbservice,
        $stateParams, requestservice, $localStorage, $base64, moment, $location, $rootScope,
        ngDialog, $scope
    ) {
        var vm = this;

        vm.menu = {
            goSignIn: goSignIn,
            goPrivacyPolicy: goPrivacyPolicy,
            goTermsOfConditions: goTermsOfConditions,
            keyUp: keyUp,
            closeDialog: closeDialog
        };

        vm.form = {
            data: {
                user: {
                    fname: '',
                    lname: '',
                    email: $stateParams['email'],
                    password: '',
                    checkboxValue: '',
                    provider: 'base'
                },
                club: ''
            },
            submit: signUp,
            facebookClick: facebookClick,
        };

        activate();

        function activate() {
            //TODO: Temporary advertisement blocking
            takeAndSaveSubscription();
        }

        function takeAndSaveSubscription() {
            var paid = $location.$$search['paid'];
            if (paid !== 'false') {
                $localStorage.showSubscriptionDialog = paid;
            }
        }

        function keyUp($event) {
            if ($event.which === 13) {
                signUp();
            }
        }

        function goSignIn() {
            $rootScope.$broadcast('goSignIn', 'app/auth/signin.html');
        }

        function goPrivacyPolicy() {
            $state.go('privacy-policy', {referer: 'signup'});
        }

        function goTermsOfConditions() {
            $state.go('terms-of-conditions', {referer: 'signup'});
        }

        function signUp() {
            vm.form.data.user.provider = 'base';
            signUpProcess();
        }

        function facebookClick() {
            fbservice.signIn(function(data) {
                vm.form.data.user = {
                    'provider': 'fc',
                    'email': data['email'],
                    'fname': data['first_name'],
                    'lname': data['last_name'],
                    'fc_user_id': UserModel['fbUserId'],
                    'fc_user_token': UserModel['fbAccessToken']
                };

                signUpProcess();
            });
        }

        /* private functions */

        function signUpProcess() {
            vm.form.data.club = $rootScope.club;
            vm.form.data['local_time'] = moment().format('YYYY-MM-DDTHH:mm:ssZZ');
            return authservice.signUp(vm.form.data).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    UserModel.parse(received);
                    console.log(UserModel.data);
                    ngDialog.closeAll();
                    logger.success('Your club "' + vm.form.data.club.name + '" was created!');
                    $state.go('home');
                    var email = vm.form.data.user.email;
                    ngDialog.open({
                        template: 'app/auth/signup_confirmation.html',
                        className: 'player-card ngdialog-theme-default confirmation-dialog confirm-revoke-dialog',
                        // scope: emailScope
                        data: email
                    });
                } else {
                    logger.error(received.data.message);
                    $state.go('new_club_form');
                }
                // return received;
            });
        }

        function createClubAfterSignUp() {
            var clubInstance = '';
            if (typeof $localStorage.newClub !== 'undefined' && $localStorage.userCache !== null) {
                try {
                    /*global escape: true */
                    clubInstance = JSON.parse(decodeURIComponent(escape($base64.decode($localStorage.newClub))));
                    delete $localStorage.newClub;
                } catch (err) {
                    $state.go('dashboard');
                    return;
                }
            } else {
                clubInstance = JSON.parse(vm.model.clubs.one);
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
                        $state.go('dashboard');
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
                        $state.go('dashboard');
                    }
                }
                return received;
            });
        }

        function closeDialog() {
            ngDialog.closeAll();
        }
    }
})();
