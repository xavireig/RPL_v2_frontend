(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('scoringInfo', scoringInfo);

    scoringInfo.$inject = ['requestservice', '$stateParams'];
    /* @ngInject */
    function scoringInfo(requestservice, $stateParams) {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/directives/scoring_info.html',
            scope: {
                league: '=',
                scoringType: '='
            },
            link: function (scope, element, attrs) {
                console.log();
                scope.codeToTitle = {
                    'c_goal' : 'Goal',
                    'c_assist' :'Assists',
                    'c_key_pass':'Key Pass' ,
                    'c_net_pass': 'Net pass',
                    'c_shot_on_target': 'Shot on Target',
                    'c_passes_40':'40+ Passes',
                    'c_passes_50':'50+ Passes',
                    'c_passes_60':'60+ Passes',
                    'c_g_30_min':'1 - 60 Min Played',
                    'c_g_50_min': '61 - 89 Min Played',
                    'c_g_90_min':'90+ Min Played',
                    'c_take_ons':'Take Ons',
                    'c_yellow_cards':'Yellow Card',
                    'c_red_cards':'Red Card',
                    'c_goal_conceled':'Goal Conceded',
                    'c_clean_sheet':'Clean Sheet',
                    'c_own_goal':'Own Goal',
                    'c_defensive_error':'Defensive Error',
                    'c_tackle_won':'Tackle Won',
                    'c_interception':'Interception',
                    'c_penalty_won':'Penalty Won',
                    'c_penalty_conceded':'Penalty Conceded',
                    'c_penalty_missed':'Penalty Missed',
                    'c_penalty_saved':'Penalty Save',
                    'c_big_chance_missed':'Big Chance Missed',
                    'c_corner_kick_won':'Corner Kick Won',

                    'c_pass_completed': 'Net pass',
                    'c_interceptions': 'Interceptions',
                    'c_pass_percent': 'Pass %',
                    'c_discipline': 'Discipline',
                    'c_minutes': 'Minutes Played',
                    'c_k_pass': 'Key Passes..',
                    'c_tackles': 'Tackles Won',
                    'c_turn_over': 'Turnovers',
                    'c_save': ' Save',
                    'c_save_percent': 'Save/Goal',
                    'c_shots_on_target': 'Shots on Target',
                    'c_tackle_interception': 'Tkl+Int',
                    'c_possession':'Possession +/-',
                    'c_minutes_played_points': 'Minutes Played(points)',
                    'c_goals_conceded_points': 'Goals Conceded (points)'
                };
                scope.leagueScoringType = {};
                scope.leagueScoringTypeView = [];
                getScoringType();

                function getScoringType() {
                    requestservice.run('getCategData',
                        {
                            code: $stateParams['league_code'],
                            'id': $stateParams['league_id']
                        }
                    ).then(function (received) {
                        parseScoringType(received.data.result);
                    });
                }

                function parseScoringType(scoringType) {
                    console.log('scoringType');
                    console.log(scoringType);
                    if (scoringType['league_sco_type']['scoring_type'] === 'category') {
                        parseCategoryScoring(scoringType);
                    } else {
                        parsePointScoring(scoringType);
                    }
                }

                function parseCategoryScoring(scoringType) {
                    scope.leagueScoringType = scoringType['league_sco_cat'];
                    for (var prop in scope.leagueScoringType) {
                        if (scope.leagueScoringType['is_' + prop]) {
                            var obj = {};
                            console.log(prop);
                            obj.title = prop;
                            obj.value = scope.leagueScoringType[prop];
                            scope.leagueScoringTypeView.push(obj);
                        }
                    }
                    console.log('scope.leagueScoringTypeView');
                    console.log(scope.leagueScoringTypeView);
                }

                function parsePointScoring(scoringType) {
                    console.log(scoringType);
                    var footballer = {};
                    var forward = scoringType['league_sco_points'][0];
                    var midfielder = scoringType['league_sco_points'][1];
                    var defender= scoringType['league_sco_points'][2];
                    var goalkeeper = scoringType['league_sco_points'][3];
                    delete defender['id'];
                    delete defender['league_id'];
                    delete defender['position'];

                    delete forward['id'];
                    delete forward['league_id'];
                    delete forward['position'];

                    delete goalkeeper['id'];
                    delete goalkeeper['league_id'];
                    delete goalkeeper['position'];

                    delete midfielder['id'];
                    delete midfielder['league_id'];
                    delete midfielder['position'];
                    
                    console.log()
                    for (var cat in defender) {
                       
                            footballer[cat] = forward[cat];
                            delete defender[cat];
                            delete forward[cat];
                            delete goalkeeper[cat];
                            delete midfielder[cat];
                        
                    }
                    console.log('point scoring directive');
                    
                    console.log(footballer);
                    scope.leagueScoringTypeView.footballer = footballer;
                    scope.leagueScoringTypeView.defender = defender;
                    scope.leagueScoringTypeView.forward = forward;
                    scope.leagueScoringTypeView.goalkeeper = goalkeeper;
                    scope.leagueScoringTypeView.midfielder = midfielder;
                }
            }
        };
        return directive;
    }
})();

