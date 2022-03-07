(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('LeagueSettingsModel', LeagueSettingsModel);

    LeagueSettingsModel.$inject = ['$stateParams', 'requestservice', 'logger'];
    /* @ngInject */
    function LeagueSettingsModel($stateParams, requestservice, logger) {
        var leagueSettingsModel;

        leagueSettingsModel = {
            leagueScoPointsForApi: {
                'league_sco_points': []
            },
            scoringData: {
                'league_sco_cat': {},
                'league_sco_points': {}
            },
            scoringType: {
                points: false,
                'is_cat_default': false,
                'is_point_default': false
            },
            advancedOptions: {
                'fantasy_assist': false,
                'weight_goals_category': false,
            },
            recalcInProcess: false,
            data: [],
            total: 0,
            paging: {
                'page': 1,
                'per_page': 200
            },
            parse: parse,
            parseScoringType: parseScoringType,
            parseLeagueSettingsCategories: parseLeagueSettingsCategories,
            parseLeagueSettingsPoints: parseLeagueSettingsPoints,
            parseLeagueScoringPointsForApi: parseLeagueScoringPointsForApi,
            parseAdvanceOptions: parseAdvanceOptions,
            clear: clear,
            api: {
                saveLeagueSettings: saveLeagueSettings
            }
        };

        return leagueSettingsModel;

        function parse(data) {
            leagueSettingsModel.data = data.data.result;
            leagueSettingsModel.total = data.data.result.length;
        }

        function parseAdvanceOptions(received) {
            leagueSettingsModel.advancedOptions['fantasy_assist'] = received.data.result['fantasy_assist'];
            leagueSettingsModel.advancedOptions['weight_goals_category'] = received.data.result['weight_goals_category'];
        }

        function parseScoringType(data) {
            leagueSettingsModel.scoringType.points = data.data.result['league_sco_type']['scoring_type'] === 'point';

            if (leagueSettingsModel.scoringType.points) {
                leagueSettingsModel.scoringType['custom'] = !data.data.result['league_sco_type']['is_point_default'];
            } else {
                leagueSettingsModel.scoringType['custom'] = !data.data.result['league_sco_type']['is_cat_default'];
            }
            leagueSettingsModel.scoringType['is_cat_default'] = data.data.result['league_sco_type']['is_cat_default'];
            leagueSettingsModel.scoringType['is_point_default'] = data.data.result['league_sco_type']['is_point_default'];
            leagueSettingsModel.recalcInProcess = data.data.result['league_sco_type']['recalc_in_process'];

        }

        function parseLeagueSettingsCategories(data) {
            leagueSettingsModel.recalcInProcess = data.data.result['league_sco_type']['recalc_in_process'];
            if (data.data.result['league_sco_type']['scoring_type'] === 'point') {
                leagueSettingsModel.scoringType.points = true;
            }

            for (var statParam in data.data.result['league_sco_cat']) {
                if (data.data.result['league_sco_cat'].hasOwnProperty(statParam)) {
                    leagueSettingsModel.scoringData['league_sco_cat'][statParam] = data.data.result['league_sco_cat'][statParam];
                }
            }
            console.log(leagueSettingsModel.scoringData['league_sco_cat']);
        }

        function parseLeagueSettingsPoints(data) {
            for (var i = 0; i < data.data.result['league_sco_points'].length; i++) {
                leagueSettingsModel.scoringData['league_sco_points'][data.data.result['league_sco_points'][i].position] = data.data.result['league_sco_points'][i];
            }
            console.log(leagueSettingsModel.scoringData['league_sco_points']);
        }

        function parseLeagueScoringPointsForApi() {
            for (var position in leagueSettingsModel.scoringData['league_sco_points']) {
                if (leagueSettingsModel.scoringData['league_sco_points'].hasOwnProperty(position)) {
                    leagueSettingsModel.leagueScoPointsForApi['league_sco_points'].push(leagueSettingsModel.scoringData['league_sco_points'][position]);
                }
            }
            return leagueSettingsModel.leagueScoPointsForApi['league_sco_points'];
        }

        function clear(clearAll) {
            leagueSettingsModel.data = [];
            leagueSettingsModel.leagueScoPointsForApi = {
                'league_sco_points': []
            };
            leagueSettingsModel.paging.page = 1;
            leagueSettingsModel.total = 0;
            if (clearAll) {
                leagueSettingsModel.scoringData['league_sco_points'] = {};
                leagueSettingsModel.scoringData['league_sco_cat'] = {};
                return;
            }
            if (leagueSettingsModel.scoringType.points) {
                leagueSettingsModel.scoringData['league_sco_points'] = {};
            } else {
                leagueSettingsModel.scoringData['league_sco_cat'] = {};
            }
        }

        function saveLeagueSettings(requestData, tabName) {
            requestData['url_params'] = {
                ':league_id': $stateParams['league_id']
            };
            return requestservice.run('saveLeagueSettings', requestData)
                .then(function (received) {
                    console.log('saveLeagueSettings');
                    console.log(received);
                    if (received.data.success === 0) {
                        logger.success(tabName + ' settings successfully saved');
                    } else {
                        logger.error(received.data.message);
                    }
                    return received;
                });
        }
    }
})();
