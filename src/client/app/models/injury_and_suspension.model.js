(function () {
    'use strict';

    angular
        .module('app.news')
        .factory('InjuryAndSuspensionModel', InjuryAndSuspensionModel);

    InjuryAndSuspensionModel.$inject = ['moment'];
    /* @ngInject */
    function InjuryAndSuspensionModel(moment) {
        var injuryAndSuspensionModel;

        injuryAndSuspensionModel = {
            one: {},
            data: [],
            total: 0,
            paging: {
                'page': 1,
                'per_page': 200
            },
            statuses: {
                'out': {
                    title: 'Out',
                    icon: '/images/player_state_icons/injures.svg'
                },
                'game_time_decision': {
                    title: 'Game Time Decision',
                    icon: '/images/player_state_icons/injures.svg'
                },
                'suspended': {
                    title: 'Suspended',
                    icon: '/images/player_state_icons/red_card_suspended.svg'
                }
            },
            parse: parse,
            clear: clear
        };
        return injuryAndSuspensionModel;

        function parse(data) {
            injuryAndSuspensionModel.data = data.data.result;
            injuryAndSuspensionModel.total = data.data.result.length;
        }

        function clear() {
            injuryAndSuspensionModel.data = [];
            injuryAndSuspensionModel.paging.page = 1;
            injuryAndSuspensionModel.total = 0;
        }
    }
})();
