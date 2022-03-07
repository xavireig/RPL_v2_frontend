(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('LeagueSettingsController', LeagueSettingsController);

    LeagueSettingsController.$inject = [
        '$state', '$stateParams', 'LeagueSettingsModel'
    ];
    /* @ngInject */
    function LeagueSettingsController(
        $state, $stateParams, LeagueSettingsModel
    ) {
        var vm = this;

        vm.menu = {
            currentSettings: $stateParams.settingsTab,
            showSelectedSettings: showSelectedSettings,
            returnCurrentSettingsTitleStyle: returnCurrentSettingsTitleStyle,
            goLeague: goLeague
        };

        vm.model = {
            leagueSettingsModel: LeagueSettingsModel
        };

        activate();

        function activate() {

        }

        function returnCurrentSettingsTitleStyle(settingName) {
            return {
                'active': settingName === vm.menu.currentSettings
            };
        }

        function showSelectedSettings(settingName) {
            vm.menu.currentSettings = settingName;
        }

        function goLeague() {
            if (vm.model.leagueSettingsModel.recalcInProcess) {
                return;
            }
            $state.go('main_league', {
                'league_id': $stateParams['league_id']
            });
        }
    }
})();

