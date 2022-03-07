(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('SquadSettingsController', SquadSettingsController);

    SquadSettingsController.$inject = ['requestservice', 'CommonModel', '$stateParams', 'logger', '$window', 'config', 'LeagueSettingsModel'];
    /* @ngInject */
    function SquadSettingsController(requestservice, CommonModel, $stateParams, logger, $window, config, LeagueSettingsModel) {
        var vm = this;

        vm.menu = {
            saveSquadSettings: saveSquadSettings,
            restoreDefaults: restoreDefaults,
            defenceTypeChanged: defenceTypeChanged,
            goToHelpPage: goToHelpPage,
            showComingSoon: showComingSoon
        };

        vm.model = {
            league: {},
            leagueFormations: [],
            positionsLimits: {},
            autoSubs: true,
            squadSize: 0,
            teamDefence: false,
            commonModel: CommonModel
        };

        activate();

        function activate() {
            getLeagueInfo();
            console.log('vm.model.commonModel');
        }

        function getLeagueInfo() {
            return requestservice.run('leagueWithFormations', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    vm.model.league = received.data.result;
                    vm.model.leagueFormations = vm.model.league['league_settings_formations'];

                    vm.model.autoSubs = vm.model.league['auto_subs'];
                    vm.model.squadSize = vm.model.league['squad_size'];
                    vm.model.teamDefence = vm.model.league['team_defence'];
                }
                return received;
            });
        }

        function parsePositionLimits(positions) {
            positions.forEach(function(position) {
                vm.model.positionsLimits[position.position] = position;
            });
            console.log(vm.model.positionsLimits);
        }

        function showComingSoon() {
            logger.info('Coming Soon');
        }

        function noneOfFormationsSelected() {
            var allowedFlag = false;
            vm.model.leagueFormations.every(function(formation) {
                allowedFlag = formation.allowed;
                return !allowedFlag;
            });
            return !allowedFlag;
        }

        function saveSquadSettings() {
            if (noneOfFormationsSelected()) {
                logger.error('Please, select at least one of formations');
                return;
            }
            var positionLimitsArray = Object.keys(vm.model.positionsLimits).map(function(key) {return vm.model.positionsLimits[key];});
            if (vm.model.squadSize > 20 || vm.model.squadSize < 14) {
                logger.error('Please, select a squad size between 14 to 20');
                return;
            }
            // return requestservice.run('setSquadSettings', {
            //     'url_params': {
            //         ':league_id': $stateParams['league_id']
            //     },
            //     formations: vm.model.leagueFormations,
            //     'position_limits': positionLimitsArray,
            //     'auto_subs': vm.model.autoSubs,
            //     'team_defence': vm.model.teamDefence
            // }).then(function (received) {
            //     if (received.data.success === 0) {
            //         logger.success('Squad settings successfully saved');
            //     } else {
            //         logger.error(received.data.message);
            //     }
            //     return received;
            // });

            LeagueSettingsModel.api.saveLeagueSettings({
                'settings_for_saving': ['formation_settings', 'squad_settings'],
                formations: vm.model.leagueFormations,
                'position_limits': positionLimitsArray,
                'auto_subs': vm.model.autoSubs,
                'team_defence': vm.model.teamDefence,
                'squad_size': vm.model.squadSize,
            }, 'Squad');
        }

        function restoreDefaults() {
            vm.model.autoSubs = true;
            vm.model.squadSize = 17;
            vm.model.teamDefence = false;

            vm.model.leagueFormations.forEach(function(formation) {
                formation.allowed = formation['formation'] !== 'f343';
            });
        }

        function defenceTypeChanged() {
            if (vm.model.teamDefence) {
                vm.model.leagueFormations.forEach(function(formation) {
                    if (formation.formation === 'f352' || formation.formation === 'f343') {
                        formation.allowed = false;
                    }
                });

                vm.model.positionsLimits['squad']['max'] = vm.model.positionsLimits['squad']['min'] = 11;

                vm.model.positionsLimits['team_defence'] = {};
                vm.model.positionsLimits['team_defence']['max'] = 2;
                vm.model.positionsLimits['team_defence']['min'] = 1;

                vm.model.positionsLimits['forward']['min'] = 2;
                vm.model.positionsLimits['forward']['max'] = 4;
                vm.model.positionsLimits['midfielder']['min'] = 4;
                vm.model.positionsLimits['midfielder']['max'] = 6;
            } else {
                vm.model.positionsLimits['squad']['max'] = vm.model.positionsLimits['squad']['min'] = 17;

                vm.model.positionsLimits['forward']['min'] = 1;
                vm.model.positionsLimits['forward']['max'] = 1;
                vm.model.positionsLimits['midfielder']['min'] = 4;
                vm.model.positionsLimits['midfielder']['max'] = 4;
            }
        }

        function goToHelpPage() {
            $window.open(config.protocol + '://' + config.domainEndpoint + config.portEndpoint + '/help' + '#faq', '_blank');
        }

    }
})();
