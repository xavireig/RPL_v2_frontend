(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('NewLeagueChecklistController', NewLeagueChecklistController);

    NewLeagueChecklistController.$inject = ['$q', '$state', 'logger', 'LeagueModel', '$stateParams', 'requestservice'];
    /* @ngInject */
    function NewLeagueChecklistController($q, $state, logger, LeagueModel, $stateParams, requestservice) {
        var vm = this;

        vm.menu = {
            goInviteOwners: goInviteOwners,
            goLeague: goLeague,
            gotoLeagueSettings: gotoLeagueSettings,
            goToPublicListing: goToPublicListing
        };

        vm.model = {
            league: LeagueModel,
            params: $stateParams
        };

        activate();

        function activate() {
            $q.all([leagueInfo()]).then(function () { });
        }

        function goLeague() {
            $state.go('dashboard', {
                'league_id': $stateParams['league_id']
            });
        }

        function goInviteOwners() {
            $state.go('new_league_invite_owners', {'league_id': $stateParams['league_id']});
        }

        function gotoLeagueSettings() {
            $state.go('league_settings', {
                'league_id': $stateParams['league_id']
            });
        }

        function goToPublicListing() {
            $state.go('public_listing', {
                'league_id': $stateParams['league_id']
            });
        }

        function leagueInfo() {
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
    }
})();
