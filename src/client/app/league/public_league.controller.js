(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('PublicLeagueController', PublicLeagueController);

    PublicLeagueController.$inject = ['$rootScope', '$state', 'requestservice', 'clipboard',
    'logger', 'ngDialog', 'LeagueModel', 'ngTableParams', '$filter', '$q', '$stateParams'
    ];
    /* @ngInject */
    function PublicLeagueController($rootScope, $state, requestservice, clipboard,
    logger, ngDialog, LeagueModel, ngTableParams, $filter, $q, $stateParams) {
        var vm = this;

        vm.menu = {
            getPublicLeagues: getPublicLeagues,
            joinPublicLeague: joinPublicLeague,
            createPublicLeague: createPublicLeague
        };

        vm.model = {
            league: '',
            publicLeagues: [],
        };

        activate();

        function activate() {
            return $q.all(getPublicLeagues()).then(function () {

            });
        }

        function getPublicLeagues() {
            return requestservice.run('getPublicLeagues', {
            }).then(function (received) {
                if (received.data.success === 0) {
                    vm.model.publicLeagues = received.data.result;
                    vm.tableData = [];
                    for (var i = 0; i < vm.model.publicLeagues.length; i++) {
                        vm.tableData.push({
                            'title': vm.model.publicLeagues[i]['title'],
                            'description': vm.model.publicLeagues[i]['description'],
                            'num_teams': vm.model.publicLeagues[i]['num_teams'],
                            'req_teams': vm.model.publicLeagues[i]['req_teams'],
                            'league_scoring_type': vm.model.publicLeagues[i]['league_scoring_type'],
                            'draft_time': vm.model.publicLeagues[i]['draft_time'],
                            'invite_code': vm.model.publicLeagues[i]['invite_code']
                        });
                    }
                    vm.tableParams = new ngTableParams (
                    {},
                    {
                        filterDelay: 0,
                        getData: function($defer, params) {
                            var orderedData = params.sorting() ?
                                $filter('orderBy')(vm.tableData, params.orderBy()) :
                                vm.tableData;
                            $defer.resolve(orderedData);
                        }
                    }
                );
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function joinPublicLeague(league) {
            console.log($stateParams.redirectedFromClub);
            if ($stateParams.redirectedFromClub) {
                $state.go('new_league_invite_link', {'league_code': league['invite_code'], redirectedFromClub: $stateParams.redirectedFromClub});
            } else {
                $state.go('new_league_invite_link', {'league_code': league['invite_code']});
            }
        }

        function createPublicLeague() {
            ngDialog.open({
                templateUrl: 'app/league/choose_league_type.html',
                className: 'player-card ngdialog-theme-default confirm-revoke-dialog custom-border custom-padding custom-height custom-alignment custom-width-800',
                controller: 'LeagueJoinDialogController',
                controllerAs: vm,
            });
        }
    }

})();
