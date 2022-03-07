(function () {
    'use strict';

    angular
        .module('app.club')
        .controller('FixtureListController', FixtureListController);

    FixtureListController.$inject = ['requestservice', '$stateParams', '$timeout', '$', '$state'];
    /* @ngInject */
    function FixtureListController(requestservice, $stateParams, $timeout, $, $state) {
        var vm = this;

        vm.menu = {
            getMoveMatchDay: getMoveMatchDay
        };

        vm.model = {
            fixtures: []
        };

        activate();

        function activate() {
            getClubFixturesResults();
        }

        function getClubFixturesResults() {
            var currentStateName = $state.current.name;
            return requestservice.run('getClubFixturesResults', {
                'url_params': {
                    ':club_id': $stateParams['club_id']
                }
            }).then(function (received) {
                console.log('Club Result');
                console.log(received);
                if (received.data.success === 0 && $state.current.name === currentStateName) {
                    vm.model.fixtures = received.data.result;
                    $timeout(function() {
                        var container = $('#match_list');
                        var lastClosedRound = container.find('.round-done:last');
                        if (container[0] && lastClosedRound[0]) {
                            container.animate({
                                scrollTop: lastClosedRound.offset().top - container.offset().top + container.scrollTop()
                            });
                        }
                    }, 0);
                }
                return received;
            });
        }

        function getMoveMatchDay(gameId, gameWeek) {
            $state.go('match_day', {
                'league_id': $stateParams['league_id'],
                'club_id': $stateParams['club_id'],
                'round_week_num': gameWeek,
                'game_id': gameId
            });
        }
    }
})();
