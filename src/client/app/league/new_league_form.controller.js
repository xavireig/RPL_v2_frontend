(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('NewLeagueFormController', NewLeagueFormController);

    NewLeagueFormController.$inject = [
        '$state', 'logger', 'LeagueModel',
        'requestservice', '$scope', '$timeout',
        'moment', 'CommonModel', '$stateParams', 'UserModel'
    ];
    /* @ngInject */
    function NewLeagueFormController(
        $state, logger, LeagueModel,
        requestservice, $scope, $timeout,
        moment, CommonModel, $stateParams, UserModel
    ) {
        var vm = this;

        vm.menu = {
            createLeagueFirstStep: createLeagueFirstStep,
            chooseNumberOfTeams: chooseNumberOfTeams,
            startEditNumberOfMatches: startEditNumberOfMatches,
            startEditStartRoundNumber: startEditStartRoundNumber,
            changeStartRoundNumber: changeStartRoundNumber,
            seasonLengthChanged: seasonLengthChanged
        };

        vm.model = {
            leagues: LeagueModel,
            'is_open': {
                'number_of_teams': false,
                'draft_datetime': false,
                'num_matches': false,
                'start_round_num': false
            },
            'max_matches': 38,
            commonModel: CommonModel
        };

        activate();

        function activate() {
            vm.model.leagues.one['draft_time'] = new Date(moment().add(2, 'days'));
            vm.model.leagues.one['start_round_num'] = vm.model.commonModel.currentWeekNumber;
            chooseNumberOfTeams(12, 33);
        }

        function startEditStartRoundNumber() {
            vm.model['is_open']['start_round_num'] = true;

            $timeout(function() {
                document.getElementById('inputStartRoundNumber').focus();
                $scope.$apply();
            }, 100, false);
        }

        function startEditNumberOfMatches() {
            vm.model['is_open']['num_matches'] = true;

            $timeout(function() {
                document.getElementById('inputNumberOfMatches').focus();
                $scope.$apply();
            }, 100, false);
        }

        function chooseNumberOfTeams(num) {
            vm.model.leagues.one['req_teams'] = num;
            vm.model.leagues.one['num_matches'] = generateSeasonLength(num);
            vm.model['max_matches'] = 38 - vm.model.leagues.one['start_round_num'] + 1;
            if (vm.model['max_matches'] < vm.model.leagues.one['num_matches']) {
                vm.model.leagues.one['num_matches'] = vm.model['max_matches'];
            }
        }

        function generateSeasonLength(leagueSize) {

            // var x = (38 - vm.model.commonModel.currentWeekNumber);
            // return Math.floor((x/(leagueSize-1)))*(leagueSize-1);

            return (38 - vm.model.commonModel.currentWeekNumber + 1);
        }

        function createLeagueFirstStep() {
            if (vm.model.leagues.one['start_round_num'] < vm.model.commonModel.currentWeekNumber) {
                logger.error('League start week cannot be less than next round');
                vm.model.leagues.one['start_round_num'] = vm.model.commonModel.currentWeekNumber;
                return;
            }
            if (moment().diff(vm.model.leagues.one['draft_time'], 'minutes') > 0) {
                logger.error('Please enter correct date/time for your league.');
                return;
            }
            vm.model.leagues.one['league_type'] = $stateParams.leagueType;
            return requestservice.run('createLeague', {
                league: vm.model.leagues.one
            }).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    logger.success('Your league has been created. You get an email shortly with all of the league\'s details');
                    if ($stateParams.redirectedFromClub) {
                        requestservice.run('acceptInvitation', {
                            'url_params': {
                                ':league_id': received.data.result.id,
                                ':club_id': $stateParams.redirectedFromClub.id
                            }
                        }).then(function (response) {
                            console.log(response);
                            if (response.data.success === 0) {
                                if (response.data.result.league['user_id'].toString() === UserModel.data.id.toString()) {
                                    $state.go('new_league_checklist', {'league_id': received.data.result.id});
                                }
                            } else {
                                logger.error('Could not connect club with new league. Please try again!');
                            }
                        });
                    } else {
                        $state.go('new_club_form', {redirectedFromLeague: received.data.result.id});
                    }
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function changeStartRoundNumber() {
            vm.model.leagues.one['num_matches'] = Math.min(
                vm.model.leagues.one['num_matches'],
                38 - vm.model.leagues.one['start_round_num'] + 1);
        }

        function seasonLengthChanged() {
            vm.model.leagues.one['start_round_num'] = Math.min(
                vm.model.leagues.one['start_round_num'],
                38 - vm.model.leagues.one['num_matches'] + 1
            );
        }
    }
})();
