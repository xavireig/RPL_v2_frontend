(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('BasicSettingsController', BasicSettingsController);

    BasicSettingsController.$inject = ['LeagueModel', 'gservice', 'logger', 'requestservice', 'PromotionsModel', '$stateParams',
        'config', 'CommonModel', 'LeagueSettingsModel'];
    /* @ngInject */
    function BasicSettingsController(LeagueModel, gservice, logger, requestservice, PromotionsModel, $stateParams,
                                     config, CommonModel, LeagueSettingsModel) {
        var vm = this;

        vm.menu = {
            checkEmailsForValid: checkEmailsForValid,
            saveBasics: saveBasics,
            copyLinkToClipboard: copyLinkToClipboard,
            chooseNumberOfTeams: chooseNumberOfTeams,

            selectStartingWeek: selectStartingWeek,
            selectNumberOfMatches: selectNumberOfMatches
        };

        vm.model = {
            commonModel: CommonModel,
            league: LeagueModel,
            emails: '',
            link: '',
            sharedLink: config.domainEndpoint,
            possibleEPLWeeks: [],
            code: ''
        };

        activate();

        function activate() {
            getLeagueInfo();
            getLeagueCode();
            calculatePossibleEPLWeeks();
        }

        function calculatePossibleEPLWeeks() {
            console.log('Common Model');
            console.log(CommonModel);
            vm.model.possibleEPLWeeks = new Array(38 - CommonModel.currentWeekNumber);
        }

        function getLeagueInfo() {
            return requestservice.run('oneLeague', {
                'url_params': {
                    ':id': $stateParams['league_id']
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    console.log('League Basic info');
                    console.log(received);
                    LeagueModel.parseOne(received);
                }
                return received;
            });
        }

        function selectStartingWeek(weekNumber) {
            vm.model.league.one['start_round_num'] = weekNumber;
            vm.model.league.one['num_matches'] = Math.min(vm.model.league.one['num_matches'], 38 - vm.model.league.one['start_round_num'] + 1);
        }

        function selectNumberOfMatches(numberOfMatches) {
            vm.model.league.one['num_matches'] = numberOfMatches;
            vm.model.league.one['start_round_num'] = Math.min(vm.model.league.one['start_round_num'], 38 - vm.model.league.one['num_matches'] + 1);
        }

        function checkEmailsForValid(emails) {
            var emailsList = gservice.splitEmailsByComma(emails);

            if (emailsList.incorrectEmailsIds.length === 0) {
                if (emailsList.correctEmailsList.length > 0) {
                    inviteOwnersByEmail(emailsList.correctEmailsList);
                } else {
                    logger.error('No emails entered. Please add at least one email to invite someone.');
                }
            } else {
                logger.error('Some entered emails is incorrect. Please check emails format. For example: testemail123@gmail.com');
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

        function saveBasics() {
            var settingsArray = [],
                sendingData = {};

            if (PromotionsModel.promotion) {
                settingsArray.push('promotion_settings');
                sendingData['promotion_id'] = PromotionsModel.promotion.id;
                sendingData['enable_status'] = PromotionsModel.promotion.switchPos;
            }

            settingsArray.push('basic_settings');
            sendingData['settings_for_saving'] = settingsArray;
            sendingData.league = vm.model.league.one;

            LeagueSettingsModel.api.saveLeagueSettings(sendingData, 'Basic');

            // savePromotionSwitch();
            // saveLeagueSettings();
        }

        function saveLeagueSettings() {
            requestservice.run('updateLeagueBasics', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                },
                league: vm.model.league.one
            }).then(function(received) {
                if (received.data.success === 0) {
                    logger.success('Basic settings were successfully changed');
                } else {
                    logger.error(received.data.message);
                }
            });
        }

        function savePromotionSwitch() {
            console.log(PromotionsModel);
            if (PromotionsModel.promotion) {
                requestservice.run('changeEnableStatus', {
                    'promotion_id': PromotionsModel.promotion.id,
                    'enable_status': PromotionsModel.promotion.switchPos
                }).then(function(received) {
                    if (received.data.success === 0) {
                        logger.success('Status successfully changed');
                    } else {
                        logger.error(received.data.message);
                    }
                });
            }
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

        function chooseNumberOfTeams(num) {
            vm.model.league.one['req_teams'] = num;
            vm.model.league.one['num_matches'] = generateSeasonLength(num);
            console.log(vm.model.league.one['num_matches']);
            vm.model['max_matches'] = 38 - vm.model.league.one['start_round_num'] + 1;
            if (vm.model['max_matches'] < vm.model.league.one['num_matches']) {
                vm.model.league.one['num_matches'] = vm.model['max_matches'];
            }
        }

        function generateSeasonLength(leagueSize) {
            // need to discuss with client
            // var x = (38 - CommonModel.currentWeekNumber );
            // return Math.floor((x/(leagueSize-1)))*(leagueSize-1);

            return (38 - CommonModel.currentWeekNumber);
        }

    }
})();
