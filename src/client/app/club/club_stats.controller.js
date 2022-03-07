(function () {
    'use strict';

    angular
        .module('app.club')
        .controller('ClubStatsController', ClubStatsController);

    ClubStatsController.$inject = ['StatIconsModel', 'requestservice', '$stateParams', '$state'];
    /* @ngInject */
    function ClubStatsController(StatIconsModel, requestservice, $stateParams, $state) {
        var vm = this;

        var clearStats = StatIconsModel.clubStats;

        vm.menu = {
            clickStatsLast: clickStatsLast,
            getActiveStatsClass: getActiveStatsClass,
            goLeague: goLeague
        };

        vm.model = {
            'stats_active': 'three',
            'stats_value': JSON.parse(JSON.stringify(clearStats)),
            stats: {
                three: {
                    title: 'LAST 3',
                    stateName: 'three',
                    form: 3
                },
                six: {
                    title: 'LAST 6',
                    stateName: 'six',
                    form: 6
                },
                season: {
                    title: 'SEASON',
                    stateName: 'season',
                    form: 40
                }
            },
            leagueScoringType: {},
            leaguePointsByPositions: {
                defender: {},
                forward: {},
                goalkeeper: {},
                midfielder: {}
            }
        };

        vm.view = {
            showStatColumn: showStatColumn
        };

        activate();

        function activate() {
            getScoringTypeData($stateParams['league_id']);
            clickStatsLast({stateName: 'season'});
        }

        function clickStatsLast(stats) {
            vm.model['stats_active'] = stats.stateName;
            getStatsLast();
        }

        function getScoringTypeData(leagueId) {
            return requestservice.run('getCategoriesData', {
                'url_params': {
                    ':league_id': leagueId
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    vm.model.leagueScoringType = received.data.result;
                    console.log(' ==== vm.model.leagueScoringType ==== ');
                    if (vm.model.leagueScoringType['league_sco_type']['scoring_type'] === 'point') {
                        parsePointsByPositions(vm.model.leagueScoringType['league_sco_points']);
                    }
                    console.log(vm.model.leagueScoringType);
                }
                return received;
            });
        }

        function parsePointsByPositions(pointValuesArray) {
            pointValuesArray.forEach(function (pointValuesHash) {
                vm.model.leaguePointsByPositions[pointValuesHash['position']] = pointValuesHash;
            });
            console.log('+++ vm.model.leaguePointsByPositions +++');
            console.log(vm.model.leaguePointsByPositions);
        }

        function getActiveStatsClass(stats) {
            return {
                'active': vm.model['stats_active'] === stats.stateName
            };
        }

        function getStatsLast() {
            return requestservice.run('getClubStats', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                },
                'club_id': $stateParams['club_id'],
                'form': vm.model.stats[vm.model['stats_active']].form
            }).then(function (received) {
                if (received.data.success === 0) {
                    vm.model['stats_value'] = JSON.parse(JSON.stringify(clearStats));
                    vm.model['stats_value'].forEach(function (stats) {
                        received.data.result['all_clubs'].forEach(function (clubstat) {
                            stats.max = stats.max < parseFloat(clubstat[stats.parameter]) || stats.max === null ? clubstat[stats.parameter] : stats.max;
                            stats.min = stats.min > parseFloat(clubstat[stats.parameter]) || stats.min === null ? clubstat[stats.parameter] : stats.min;
                        });
                        stats.cur = received.data.result['my_club'][stats.parameter];
                        if (stats.max !== stats.min) {
                            stats.svg = Math.floor(parseFloat((stats.cur - stats.min) / (stats.max - stats.min)) * 10);
                        }
                    });
                }
                return received;
            });
        }

        function showStatColumn(icon) {
            var result = false;
            if (leagueScoringTypeIsPoints()) {
                result = showPointLegendIcon(icon);
            }
            if (leagueScoringTypeIsCategories()) {
                result = showLegendIcon(icon);
            }
            return result;
        }

        function showLegendIcon(icon) {
            var result = false;
            if (!icon['catsAffected'] || icon['catsAffected'].length === 0) {
                result = true;
            } else {
                icon['catsAffected'].forEach(function (category) {
                    result = result || vm.model.leagueScoringType['league_sco_cat'][category];
                });
            }
            return result;
        }

        function showPointLegendIcon(icon) {
            var result = false;
            if (!icon['pointAffected'] || icon['pointAffected'].length === 0) {
                result = true;
            } else {
                icon['pointAffected'].forEach(function (category) {
                    vm.model.leagueScoringType['league_sco_points'].forEach(function (hash) {
                        result = result || parseFloat(hash[category]) !== 0;
                    });
                });
            }
            return result;
        }

        function leagueScoringTypeIsPoints() {
            return vm.model.leagueScoringType['league_sco_type'] && vm.model.leagueScoringType['league_sco_type']['scoring_type'] === 'point';
        }

        function leagueScoringTypeIsCategories() {
            return vm.model.leagueScoringType['league_sco_type'] && vm.model.leagueScoringType['league_sco_type']['scoring_type'] === 'category';
        }

        function goLeague() {
            $state.go('main_league', {
                'league_id': $stateParams['league_id']
            });
        }

    }
})();
