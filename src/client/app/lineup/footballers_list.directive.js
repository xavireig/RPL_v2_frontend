(function () {
    'use strict';

    angular
        .module('app.lineup')
        .directive('footballersList', footballersListDirective);

    footballersListDirective.$inject = ['moment', 'LineUpModel', 'InjuryAndSuspensionModel', 'FootballerModel', 'logger'];
    /* @ngInject */
    function footballersListDirective(moment, LineUpModel, InjuryAndSuspensionModel, FootballerModel, logger) {
        //Usage:
        //<div resizable ng-style="{ width: windowWidth, height: windowHeight }"></div>
        var directive = {
            restrict: 'E',
            replace: true,
            link: link,
            scope: {
                footballers: '=footballers',
                realTeams: '=realTeams',
                replaceDataHash: '=',
                lineUpWasAnnounced: '=',
                replaceAction: '=',
                setNoActive: '=',
                movePlayer: '=',
                statsPlayer: '='
            },
            templateUrl: 'app/lineup/footballers_list.html'
        };
        return directive;

        function link (scope, element, attrs) {
            var vm = scope;
            vm.menu = {
                returnFootballerStatusStyle: returnFootballerStatusStyle,
                returnFootballerGameRoleStyle: returnFootballerGameRoleStyle,
                returnMatchData: returnMatchData,
                returnMatchTypeSymbol: returnMatchTypeSymbol
            };

            console.log('scope.realTeams');
            console.log(scope.realTeams);

            vm.model = {
                footballer: FootballerModel,
                footballerPositionsHash: LineUpModel.footballerPositionsSymbols,
                replacingPosition: '',
                fromTeamFootballerId: undefined,
                toTeamFootballerId: undefined,
                inStarting: false,
                injuryModel: InjuryAndSuspensionModel,
                replaceFootballers: replaceFootballers,
                checkBeforeReplaceAction: checkBeforeReplaceAction
            };

            function returnMatchData(matchData) {
                if (!matchData) {
                    return 'nil'
                } else if (matchData['is_done'] || matchData['now_play']) {
                    if (matchData['home_match']) {
                        return matchData['home_score'] + '-' + matchData['away_score'] + ', ' + Math.min(parseFloat(matchData['scheduled']), 90) + '\'';
                    } else {
                        return matchData['away_score'] + '-' + matchData['home_score'] + ', ' + Math.min(parseFloat(matchData['scheduled']), 90) + '\'';
                    }
                } else if (!matchData['is_done'] && !matchData['now_play']) {
                    return moment(matchData['scheduled']).format('MM/DD');
                }
            }

            function returnMatchTypeSymbol(matchIsHome) {
                if (matchIsHome) {
                    return 'v. ';
                } else {
                    return '@ ';
                }
            }

            function isNotInSameGroup(footballer) {
                if (scope.replaceDataHash.inStarting) {
                    return footballer['on_starting_xi'] !== scope.replaceDataHash.inStarting;
                } else if (scope.replaceDataHash.inBench) {
                    return footballer['on_bench'] !== scope.replaceDataHash.inBench;
                } else {
                    return footballer['on_reserve'] !== scope.replaceDataHash.inReserve;
                }
            }

            function isActiveChoosen(footballer) {
                if (!footballer['match_data']) {
                    return false;
                }
                return isNotInSameGroup(footballer) && isReplaceable(footballer) &&
                (footballer['match_data']['is_done'] === false && footballer['match_data']['now_play'] === false);
            }

            function isReplaceable(footballer) {
                if (scope.replaceDataHash.inBench && footballer['on_reserve'] === true) {
                    return true;
                }

                if (scope.replaceDataHash.inReserve && footballer['on_bench'] === true) {
                    return true;
                }

                if (footballer['footballer']['position'] === scope.replaceDataHash.replacingPosition) {
                    return true;
                } else if (scope.replaceDataHash.replacingPosition === 'goalkeeper' ||
                    footballer['footballer']['position'] === 'goalkeeper') {
                    return false;
                } else if (footballer['on_starting_xi']) {
                    return false;
                } else {
                    return false;
                }
            }

            function isNotActive(footballer) {
                if (!footballer['match_data']) {
                    return false;
                }
                return !isReplaceable(footballer) ||
                      footballer['id'] !== scope.replaceDataHash.fromTeamFootballerId &&
                      !isNotInSameGroup(footballer) || footballer['match_data']['is_ongoing'] === true;
            }

            function returnFootballerStatusStyle(footballer) {
                if (scope.replaceAction) {
                    return {
                        'active choosen': isActiveChoosen(footballer),
                        'no-active disabled': isNotActive(footballer),
                        'choosen': footballer['id'] === scope.replaceDataHash.fromTeamFootballerId,
                    };
                } else {
                    if (!footballer['match_data']) {
                        return {
                            'active': true,
                            'no-active; disabled': false,
                            'choosen': false
                        };
                    } else {
                        return {
                            'active': footballer['match_data']['is_ongoing'] === false,
                            'no-active; disabled': footballer['match_data']['is_ongoing'] === true,
                            'choosen': false
                        };
                    }
                }
            }

            function returnFootballerGameRoleStyle(footballer, status) {
                var gameRole = footballer['footballer_role_in_round'];
                if (!footballer['match_data']) {
                     return {
                            'del': gameRole === 'player_is_not_declared' || gameRole === 'unknown',
                            'b': gameRole === 'in_reserve',
                            'xi': gameRole === 'in_game'
                        }
                }
                var scheduled = footballer['match_data']['scheduled'];
                var diffInTime = moment(scheduled).diff(moment() , 'minutes');

                if (gameRole === 'in_game' || gameRole === 'in_reserve' || diffInTime <= 55) {
                    return {
                            'del': gameRole === 'player_is_not_declared' || gameRole === 'unknown',
                            'b': gameRole === 'in_reserve',
                            'xi': gameRole === 'in_game'
                        };
                } else {
                    return {
                            'del': false,
                            'b': gameRole === 'in_reserve',
                            'xi': gameRole === 'in_game'
                        };
                }

                //if (gameRole !== 'unknown') {
                //    return {
                //        'del': gameRole === 'player_is_not_declared',
                //        'b': gameRole === 'in_reserv',
                //        'xi': gameRole === 'in_game'
                //    };
                //} else if (gameRole === 'unknown' && status === 'finished') {
                //    return {
                //        'del': gameRole === 'unknown',
                //        'b': gameRole === 'in_reserv',
                //        'xi': gameRole === 'in_game'
                //    };
                //} else {
                //    return {};
                //}
            }

            function checkBeforeReplaceAction(footballer) {
                console.log('Check before replace action1');
                console.log(footballer);
                if (!footballer['match_data']) {
                    return;
                }
                if (footballer['match_data']['is_done'] === false && footballer['match_data']['now_play'] === false) {
                    replaceFootballers(footballer);
                }
            }

            function replaceFootballers(footballer) {
                if ((scope.replaceAction && footballer['footballer']['position'] === scope.replaceDataHash.replacingPosition) || !scope.setNoActive()) {
                    if (scope.replaceAction) {
                        scope.replaceDataHash.toTeamFootballerId = footballer['id'];
                        if (scope.replaceDataHash.fromTeamFootballerId === scope.replaceDataHash.toTeamFootballerId || scope.replaceDataHash.replacingPosition !== footballer['footballer']['position'] && !isReplaceable(footballer)) {
                            scope.replaceDataHash.fromTeamFootballerId = undefined;
                            scope.replaceAction = false;
                        } else if (scope.replaceDataHash.inStarting !== footballer['on_starting_xi']) {
                            scope.movePlayer(scope.replaceDataHash.inStarting);
                        } else if (scope.replaceDataHash.inBench !== footballer['on_bench']) {
                            scope.movePlayer(scope.replaceDataHash.inBench);
                        } else if (scope.replaceDataHash.inReserve !== footballer['on_reserve']) {
                            scope.movePlayer(scope.replaceDataHash.inReserve);
                        } else if (scope.replaceDataHash.inStarting === footballer['on_starting_xi']) {
                            logger.error('Cannot swap in  between starting XI/benched/reserve players!');
                        }
                    } else {
                        scope.replaceAction = true;
                        scope.replaceDataHash.fromTeamFootballerId = footballer['id'];
                        scope.replaceDataHash.replacingPosition = footballer['footballer']['position'];
                        scope.replaceDataHash.inStarting = footballer['on_starting_xi'];
                        scope.replaceDataHash.inBench = footballer['on_bench'];
                        scope.replaceDataHash.inReserve = footballer['on_reserve'];
                    }
                }
            }
        }
    }
})();
