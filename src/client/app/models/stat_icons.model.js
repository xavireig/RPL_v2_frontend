(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('StatIconsModel', StatIconsModel);

    StatIconsModel.$inject = [];
    /* @ngInject */
    function StatIconsModel() {
        var statIconsModel;

        statIconsModel = {
            categoryIcons: {
                'assist': {
                    icon: '../images/match_action_icons/category/assist.svg',
                    title: 'Assist',
                    categories: ['is_c_assist']
                },
                'clean_sheet': {
                    icon: '../images/match_action_icons/category/romb_big_1px.svg',
                    title: 'Clean Sheet',
                    categories: ['is_c_clean_sheet']
                },
                'goal': {
                    icon: '../images/match_action_icons/category/goal.svg',
                    title: 'Goal',
                    categories: ['is_c_goal']
                },
                'goal_conceded': {
                    icon: '../images/match_action_icons/category/goal_conceded.svg',
                    title: 'Goal conceded',
                    categories: ['is_c_goal_conceled', 'is_c_save_percent']
                },
                'interception': {
                    icon: '../images/match_action_icons/category/interception.svg',
                    title: 'Interception',
                    categories: ['is_c_interceptions']
                },
                'key_pass': {
                    icon: '../images/match_action_icons/category/key_pass.svg',
                    title: 'Key Pass',
                    categories: ['is_c_k_pass']
                },
                'min_played': {
                    icon: '../images/match_action_icons/category/min_played.svg',
                    title: 'Min Played',
                    categories: ['is_c_minutes']
                },
                'own_goal': {
                    icon: '../images/match_action_icons/category/own_goal.svg',
                    title: 'Own goal',
                    categories: ['is_c_goal']
                },
                'pass_comp': {
                    icon: '../images/match_action_icons/category/pass_comp.svg',
                    title: 'Pass Completed',
                    categories: ['is_c_net_pass', 'is_c_pass_percent']
                },
                'red_card': {
                    icon: '../images/match_action_icons/category/red_card.svg',
                    title: 'Red Card',
                    categories: ['is_c_discipline']
                },
                'save': {
                    icon: '../images/match_action_icons/category/save.svg',
                    title: 'Save',
                    categories: ['is_c_save', 'is_c_save_percent']
                },
                'subbed_off': {
                    icon: '../images/match_action_icons/category/subbed_off.svg',
                    title: 'Subbed Off',
                    categories: []
                },
                'subbed_on': {
                    icon: '../images/match_action_icons/category/subbed_on.svg',
                    title: 'Subbed On',
                    categories: []
                },
                'tackle_won': {
                    icon: '../images/match_action_icons/category/tackle_won.svg',
                    title: 'Tackle Won',
                    categories: ['is_c_tackles']
                },
                'turnover': {
                    icon: '../images/match_action_icons/category/turnover.svg',
                    title: 'Turnover',
                    categories: ['is_c_turn_over']
                },
                'yellow_card': {
                    icon: '../images/match_action_icons/category/yellow_card.svg',
                    title: 'Yellow Card',
                    categories: ['is_c_discipline']
                },
                'goals_conceded_points' :{
                    icon: '../images/match_action_icons/category/goals_conceded_points.svg',
                    minusHalfIcon: '../images/match_action_icons/category/-.5 Goals Conceded Points icon.png',
                    minusOneIcon: '../images/match_action_icons/category/-1 Goals Conceded Points icon.png',
                    minusTwoIcon: '../images/match_action_icons/category/-2_gcp.svg',
                    minusThreeIcon: '../images/match_action_icons/category/-3_gcp.svg',
                    zeroIcon: '../images/match_action_icons/category/0 Goals Conceded Points icon.png',
                    oneIcon: '../images/match_action_icons/category/1 Goals Conceded Points icon.png',
                    threeIcon: '../images/match_action_icons/category/3 Goals Conceded Points icon.png',
                    title: 'Goal Conceded (points)',
                    categories: ['is_c_goals_conceded_points']
                },
                'shots_on_target' :{
                    icon: '../images/match_action_icons/category/shot_on_target.svg',
                    title: 'Shots on target',
                    categories: ['is_c_shots_on_target']
                },
                'take_ons' :{
                    icon: '../images/match_action_icons/category/take_on.svg',
                    title: 'Take ons',
                    categories: ['is_c_take_ons']
                },
                'tackle_interception' :{
                    icon1: '../images/match_action_icons/category/tackle_won.svg',
                    icon2: '../images/match_action_icons/category/interception.svg',
                    title: 'Tkl+Int',
                    categories: ['is_c_tackle_interception']
                }
            },
            pointIcons: {
                'assist': {
                    icon: '../images/match_action_icons/points/assist.svg',
                    title: 'Assist',
                    pointCategories: ['c_assist']
                },
                'big_chance_missed': {
                    icon: '../images/match_action_icons/points/big_chance_missed.svg',
                    title: 'Big Chance Missed',
                    pointCategories: ['c_big_chance_missed']
                },
                'clean_sheet': {
                    icon: '../images/match_action_icons/points/clean_sheet.svg',
                    title: 'Clean Sheet',
                    pointCategories: ['c_clean_sheet']
                },
                'corner_won': {
                    icon: '../images/match_action_icons/points/corner_won.svg',
                    title: 'Corner Won',
                    pointCategories: ['c_corner_kick_won']
                },
                'defensive_error': {
                    icon: '../images/match_action_icons/points/defensive_error.svg',
                    title: 'Defensive Error',
                    pointCategories: ['c_defensive_error']
                },
                'goal': {
                    icon: '../images/match_action_icons/points/goal.svg',
                    title: 'Goal',
                    pointCategories: ['c_goal']
                },
                'goal_conceded': {
                    icon: '../images/match_action_icons/points/goal_conceded.svg',
                    title: 'Goal Conceded',
                    pointCategories: ['c_goal_conceled']
                },
                'interception': {
                    icon: '../images/match_action_icons/points/interception.svg',
                    title: 'Interception',
                    pointCategories: ['c_interception']
                },
                'key_pass': {
                    icon: '../images/match_action_icons/points/key_pass.svg',
                    title: 'Key Pass',
                    pointCategories: ['c_key_pass', 'c_net_pass']
                },
                'shots_on_target' :{
                    icon: '../images/match_action_icons/category/shot_on_target.svg',
                    title: 'Shots on target',
                    pointCategories: ['c_shots_on_target']
                },
                'min_played': {
                    icon: '../images/match_action_icons/points/min_played.svg',
                    title: 'Min Played',
                    pointCategories: ['c_g_30_min', 'c_g_50_min', 'c_g_90_min']
                },
                'own_goal': {
                    icon: '../images/match_action_icons/points/own_goal.svg',
                    title: 'Own Goal',
                    pointCategories: ['c_own_goal']
                },
                'pass_comp': {
                    icon: '../images/match_action_icons/points/pass_comp.svg',
                    title: 'Pass Completed',
                    pointCategories: ['c_pass_completed', 'c_net_pass']
                },
                'penalty_miss': {
                    icon: '../images/match_action_icons/points/penalty_miss.svg',
                    title: 'Penalty Missed',
                    pointCategories: ['c_penalty_messed']
                },
                'penalty_saved': {
                    icon: '../images/match_action_icons/points/penalty_saved.svg',
                    title: 'Penalty Saved',
                    pointCategories: ['c_penalty_saved']
                },
                'penalty_won': {
                    icon: '../images/match_action_icons/points/penalty_won.svg',
                    title: 'Penalty Won',
                    pointCategories: ['c_penalty_won']
                },
                'red_card': {
                    icon: '../images/match_action_icons/points/red_card.svg',
                    title: 'Red Card',
                    pointCategories: ['c_red_cards']
                },
                'save': {
                    icon: '../images/match_action_icons/points/save.svg',
                    title: 'Save',
                    pointCategories: ['c_save']
                },
                'subbed_off': {
                    icon: '../images/match_action_icons/points/subbed_off.svg',
                    title: 'Subbed Off',
                    pointCategories: []
                },
                'subbed_on': {
                    icon: '../images/match_action_icons/points/subbed_on.svg',
                    title: 'Subbed On',
                    pointCategories: []
                },
                'tackle_won': {
                    icon: '../images/match_action_icons/points/tackle_won.svg',
                    title: 'Tackle Won',
                    pointCategories: ['c_tackle_won']
                },
                'take_ons' :{
                    icon: '../images/match_action_icons/category/take_on.svg',
                    title: 'Take ons',
                    pointCategories: ['c_take_ons']
                },
                'turnover': {
                    icon: '../images/match_action_icons/points/turnover.svg',
                    title: 'Turnover',
                    pointCategories: ['c_turn_over']
                },
                'yellow_card': {
                    icon: '../images/match_action_icons/points/yellow_card.svg',
                    title: 'Yellow Card',
                    pointCategories: ['c_yellow_cards']
                }
            },
            categories: [
                {title: 'Min', paramName: 'out_minutes', checker: 'is_c_minutes'},
                {title: 'G', paramName: 'cat_goals', checker: 'is_c_goal'},
                {title: 'KP', paramName: 'cat_k_pass', checker: 'is_c_k_pass'},
                {title: 'P%', paramName: 'out_pass_pers', checker: 'is_c_pass_percent'},
                {title: 'NP', paramName: 'cat_net_pass', checker: 'is_c_net_pass'},
                {title: 'Dis', paramName: 'out_discipline', checker: 'is_c_discipline'},
                {title: 'GlCn', paramName: 'out_gls_conc', checker: 'is_c_goal_conceled'},
                {title: 'ClSh', paramName: 'out_clean_sheet', checker: 'is_c_clean_sheet'},
                {title: 'Ast', paramName: 'cat_assist', checker: 'is_c_assist'},
                {title: 'Int', paramName: 'cat_interceptions', checker: 'is_c_interceptions'},
                {title: 'Sv', paramName: 'cat_save', checker: 'is_c_save'},
                {title: 'Tkl', paramName: 'cat_tackles', checker: 'is_c_tackles'},
                {title: 'TO', paramName: 'cat_turn_over', checker: 'is_c_turn_over'},
                {title: 'S/G', paramName: 'out_save_percent', checker: 'is_c_save_percent'},
                {title: 'GCP', paramName: 'cat_goals_conceded_points', checker: 'is_c_goals_conceded_points'},
                {title: 'Minutes Played (points)', paramName: 'cat_minutes_played_points', checker: 'is_c_minutes_played_points'},
                {title: 'Poss +/-', paramName: 'cat_possession', checker: 'is_c_possession'},
                {title: 'SoT', paramName: 'cat_shot_on_target', checker: 'is_c_shots_on_target'},
                {title: 'Tkl+Int', paramName: 'cat_tackle_interception', checker: 'is_c_tackle_interception'},
                {title: 'TakeOns', paramName: 'cat_take_ons', checker: 'is_c_take_ons'}
            ],
            tableStats: [
                {displayName: 'MIN', parameter: 'int_minutes', catsAffected:['is_c_minutes'], pointAffected:['c_g_30_min', 'c_g_50_min', 'c_g_90_min']},
                {displayName: 'Asst', parameter: 'int_assists', catsAffected:['is_c_assist', 'is_c_k_pass'], pointAffected:['c_assist']},
                {displayName: 'G', parameter: 'int_goals', catsAffected:['is_c_goal'], pointAffected:['c_goal']},
                {displayName: 'KyPs', parameter: 'out_kpass', catsAffected:['is_c_k_pass'], pointAffected:['c_key_pass']},
                {displayName: 'Ps%', parameter: 'out_pass_pers', catsAffected:['is_c_pass_percent'], pointAffected:['c_pass_completed']},
                {displayName: 'PsC/PsA', parameter: 'out_pass_pers', catsAffected:['is_c_pass_percent'], pointAffected:['c_pass_completed']},
                {displayName: 'NP', parameter: 'out_net_pass', catsAffected:['is_c_net_pass'], pointAffected:['c_net_pass']},
                {displayName: 'DIS', parameter: 'out_discipline', catsAffected:['is_c_discipline'], pointAffected:['c_yellow_cards', 'c_red_cards']},
                {displayName: 'GlsCn', parameter: 'int_team_goal_conceded', catsAffected:['is_c_goal_conceled', 'is_c_save_percent'], pointAffected:['c_goal_conceled'], inverted: true},
                {displayName: 'ClSh', parameter: 'int_clean_sheet', catsAffected:['is_c_clean_sheet'], pointAffected:['c_clean_sheet']},
                {displayName: 'Tkl', parameter: 'int_won_tackle', catsAffected:['is_c_tackles'], pointAffected:['c_tackle_won']},
                {displayName: 'Int', parameter: 'int_interception', catsAffected:['is_c_interceptions'], pointAffected:['c_interception']},
                {displayName: 'Sv', parameter: 'int_save', catsAffected:['is_c_save', 'is_c_save_percent'], pointAffected:['c_save']},
                {displayName: 'TO', parameter: 'int_turnover', catsAffected:['is_c_turn_over'], pointAffected:['c_turn_over'], inverted: true},
                {displayName: 'BCM', parameter: 'int_big_chance_missed', catsAffected:['never_show'], pointAffected:['c_big_chance_missed']},
                {displayName: 'CKW', parameter: 'int_won_corners', catsAffected:['never_show'], pointAffected:['c_corner_kick_won']},
                {displayName: 'Err', parameter: 'int_defensive_error', catsAffected:['never_show'], pointAffected:['c_defensive_error']},
                {displayName: 'PKC', parameter: 'int_penalty_conceded', catsAffected:['never_show'], pointAffected:['c_penalty_messed']},
                {displayName: 'PKW', parameter: 'int_penalty_won', catsAffected:['never_show'], pointAffected:['c_penalty_won']}
            ],
            clubStats: [
                {parameter: 'points', cur: 0, max: null, min: null, title: 'PTS', svg: 0, catsAffected:['never_show'], pointAffected:[]},
                {parameter: 'out_minutes', cur: 0, max: null, min: null, title: 'MIN', svg: 0, catsAffected:['is_c_minutes'], pointAffected:['c_g_30_min', 'c_g_50_min', 'c_g_90_min']},
                {parameter: 'int_assists', cur: 0, max: null, min: null, title: 'Asst', svg: 0, catsAffected:['is_c_assist', 'is_c_k_pass'], pointAffected:['c_assist']},
                {parameter: 'out_goals', cur: 0, max: null, min: null, title: 'G', svg: 0, catsAffected:['is_c_goal'], pointAffected:['c_goal']},
                {parameter: 'out_kpass', cur: 0, max: null, min: null, title: 'KyPs', svg: 0, catsAffected:['is_c_k_pass'], pointAffected:['c_key_pass']},
                {parameter: 'int_total_pass_add', cur: 0, max: null, min: null, title: 'TotPs', svg: 0, catsAffected:['is_c_pass_percent'], pointAffected:['c_pass_completed']},
                {parameter: 'out_pass_pers', cur: 0, max: null, min: null, title: 'Ps%', svg: 0, catsAffected:['is_c_pass_percent'], pointAffected:['c_pass_completed']},
                {parameter: 'cat_net_pass', cur: 0, max: null, min: null, title: 'NP', svg: 0, catsAffected:['is_c_net_pass'], pointAffected:['c_net_pass']},
                {parameter: 'out_discipline', cur: 0, max: null, min: null, title: 'Dis', svg: 0, catsAffected:['is_c_discipline'], pointAffected:['c_yellow_cards', 'c_red_cards']},
                {parameter: 'out_gls_conc', cur: 0, max: null, min: null, title: 'GlsCn', svg: 0, catsAffected:['is_c_goal_conceled', 'is_c_save_percent'], pointAffected:['c_goal_conceled']},
                {parameter: 'out_clean_sheet', cur: 0, max: null, min: null, title: 'ClSh', svg: 0, catsAffected:['is_c_clean_sheet'], pointAffected:['c_clean_sheet']},
                {parameter: 'int_won_tackle', cur: 0, max: null, min: null, title: 'Tkl', svg: 0, catsAffected:['is_c_tackles'], pointAffected:['c_tackle_won']},
                {parameter: 'int_interception', cur: 0, max: null, min: null, title: 'Int', svg: 0, catsAffected:['is_c_interceptions'], pointAffected:['c_interception']},
                {parameter: 'cat_save', cur: 0, max: null, min: null, title: 'Sv', svg: 0, catsAffected:['is_c_save', 'is_c_save_percent'], pointAffected:['c_save']},
                {parameter: 'int_turnover', cur: 0, max: null, min: null, title: 'TO', svg: 0, catsAffected:['is_c_turn_over'], pointAffected:['c_turn_over']},
                {parameter: 'int_big_chance_missed', cur: 0, max: null, min: null, title: 'BCM', svg: 0, catsAffected:['never_show'], pointAffected:['c_big_chance_missed']},
                {parameter: 'int_won_corners', cur: 0, max: null, min: null, title: 'CKW', svg: 0, catsAffected:['never_show'], pointAffected:['c_corner_kick_won']},
                {parameter: 'int_defensive_error', cur: 0, max: null, min: null, title: 'Err', svg: 0, catsAffected:['never_show'], pointAffected:['c_defensive_error']},
                {parameter: 'int_penalty_conceded', cur: 0, max: null, min: null, title: 'PKC', svg: 0, catsAffected:['never_show'], pointAffected:['c_penalty_messed']},
                {parameter: 'int_penalty_won', cur: 0, max: null, min: null, title: 'PKW', svg: 0, catsAffected:['never_show'], pointAffected:['c_penalty_won']}
            ]
        };

        return statIconsModel;

    }
})();
