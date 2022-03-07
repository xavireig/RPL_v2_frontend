(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('NewLeagueInviteOwnersController', NewLeagueInviteOwnersController);

    NewLeagueInviteOwnersController.$inject = [
        '$state', 'logger', '$stateParams',
        'gservice', 'requestservice', 'config'
    ];
    /* @ngInject */
    function NewLeagueInviteOwnersController(
        $state, logger, $stateParams,
        gservice, requestservice, config
    ) {
        var vm = this;

        vm.menu = {
            checkEmailsForValid: checkEmailsForValid,
            goNext: goNext,
            copyLinkToClipboard: copyLinkToClipboard
        };

        vm.model = {
            emails: '',
            link : '',
            code: ''
        };

        vm.view = {
            sharedLink: config.domainEndpoint
        };

        activate();

        function activate() {
            getLeagueCode();
        }

        function getLeagueCode() {
            requestservice.run('getLeagueCode', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    vm.model.code = received.data.result;
                    vm.model.link = location.origin + '/league/invite/' + received.data.result + '/link';
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function goNext() {
            $state.go('new_league_checklist', {
                'league_id': $stateParams['league_id'],
                point: '2'
            });
        }

        function checkEmailsForValid() {
            var emailsList = gservice.splitEmailsByComma(vm.model.emails);

            if (emailsList.incorrectEmailsIds.length === 0) {
                if (emailsList.correctEmailsList.length > 0) {
                    inviteOwnersByEmail(emailsList.correctEmailsList);
                } else {
                    logger.error('No emails entered. Please add at least one email to invite someone.');
                }
            } else {
                logger.error('Some entered emails are incorrect. Please check emails format. For example: testemail123@gmail.com');
            }
        }

        function inviteOwnersByEmail(emailsList) {
            return requestservice.run('inviteSomeoneToLeague', {
                'email_arr': emailsList,
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.emails = '';
                    logger.success(
                        'Invites sent! Feel free to send more. You can check ' +
                        'the status of your invites on your league page.'
                    );
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function copyLinkToClipboard() {
            document.getElementById('invitationLink').select();

            try {
                var successful = document.execCommand('copy');

                if (successful) { logger.success('The link was successfully copied'); }
                else { logger.info('Failed to copy link. Please use Ctrl + C combination'); }
            } catch (err) {
                logger.info('Failed to copy link. Please use Ctrl + C combination');
            }
        }
    }
})();
