(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('DraftSettingsController', DraftSettingsController);

    DraftSettingsController.$inject = [
        '$state', 'logger', '$stateParams',
        '$q', 'requestservice', 'ClubModel',
        'moment', '$', 'CommonModel', 'UserModel', 'LeagueSettingsModel'
    ];
    /* @ngInject */
    function DraftSettingsController(
        $state, logger, $stateParams,
        $q, requestservice, ClubModel,
        moment, $, CommonModel, UserModel, LeagueSettingsModel
    ) {
        var vm = this;

        vm.menu = {
            treeOptions: {
                accept: allowDrop
            },
            datePicker: {},
            saveChanges: saveChanges,
            setTimePerPickUnit: setTimePerPickUnit,
            blockForAction: blockForAction,
            returnLeagueDraftTimeInFormat: returnLeagueDraftTimeInFormat,

            randomizeLeagueDraftQueues: randomizeLeagueDraftQueues,
            goNextOwlCarousel: goNextOwlCarousel,
            goPrevOwlCarousel: goPrevOwlCarousel,
            getCarouselPosition: getCarouselPosition
        };

        vm.model = {
            commonModel: CommonModel,
            userModel: UserModel,
            carouselItems: {
                count: null,
                index: null
            },
            leagueDraftQueueArray: [],

            leagueClubsArray: [],
            leagueClubsHash: ClubModel.clubsHash,

            leagueDraftSettings: {
                timePerPick: '',
                timePerPickUnit: ''
            },
            draftQueues: []
        };

        activate();

        function activate() {
            getLeagueSquadSize();
            $q.all([getLeagueDraftSettings()]).then(function () {});
            $q.all([getLeagueClubsList(), getLeagueDraftQueues()]).then(function() {});
        }

        function getLeagueSquadSize() {
            console.log('$stateParams');
            console.log($stateParams);

            return requestservice.run('getLeagueSquadSize', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    vm.model.draftRounds = new Array(received.data.result);
                }
                return received;
            });
        }

        function getCarouselPosition(event) {
            vm.model.carouselItems = event.item;
        }
        function goPrevOwlCarousel() {
            $('#data-owl-carousel').trigger('prev.owl');
        }
        function goNextOwlCarousel() {
            $('#data-owl-carousel').trigger('next.owl');
        }

        function allowDrop(source, destination) {
            return source.$parent.$id === destination.$id;
        }

        function returnLeagueDraftTimeInFormat() {
            return moment(vm.model.leagueDraftSettings['draft_time']).format('MMM D, YYYY h:mma');
        }

        function getLeagueDraftQueues() {
            return requestservice.run('getLeagueDraftQueue', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                console.log('getLeagueDraftQueue');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.draftQueues = received.data.result;
                    console.log('Draft queues');
                    console.log(vm.model.draftQueues);
                } else {
                    logger.error(received.data.message);
                }
            });
        }

        function getLeagueDraftSettings() {
            return requestservice.run('getLeagueDraftSettings', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                console.log('getLeagueDraftSettings');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.leagueDraftSettings.timePerPick = received.data.result['time_per_pick'];
                    vm.model.leagueDraftSettings.timePerPickUnit = received.data.result['time_per_pick_unit'];
                    vm.model.leagueDraftSettings['draft_time'] = received.data.result['draft_time'];
                    vm.model.leagueDraftSettings['draft_status'] = received.data.result['draft_status'];
                    vm.model.receivedDraftTime = received.data.result['draft_time'];
                } else {
                    logger.error(received.data.message);
                }
            });
        }

        function getLeagueClubsList() {
            return requestservice.run('getLeagueClubsList', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                console.log('getLeagueClubsList');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.leagueClubsArray = received.data.result['clubs_list'];
                    ClubModel.parseToHashBy(received.data.result['clubs_list'], 'id');
                    console.log('Parsed league clubs list');
                    console.log(vm.model.leagueClubsHash);
                } else {
                    logger.error(received.data.message);
                }
            });
        }

        function saveChanges() {
            if (vm.model.leagueDraftSettings['draft_status'] !== 'pending') {
                return;
            }

            var sendingData = {
                'new_draft_time': vm.model.leagueDraftSettings['draft_time'],
                'time_per_pick': vm.model.leagueDraftSettings.timePerPick,
                'time_per_pick_unit': vm.model.leagueDraftSettings.timePerPickUnit
            },
            settingsArray = ['draft_time_settings'];
            settingsArray.push('draft_order_settings');
            sendingData['queue'] = vm.model.draftQueues['club_queue_list'];
            sendingData['settings_for_saving'] = settingsArray;
            LeagueSettingsModel.api.saveLeagueSettings(sendingData, 'Draft')
                .then(function () {

                });
            // updateDraftQueues();
            // setLeagueDraftTime();
            // setTimePerPick();
        }

        function blockForAction() {
            return vm.model.leagueDraftSettings['draft_status'] !== 'pending' ||
                vm.model.commonModel.selectedClub.league['user_id'] !== vm.model.userModel.data.id;
        }

        function setTimePerPickUnit(unitType) {
            vm.model.leagueDraftSettings.timePerPickUnit = unitType;
        }

        function setLeagueDraftTime() {
            return requestservice.run('setLeagueDraftTime', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                },
                'new_draft_time': vm.model.leagueDraftSettings['draft_time']
            }).then(function (received) {
                console.log('setLeagueDraftTime');
                console.log(received);
                if (received.data.success === 0) {
                    logger.success('League draft time was changed successfully');
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function setTimePerPick() {
            return requestservice.run('setTimePerPick', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                },
                'time_per_pick': vm.model.leagueDraftSettings.timePerPick,
                'time_per_pick_unit': vm.model.leagueDraftSettings.timePerPickUnit
            }).then(function (received) {
                console.log('setTimePerPick');
                console.log(received);
                if (received.data.success === 0) {
                    logger.success('League time per pick settings was changed successfully');
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function randomizeLeagueDraftQueues() {
            vm.model.draftQueues['club_queue_list'] = shuffleArray(vm.model.draftQueues['club_queue_list']);
        }

        function randomizeOneDraftQueue(draftQueue) {
            draftQueue['club_queue_list'] = shuffleArray(draftQueue['club_queue_list']);
        }

        function reverseOneDraftQueue(draftQueue, previousDraftQueue) {
            draftQueue['club_queue_list'] = reverseArray(previousDraftQueue['club_queue_list']);
        }

        function shuffleArray(array) {
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
        }

        function reverseArray(array) {
            return array.slice().reverse();
        }

        function updateOneQueue(draftQueue, draftType) {
            return requestservice.run('updateClubsOrderInDraftQueue', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                },
                'draft_queue': draftQueue['club_queue_list'],
                'cur_iter': draftQueue['cur_iter'],
                'queue_type': draftType
            }).then(function (received) {
                if (received.data.success === 0) {
                    logger.success('Clubs order in league draft queue was changed successfully');
                    console.log(received);
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function updateDraftQueues() {
            if (vm.model.customDraftOrder) {
                vm.model.draftQueues.forEach(function(draftQueue) {
                    updateOneQueue(draftQueue, 'custom');
                });
            } else {
                $q.all([updateOneQueue(vm.model.draftQueues[0], 'snake')]).then(getLeagueDraftQueues);
            }
        }
    }
})();
