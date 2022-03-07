(function () {
    'use strict';

    angular
        .module('app.club')
        .controller('NewClubFormLinkController', NewClubFormLinkController);

    NewClubFormLinkController.$inject = [
        '$state', 'logger', 'ClubModel', 'CrestShapeModel',
        'requestservice', '$q', '$stateParams', '$base64',
        'UserModel', '$localStorage'
    ];
    /* @ngInject */
    function NewClubFormLinkController(
        $state, logger, ClubModel, CrestShapeModel,
        requestservice, $q, $stateParams, $base64,
        UserModel, $localStorage
    ) {
        var vm = this;

        vm.menu = {
            goChangeFormState: goChangeFormState,
            goCreateClub: goCreateClub,
            selectCurrentShape: selectCurrentShape,
            selectCurrentPattern: selectCurrentPattern,
            checkClubName: checkClubName
        };

        vm.formStates = {
            states: {
                enterName: 'enterName',
                chooseShape: 'chooseShape',
                choosePattern: 'choosePattern',
                chooseColors: 'chooseColors'
            },
            current: '',
            isState: isState
        };

        vm.formStates.current = vm.formStates.states.enterName;

        vm.model = {
            clubs: ClubModel,
            crestShapes: CrestShapeModel
        };

        activate();

        function activate() {
            return $q.all([getCrestShapes()]).then(function() {
                //logger.info('Activated Dashboard View');
            });
        }

        function checkClubName() {
            vm.menu.goChangeFormState(vm.formStates.states.chooseShape);
        }

        function acceptLeagueInvite(clubId, leagueId) {
            requestservice.run('acceptInvitation', {
                'url_params': {
                    ':league_id': leagueId,
                    ':club_id': clubId
                }
            }).then(function (received) {
                console.log('club added to League !!!');
                console.log(received);
                if (received.data.success !== 500) {
                    logger.success('League joined successfully!');
                    console.log(received.data.result);

                    $state.go('dashboard', {
                        ':league_id': leagueId,
                        ':club_id': clubId
                    });
                }
                else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function goCreateClub() {
            vm.model.clubs.one['crest_pattern_id'] = vm.model.crestShapes.selectedPattern.id;
            vm.model.clubs.one['league_code'] = $stateParams['league_id'];
            vm.model.clubs.one['league_id'] = $stateParams['league'];
            if (!UserModel.isSignedIn) {
                delete $localStorage.newClub;
                /*global unescape: true */
                $localStorage.newClub = $base64.encode(unescape(encodeURIComponent(JSON.stringify(vm.model.clubs.one))));
                $state.go(
                    'signup',
                    {
                        email: '',
                        club: JSON.stringify(vm.model.clubs.one)
                    }
                );
            } else {
                return requestservice.run('createClub', {
                    club: vm.model.clubs.one
                }).then(function (received) {
                    console.log(received);
                    if (received.data.success === 0) {
                        logger.success('Your club "' + vm.model.clubs.one.name + '" was created!');
                        console.log('--------- club created for  league invitation');
                        console.log($stateParams);
                        var createdClubId = received.data.result.id;
                        if ($stateParams.redirectedFromInviteLink) {
                            acceptLeagueInvite(createdClubId, $stateParams['league_id']);
                        } else {
                            $state.go('dashboard', {
                                ':league_id': 0,
                                ':club_id': createdClubId
                            });
                        }
                    } else {
                        logger.error(received.data.message);
                    }
                    return received;
                });
            }
        }

        function goChangeFormState(newState) {
            if (vm.formStates.current === vm.formStates.states.enterName) {
                vm.model.clubs.one.name = vm.model.clubs.one.name.trim();
                if (vm.model.clubs.one.name === '') {
                    logger.error('Please enter a name for your club.');
                    return false;
                }
            }
            vm.formStates.current = newState;
        }

        function isState(state) {
            if (vm.formStates.current === state) {
                return true;
            }
            return false;
        }

        function getCrestShapes() {
            vm.model.crestShapes.clear();
            return requestservice.run('crestShapes', {}).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.crestShapes.parse(received);
                }
                return received;
            });
        }

        function selectCurrentShape(event) {
            var hash = null;
            if (window.location.hash) {
                hash = window.location.hash.substring(6); //Puts hash in variable, and removes the # character
            }

            if (hash) {
                vm.model.crestShapes.data.forEach(function(shape) {
                    if (shape.id.toString() === hash.toString()) {
                        vm.model.crestShapes.selectedShape = shape;
                    }
                });
            } else {
                vm.model.crestShapes.selectedShape = vm.model.crestShapes.data[0];
            }
        }

        function selectCurrentPattern(event) {
            var hash = null;
            if (window.location.hash) {
                hash = window.location.hash.substring(8); //Puts hash in variable, and removes the # character
            }

            if (hash) {
                vm.model.crestShapes.selectedShape['crest_patterns'].forEach(function(pattern) {
                    if (pattern.id.toString() === hash.toString()) {
                        vm.model.crestShapes.selectedPattern = pattern;
                    }
                });
            } else {
                vm.model.crestShapes.selectedPattern = vm.model.crestShapes.selectedShape['crest_patterns'][0];
            }
        }

    }
})();
