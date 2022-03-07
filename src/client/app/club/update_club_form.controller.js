(function () {
    'use strict';

    angular
        .module('app.club')
        .controller('UpdateClubFormController', UpdateClubFormController);

    UpdateClubFormController.$inject = [
        '$state', 'logger', 'ClubModel', 'CrestShapeModel',
        'requestservice', '$q', '$stateParams', '$base64',
        'UserModel', '$timeout', 'CommonModel'
    ];
    /* @ngInject */
    function UpdateClubFormController(
        $state, logger, ClubModel, CrestShapeModel,
        requestservice, $q, $stateParams, $base64,
        UserModel, $timeout, CommonModel
    ) {
        var vm = this;

        vm.menu = {
            goChangeFormState: goChangeFormState,
            goUpdateClub: goUpdateClub,
            selectCurrentShape: selectCurrentShape,
            selectCurrentPattern: selectCurrentPattern,
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
            commonModel: CommonModel,
            crestShapes: CrestShapeModel,
            userEmail: $base64.decode($stateParams['base64email'])
        };

        activate();

        function activate() {
            console.log('id');
            console.log($stateParams['club_id']);
            getMyClubs().then(function() {
                vm.model.commonModel.clubsList.forEach(function(club) {
                    console.log('club');
                    console.log(club);

                    if (club.id.toString() === $stateParams['club_id'].toString()) {
                        vm.model.clubs.one = club;
                    }
                    console.log('Club one');
                    console.log(vm.model.clubs.one);
                });
                vm.menu.goChangeFormState(vm.formStates.states.chooseShape);
            });
            //vm.model.commonModel.clubsList.forEach(function(club) {
            //    console.log('club');
            //    console.log(club);
            //
            //    if (club.id.toString() === $stateParams['club_id'].toString()) {
            //        vm.model.clubs.one = club;
            //    }
            //    console.log('Club one');
            //    console.log(vm.model.clubs.one);
            //});
            //vm.menu.goChangeFormState(vm.formStates.states.chooseShape);

            return $q.all([getCrestShapes()]).then(function() {
                //logger.info('Activated Dashboard View');
            });
        }

        function goUpdateClub() {
            vm.model.clubs.one['crest_pattern_id'] = vm.model.crestShapes.selectedPattern.id;

            return requestservice.run('updateClub', {
                'url_params': {
                    ':id': vm.model.clubs.one.id
                },
                club: vm.model.clubs.one
            }).then(function (received) {
                console.log('updateClub');
                console.log(received);
                if (received.data.success === 0) {
                    logger.success('Your club "' + vm.model.clubs.one.name + '" was updated!');
                    $state.go('dashboard', {
                        'club_id': received.data.result.id,
                        'league_id': received.data.result['league_id']
                    });
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
            $timeout(function() {
                if (newState === 'chooseShape') { window.location.hash = '#shape' + vm.model.clubs.one['crest_pattern']['crest_shape_id']; }
                if (newState === 'choosePattern') { window.location.hash = '#pattern' + vm.model.clubs.one['crest_pattern_id']; }
            }, 100);

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

        function getMyClubs() {
            return requestservice.run('listOfClubs', {
                'page': 1,
                'per_page': 200
            }).then(function (received) {
                if (received.data.success === 0) {
                    vm.model.commonModel.parseClubsList(received);
                }
                return received;
            });
        }

    }
})();
