(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('ScoringSettingsController', ScoringSettingsController);

    ScoringSettingsController.$inject = [
        '$state', 'logger', 'requestservice', '$stateParams',
        '$q', '$scope', 'LeagueSettingsModel', 'ngDialog',
        '$interval', 'LeagueModel', '$window', 'config'
    ];
    /* @ngInject */
    function ScoringSettingsController(
        $state, logger, requestservice, $stateParams,
        $q, $scope, LeagueSettingsModel, ngDialog,
        $interval, LeagueModel, $window, config
    ) {
        var vm = this;

        vm.menu = {
            getScoringDataInterval: undefined,
            advancedOptionChange: advancedOptionChange,
            changeScoringSettingsType: changeScoringSettingsType, //scoring settings types - Categories/Points
            changeScoringType: changeScoringType, //scoring types - Standard/Custom
            scoringDataWasChanged: scoringDataWasChanged,
            categoriesDataWasChanged: categoriesDataWasChanged,
            numberOfScoringTypeSwitches: 1,
            scoringDataWasSaved: false,
            customizeCategoriesFirstRow: [
                {title: 'Goal', paramName: 'goal'},
                {title: 'Minutes Played', paramName: 'minutes'},
                {title: 'Minutes Played <br />(points)', paramName: 'minutes_played_points'},
                {title: 'Key Passes <br />(Key Passes + Assists)', paramName: 'k_pass'},
                {title: 'Assists <br />(assist only)', paramName: 'assist'},
                {title: 'Shots on Target', paramName: 'shots_on_target'},
                {title: 'Net Passes', paramName: 'net_pass'},
                {title: 'Pass %', paramName: 'pass_percent'},
                {title: 'Take Ons', paramName: 'take_ons'},
                {title: 'Discipline', paramName: 'discipline'},
            ],
            customizeCategoriesSecondRow: [
                {title: 'Tackles Won', paramName: 'tackles'},
                {title: 'Interceptions', paramName: 'interceptions'},
                {title: 'Tkl+Int ', paramName: 'tackle_interception'},
                {title: 'Turnovers', paramName: 'turn_over'},
                {title: 'Possession +/-', paramName: 'possession'},
                {title: 'Goals Conceded', paramName: 'goal_conceled'},
                {title: 'Goals Conceded (points)', paramName: 'goals_conceded_points'},
                {title: 'Clean Sheets', paramName: 'clean_sheet'},
                {title: 'Saves/Goal', paramName: 'save_percent'},
                {title: 'Saves', paramName: 'save'}
            ],
            customizePointsFields: [
                {title: 'Goal', paramName: 'c_goal'},
                {title: 'Assists', paramName: 'c_assist'},
                {title: 'Key Pass', paramName: 'c_key_pass'},
                {title: 'Shot on Target', paramName: 'c_shot_on_target'},
                {title: '40+ Passes @ 80% Accuracy', paramName: 'c_passes_40'},
                {title: '50+ Passes @ 80% Accuracy', paramName: 'c_passes_50'},
                {title: '60+ Passes @ 80% Accuracy', paramName: 'c_passes_60'},
                {title: '1 - 60 Min Played', paramName: 'c_g_30_min'},
                {title: '61 - 89 Min Played', paramName: 'c_g_50_min'},
                {title: '90+ Min Played', paramName: 'c_g_90_min'},
                {title: 'Take Ons', paramName: 'c_take_ons'},
                {title: 'Yellow Card', paramName: 'c_yellow_cards'},
                {title: 'Red Card', paramName: 'c_red_cards'},
                {title: 'Goal Conceded', paramName: 'c_goal_conceled'},
                {title: 'Clean Sheet', paramName: 'c_clean_sheet'},
                {title: 'Save', paramName: 'c_save'},
                {title: 'Own Goal', paramName: 'c_own_goal'},
                {title: 'Defensive Error', paramName: 'c_defensive_error'},
                {title: 'Tackle Won', paramName: 'c_tackle_won'},
                {title: 'Interception', paramName: 'c_interception'},
                {title: 'Turnover', paramName: 'c_turn_over'},
                {title: 'Penalty Won', paramName: 'c_penalty_won'},
                {title: 'Penalty Conceded', paramName: 'c_penalty_conceded'},
                {title: 'Penalty Missed', paramName: 'c_penalty_missed'},
                {title: 'Penalty Save', paramName: 'c_penalty_saved'},
                {title: 'Big Chance Missed', paramName: 'c_big_chance_missed'},
                {title: 'Corner Kick Won', paramName: 'c_corner_kick_won'}
            ]
        };

        vm.model = {
            league: LeagueModel,
            leagueSettingsModel: LeagueSettingsModel,
            saveLeagueSettings: saveLeagueSettings,
            changeCategoriesData: changeCategoriesData,
            changePointsData: changePointsData,
            restoreDefaultsSettings: restoreDefaultsSettings,
            advancedOptionChanged: false
        };

        vm.view = {
            disableInput: disableInput,
            goToHelpPage: goToHelpPage
        };

        activate();

        function activate() {
            return $q.all([getCategoriesData()]).then(function () {
                vm.menu.getScoringDataInterval = $interval(function() {
                    getScoringTypeData(false);
                }, 20000);
                $scope.$on('$destroy', function () {
                    $interval.cancel(vm.menu.getScoringDataInterval);
                });
            });
        }

        function goToHelpPage(anchor) {
            $window.open(config.protocol + '://' + config.domainEndpoint + config.portEndpoint + '/help' + anchor, '_blank');
        }

        function advancedOptionChange() {
            vm.model.advancedOptionChanged = true;
        }
        function getScoringTypeData(makeParse) {
            return requestservice.run('getScoringTypeData', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                console.log('GET CALCULATION DATA');
                console.log(received);
                if (received.data.success === 0) {
                    if (makeParse) {
                        vm.model.leagueSettingsModel.parseScoringType(received);
                    } else {
                        vm.model.leagueSettingsModel.recalcInProcess = received.data.result['league_sco_type']['recalc_in_process'];
                    }
                }
                return received;
            });
        }

        //tracking changes in inputs
        //if some input was changed, then allow save scoring data
        function scoringDataWasChanged() {
            vm.menu.scoringDataWasSaved = false;
        }

        //tracking scoring types changes
        function changeScoringType() {
            if (vm.model.leagueSettingsModel.scoringType.points) {
                vm.model.leagueSettingsModel.scoringType['custom'] = !vm.model.leagueSettingsModel.scoringType['is_point_default'];
                vm.model.leagueSettingsModel.advancedOptions['weight_goals_category'] = false;
                vm.model.advancedOptionChanged = true;
            } else {
                vm.model.leagueSettingsModel.scoringType['custom'] = !vm.model.leagueSettingsModel.scoringType['is_cat_default'];
            }
            vm.menu.numberOfScoringTypeSwitches++;
        }

        //if scoring settings type was changed from custom to default - popup dialog
        //if from default to custom - allow save scoring data
        function changeScoringSettingsType() {
            if (vm.model.leagueSettingsModel['scoringType']['custom'] === false) {
                vm.model.leagueSettingsModel['scoringType']['custom'] = true;
                restoreDefaultsSettings();
            } else {
                vm.menu.scoringDataWasSaved = false;
            }
        }

        function categoriesDataWasChanged() {
            vm.menu.scoringDataWasSaved = false;
        }

        function saveLeagueSettings() {
            var settingsArray = [],
                sendingData = {},
                // scoringTypeWasChanged = !vm.menu.scoringDataWasSaved,
                scoringTypeWasChanged = (vm.menu.numberOfScoringTypeSwitches % 2) === 0,
                scoringSettingsTypeCallback;
            // if (vm.menu.scoringDataWasSaved && !scoringTypeWasChanged) {
            //     logger.success('Scoring data already save');
            //     return;
            // }
            if (scoringTypeWasChanged) {
                settingsArray.push('scoring_type_settings');
                sendingData['scoring_type'] = vm.model.leagueSettingsModel.scoringType.points ? 'point' : 'category';
                // setScoringType();
            }
            if (vm.model.advancedOptionChanged) {
                settingsArray.push('scoring_advanced_settings');
                sendingData['fantasy_assist'] = vm.model.leagueSettingsModel.advancedOptions['fantasy_assist'];
                sendingData['weight_goals_category'] = vm.model.leagueSettingsModel.advancedOptions['weight_goals_category'];
            }

            if (!vm.menu.scoringDataWasSaved) {
                settingsArray.push('scoring_customize_settings');
                sendingData['is_default'] = false;
                if (vm.model.leagueSettingsModel.scoringType.points) {
                    // setScoringSettingsType(changePointsData);
                    scoringSettingsTypeCallback = changePointsData;
                } else {
                    // setScoringSettingsType(changeCategoriesData);
                    scoringSettingsTypeCallback = changeCategoriesData;
                }
            }

            if (settingsArray.length > 0) {
                sendingData['settings_for_saving'] = settingsArray;

                LeagueSettingsModel.api.saveLeagueSettings(sendingData, 'Scoring')
                    .then(function (received) {
                        if (sendingData['settings_for_saving'].indexOf('scoring_type_settings') !== -1) {
                            vm.menu.numberOfScoringTypeSwitches = 1;
                            // vm.model.leagueSettingsModel.parseScoringType(received);
                        }
                        if (!vm.menu.scoringDataWasSaved) {
                            scoringSettingsTypeCallback();
                        }
                        vm.menu.scoringDataWasSaved = false;
                    });
            }
        }
        function restoreDefaultsSettings() {
            if (vm.model.leagueSettingsModel.recalcInProcess) {
                return;
            }
            if (vm.model.leagueSettingsModel['scoringType']['custom'] === true) {
                ngDialog.open({
                    template: 'app/league/confirmation_dialog.html',
                    className: 'player-card ngdialog-theme-default',
                    scope: $scope,
                    controller: 'ConfirmationDialogController',
                    controllerAs: 'vm',
                    data: {
                        resetCategoriesDataToDefault: resetCategoriesDataToDefault,
                        setScoringType: setScoringType
                    }
                });
            }
        }

        function getCategoriesData() {
            return requestservice.run('getCategoriesData', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                console.log('GET CATEGORIES DATA');
                console.log(received);
                if (received.data.success === 0) {
                    vm.menu.scoringDataWasSaved = true;
                    vm.model.leagueSettingsModel.parseScoringType(received);
                    vm.model.leagueSettingsModel.parseLeagueSettingsCategories(received);
                    vm.model.leagueSettingsModel.parseLeagueSettingsPoints(received);
                    vm.model.leagueSettingsModel.parseAdvanceOptions(received);
                }
                return received;
            });
        }

        function changeCategoriesData() {
            return requestservice.run('changeCategoriesData', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                },
                'league_sco_cat': vm.model.leagueSettingsModel.scoringData['league_sco_cat']
            }).then(function (received) {
                console.log('CHANGE CATEGORIES DATA');
                console.log(received);
                if (received.data.success === 0) {
                    vm.menu.scoringDataWasSaved = true;
                    vm.model.leagueSettingsModel.clear();
                    vm.model.leagueSettingsModel.parseScoringType(received);
                    vm.model.leagueSettingsModel.parseLeagueSettingsCategories(received);
                    // logger.success('Categories data was successfully update');
                }
                return received;
            });
        }

        function changePointsData() {
            return requestservice.run('changePointsData', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                },
                'league_sco_points': vm.model.leagueSettingsModel.parseLeagueScoringPointsForApi()
            }).then(function (received) {
                console.log('CHANGE POINTS DATA');
                console.log(received);
                if (received.data.success === 0) {
                    vm.menu.scoringDataWasSaved = true;
                    vm.model.leagueSettingsModel.clear();
                    vm.model.leagueSettingsModel.parseScoringType(received);
                    vm.model.leagueSettingsModel.parseLeagueSettingsPoints(received);
                    logger.success('Points data was successfully update');
                }
                return received;
            });
        }

        function setScoringType(success) {
            return requestservice.run('setScoringType', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                },
                'scoring_type': vm.model.leagueSettingsModel.scoringType.points ? 'point' : 'category'
            }).then(function (received) {
                console.log('CHANGE SCORING CALCULATION');
                console.log(received);
                if (received.data.success === 0) {
                    vm.menu.scoringDataWasSaved = false;
                    vm.menu.numberOfScoringTypeSwitches = 1;
                    if (success) {
                        success();
                    } else {
                        vm.model.leagueSettingsModel.parseScoringType(received);
                    }
                    // logger.success('Scoring type was successfully change');
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function setScoringSettingsType(success, isDefault) {

            LeagueSettingsModel.api.saveLeagueSettings({
                'settings_for_saving': ['scoring_customize_settings'],
                'is_default': isDefault ? isDefault : !vm.model.leagueSettingsModel.scoringType['custom']
            }, 'Scoring')
                .then(function (received) {
                    console.log('RECEIVED');
                    console.log(received);
                    if (received.data.success === 0) {
                        LeagueSettingsModel.scoringType['custom'] = !isDefault;
                    }
                    // vm.model.leagueSettingsModel.parseScoringType(received);
                    // logger.success('Scoring settings type was successfully change');
                    if (success) {
                        success();
                    }
                });

            // return requestservice.run('setScoringSettingsType', {
            //     'url_params': {
            //         ':league_id': $stateParams['league_id']
            //     },
            //     'is_default': isDefault ? isDefault : !vm.model.leagueSettingsModel.scoringType['custom']
            // }).then(function (received) {
            //     console.log('SET SCORING SETTINGS TYPE');
            //     console.log(received);
            //     if (received.data.success === 0) {
            //         vm.model.leagueSettingsModel.parseScoringType(received);
            //         logger.success('Scoring settings type was successfully change');
            //         if (success) {
            //             success();
            //         }
            //     } else {
            //         logger.error(received.data.message);
            //     }
            //     return received;
            // });
        }

        function resetCategoriesDataToDefault() {
            return requestservice.run('resetCategoriesDataToDefault', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                console.log('RESET SCORING DATA TO DEFAULT');
                console.log(received);
                if (received.data.success === 0) {
                    vm.menu.scoringDataWasSaved = true;
                    setScoringSettingsType(null, true);
                    vm.model.leagueSettingsModel.clear(true);
                    vm.model.leagueSettingsModel.parseScoringType(received);
                    vm.model.leagueSettingsModel.parseLeagueSettingsCategories(received);
                    vm.model.leagueSettingsModel.parseLeagueSettingsPoints(received);
                    // logger.success('Scoring data was successfully reset to default');
                }
                return received;
            });
        }

        function disableInput(parameter) {
            return vm.model.leagueSettingsModel.recalcInProcess || !vm.model.leagueSettingsModel.scoringData['league_sco_cat']['is_c_' + parameter.paramName];
        }
    }
})();

