(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('FixturesSettingsController', FixturesSettingsController);

    FixturesSettingsController.$inject = ['requestservice', '$stateParams', 'logger', 'LeagueSettingsModel'];
    /* @ngInject */
    function FixturesSettingsController(requestservice, $stateParams, logger, LeagueSettingsModel) {
        var vm = this;

        vm.menu = {
            saveFixturesChanges: saveFixturesChanges,
            restoreDefaults: restoreDefaults
        };

        vm.model = {
            league: null
        };

        activate();

        function activate() {
            getLeagueInfo();
        }

        function getLeagueInfo() {
            return requestservice.run('oneLeague', {
                'url_params': {
                    ':id': $stateParams['league_id']
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    vm.model.league = received.data.result;
                }
                return received;
            });
        }

        function saveFixturesChanges() {
            // return requestservice.run('setFixtureSettings', {
            //     'url_params': {
            //         ':league_id': $stateParams['league_id']
            //     },
            //     'double_gameweeks': vm.model.league['double_gameweeks']
            // }).then(function (received) {
            //     if (received.data.success === 0) {
            //         logger.success('Fixture settings successfully saved!');
            //     } else {
            //         logger.error(received.data.message);
            //     }
            //     return received;
            // });
            LeagueSettingsModel.api.saveLeagueSettings({
                'settings_for_saving': ['fixture_settings'],
                'double_gameweeks': vm.model.league['double_gameweeks']
            }, 'Fixture');
        }

        function restoreDefaults() {
            vm.model.league['double_gameweeks'] = false;
        }
    }
})();
