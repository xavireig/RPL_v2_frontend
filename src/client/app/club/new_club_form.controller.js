(function () {
    'use strict';

    angular
        .module('app.club')
        .controller('NewClubFormController', NewClubFormController);

    NewClubFormController.$inject = [
        '$state', 'logger', 'ClubModel', 'CrestShapeModel',
        'requestservice', '$q', '$stateParams', '$base64',
        'UserModel', '$scope', 'ngDialog', '$rootScope'
    ];
    /* @ngInject */
    function NewClubFormController(
        $state, logger, ClubModel, CrestShapeModel,
        requestservice, $q, $stateParams, $base64,
        UserModel, $scope, ngDialog, $rootScope
    ) {
        var vm = this;

        vm.menu = {
            goChangeFormState: goChangeFormState,
            goCreateClub: goCreateClub,
            selectCurrentShape: selectCurrentShape,
            selectCurrentPattern: selectCurrentPattern,
            checkClubName: checkClubName,
            changePattern: changePattern,
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
            crestShapes: CrestShapeModel,
            userEmail: $base64.decode($stateParams['base64email'])
        };

        activate();

        function activate() {
            return $q.all([getCrestShapes()]).then(function() {
                //logger.info('Activated Dashboard View');

                vm.model.crestShapes.selectedShape = vm.model.crestShapes.data[0];
                vm.model.crestShapes.selectedPattern = vm.model.crestShapes.selectedShape['crest_patterns'][0];

            });
        }

        function changePattern() {
            vm.model.crestShapes.selectedShape = vm.model.crestShapes.data[1];
        }

        function acceptLeagueInvite(clubId) {
            requestservice.run('acceptInvitation', {
                'url_params': {
                    ':league_id': $stateParams.redirectedFromLeague,
                    ':club_id': clubId
                }
            }).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    console.log('Came after league');
                    console.log(received.data.result);
                    if (received.data.result.league['user_id'].toString() === UserModel.data.id.toString()) {
                        $state.go('new_league_checklist', {'league_id': $stateParams.redirectedFromLeague});
                    } else {
                        $state.go('dashboard', {
                            'club_id': clubId,
                            'league_id': $stateParams.redirectedFromLeague
                        });
                    }
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function checkClubName() {
            return requestservice.run('checkClubName', {
                'club_name': vm.model.clubs.one.name
            }).then(function (received) {
                console.log('checkClubName');
                console.log(received);
                if (received.data.success === 0) {
                    vm.menu.goChangeFormState(vm.formStates.states.chooseShape);
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });

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
                        $scope.isShapeChanged = shape;
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

        function goCreateClub() {
            if (!vm.model.clubs.one.name) {
                logger.error('Club name cannot be empty!');
            } else {
                if ($stateParams.redirectedFromLeague) {
                    vm.model.clubs.one['crest_pattern_id'] = vm.model.crestShapes.selectedPattern.id;
                    return requestservice.run('createClub', {
                        club: vm.model.clubs.one
                    }).then(function (received) {
                        if (received.data.success === 0) {
                            logger.success('Your club "' + vm.model.clubs.one.name + '" was created!');
                            var createdClubId = received.data.result.id;
                            acceptLeagueInvite(createdClubId);
                        } else {
                            logger.error(received.data.message);
                        }
                    });
                } else {
                    vm.model.clubs.one['crest_pattern_id'] = vm.model.crestShapes.selectedPattern.id;
                    $rootScope.club = vm.model.clubs.one;
                    ngDialog.open({
                        templateUrl: 'app/auth/landing_page_modal.html',
                        controller: ['$rootScope', '$scope', function($rootScope, $scope) {
                            var vm = this;
                            vm.templateName = 'app/auth/signup.html';
                            $scope.$on('goSignIn', function (event, arg) {
                                vm.templateName = arg;
                            });
                            $scope.$on('goForgotPassword', function (event, arg) {
                                vm.templateName = arg;
                            });
                            $scope.$on('goSignUp', function (event, arg) {
                                vm.templateName = arg;
                            });
                        }],
                        controllerAs: 'vm',
                    });
                }
            }
        }
    }
})();
