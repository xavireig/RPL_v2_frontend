(function () {
    'use strict';

    angular
        .module('app.layout')

        .directive('menuSideBar', menuSideBarDirective);

    menuSideBarDirective.$inject = [
        '$state', '$stateParams', 'logger', 'CommonModel',
        'requestservice', 'ClubModel', '$q', 'config', '$window', 'version'
    ];

    function menuSideBarDirective (
        $state, $stateParams, logger, CommonModel,
        requestservice, ClubModel, $q, config, $window, version
    ) {
        return {
            restrict: 'E',
            replace: true,
            link: link,
            templateUrl: 'app/layout/menu_side_bar.html'
        };

        function link(scope) {
            var vm = scope;

            vm.version = version;

            vm.menu = {
                getActiveStateClass: getActiveStateClass,
                changeState: changeState,
                goClubProfile: goClubProfile,
                goToHelpPage: goToHelpPage,
                leagueId: '',
                currentWeekNumber: '',
                statesOrder: ['club_profile', 'lineup', 'main_league', 'match_day', 'players', 'transfers_page'],
                states: {
                    //dashboard: {
                    //    title: 'my account',
                    //    stateName: 'dashboard',
                    //    data: {}
                    //},
                    'lineup': {
                        title: 'Lineup',
                        stateName: 'lineup',
                        data: {
                            'round_week_num': CommonModel.currentWeekNumber
                        }
                    },
                    'main_league': {
                        title: 'League',
                        stateName: 'main_league',
                        data: {}
                    },
                    'match_day': {
                        title: 'Matchday',
                        stateName: 'match_day',
                        data: {
                            'round_week_num': CommonModel.currentWeekNumber
                        }
                    },
                    'players': {
                        title: 'Players',
                        stateName: 'players',
                        data: {}
                    },
                    'transfers_page': {
                        title: 'Transfers',
                        stateName: 'transfers_page',
                        data: {}
                    },
                    //'news': {
                    //    title: 'News',
                    //    stateName: 'news',
                    //    data: {}
                    //},
                    // 'league_dashboard': {
                    //     title: 'Main',
                    //     stateName: 'league_dashboard',
                    //     data: {}
                    // },
                    'club_profile': {
                        title: 'MY CLUB',
                        stateName: 'club_profile',
                        data: {}
                    }
                }
            };

            vm.model = {
                commonModel: CommonModel,
                clubs: ClubModel,
                clubWasFound: false
            };

            activate();

            function activate() {
                vm.model.commonModel.selectedClub.id = $stateParams['club_id'] || '';
                return $q.all([getMyClubs()]).then(function() {
                    getLeagueClubs();
                    // if ($state.current.name === 'league_dashboard' && vm.model.commonModel.selectedClub.id !== 0) {
                    //     $state.go('league_dashboard', {
                    //         'club_id': vm.model.commonModel.selectedClub.id,
                    //         'league_id': vm.model.commonModel.selectedClub['league_id']
                    //     });
                    // }
                });
            }

            function changeState(state) {
                //temporary condition
                if (!state) {
                    logger.info('This page is not ready yet');
                    return;
                }

                if (beforeStateChange(state)) {
                    $state.go(state, vm.menu.states[state].data);
                }
            }

            function goToHelpPage(anchor) {
                $window.open(config.protocol + '://' + 'www.rotopremierleague.com/game-guide/' + anchor, '_blank');
            }

            function beforeStateChange(state) {
                // if (state === 'news' || state === 'players' || state === 'transfers_page') {
                //     logger.info('Coming soon');
                //     return false;
                // }
                if (vm.model.commonModel.clubsList.length === 0) {
                    logger.info('You don\'t have a club yet. You must either create a new league or join a league by accepting an invite.');
                    return false;
                }

                if (vm.model.commonModel.selectedClub['league_id'] === null) {
                    logger.info('Your club doesn\'t belong to any league. Please, create your own one or accept league invite if any');
                    return false;
                }

                console.log(vm.model.commonModel.selectedClub);
                if (vm.model.commonModel.selectedClub && vm.model.commonModel.selectedClub['league']['draft_status'] === 'processing') {
                    console.log(state);
                    if ((state === 'club_profile' || state === 'lineup' || state==='match_day' || state==='main_league')) {
                        logger.info('Please check back in 5 minutes. We are preparing your line up for the whole season.');
                        return false;
                    }
                } else if (vm.model.commonModel.selectedClub && (vm.model.commonModel.selectedClub['league_id'] === null ||
                        vm.model.commonModel.selectedClub['league']['draft_status'] !== 'completed')) {
                    if (state === 'main_league') {
                        $state.go('league_before_draft', {
                            'league_id': vm.model.commonModel.selectedClub['league_id'] || $stateParams['league_id'],
                            cameFrom: state
                        });
                    } else {
                        logger.error('This page will be available after your league has drafted');
                    }
                    return false;
                }

                vm.menu.states[state].data['league_id'] = vm.model.commonModel.selectedClub['league_id'] || $stateParams['league_id'];
                vm.menu.states[state].data['club_id'] = vm.model.commonModel.selectedClub.id || $stateParams['club_id'];

                return true;
            }

            function getActiveStateClass(menuState) {
                if (menuState === $stateParams.cameFrom || menuState === 'main_league' && $state.current.name === 'league_before_draft' && $stateParams.cameFrom == null) {
                    return {'active': true};
                } else {
                    return {'active': $state.current.name === menuState};
                }
            }

            function getMyClubs() {
                return requestservice.run('listOfClubs', {
                    'page': 1,
                    'per_page': 200
                }).then(function (received) {
                    if (received.data.success === 0) {
                        vm.model.commonModel.parseClubsList(received);
                        console.log('CLUBS menu');
                        console.log(received);

                        if (vm.model.commonModel.clubsList.length === 0) {
                            vm.model.commonModel.selectedClub.id = 0;
                            return;
                        }
                        vm.model.commonModel.clubsList.forEach(function(club) {
                            if (club.id === parseInt(vm.model.commonModel.selectedClub.id) || parseInt($stateParams['league_id']) === club['league_id']) {
                                vm.model.commonModel.selectedClub = club;
                                vm.model.clubWasFound = true;
                            }
                        });
                        if (!vm.model.clubWasFound) {
                            vm.model.commonModel.selectedClub = vm.model.commonModel.clubsList[0];
                        }
                    }
                    return received;
                });
            }

            function getLeagueClubs() {
                if (vm.model.commonModel.leagueClubs.length === 0) {
                    return requestservice.run('oneLeague', {
                        'url_params': {
                            ':id': vm.model.commonModel.selectedClub['league_id']
                        }
                    }).then(function (received) {
                        console.log('oneLeague');
                        console.log(received);
                        if (received.data.success === 0) {
                            vm.model.commonModel.leagueClubs = received.data.result.clubs;
                            //vm.model.commonModel.selectedLeagueClubId = received.data.result.clubs[0].id;
                        }
                        return received;
                    });
                }
            }

            function goClubProfile() {
                if (vm.model.commonModel.selectedClub.league['draft_status'] !== 'completed') {
                    logger.info('This page will be available after your league will get drafted');
                    return;
                }
                var currentLeagueId;
                vm.model.commonModel.leagueClubs.forEach(function(club) {
                    if (club.id === vm.model.commonModel.selectedLeagueClubId) {
                        currentLeagueId = club['league_id'];
                    }
                });

                $state.go('club_profile', {
                    'league_id': $stateParams['league_id'] || currentLeagueId,
                    'club_id': vm.model.commonModel.selectedLeagueClubId
                });
            }
        }
    }
})();
