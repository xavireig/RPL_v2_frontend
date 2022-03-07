(function () {
    'use strict';

    angular
        .module('app.transfers')
        .controller('TransfersController', TransfersController);

    TransfersController.$inject = [
        '$state', 'logger', 'requestservice', '$stateParams',
        '$q', 'LineUpModel', '$scope', 'CommonModel', 'TransferModel',
        'ngDialog', '$mdDialog', '$timeout'
    ];
    /* @ngInject */
    function TransfersController(
        $state, logger, requestservice, $stateParams,
        $q, LineUpModel, $scope, CommonModel, TransferModel,
        ngDialog, $mdDialog, $timeout
    ) {
        var vm = this;

        vm.menu = {
            returnSelectedPlayerStyle: returnSelectedPlayerStyle,
            closeDialog: closeDialog,
            takeFreeAgent: takeFreeAgent,
            makeTeamToTeamTransfer: makeTeamToTeamTransfer,
            makeBetOnTheWaiver: makeBetOnTheWaiver,
            choosePlayerForDrop: choosePlayerForDrop,
            choosePlayerForAdd: choosePlayerForAdd,
            removePlayerFrom: removePlayerFrom,
            checkMSymbol: checkMSymbol,
            checkEnterNumber: checkEnterNumber,

            openMenu: openMenu,
            getOwnerFootballersList: getOwnerFootballersList,
        };

        vm.model = {
            commonModel: CommonModel,
            counterOffer: false,
            lineUp: LineUpModel,
            acceptorLineUp: {},
            senderLineUp: {},
            chosenFootballerForAdd: {},
            freeAgent: {},
            waiver: {},
            footballerToFreeAgent: {},
            footballersForAddHash: {},
            footballersForDropHash: {},
            moneyOffered: 1.0,//'0.0M',
            senderLineUpWasLoad: false,
            acceptorLineUpWasLoad: null,
            leagueSquadSize: 10,
            message: {},
            chosenPlayerForAdd: {},
            chosenFootballerFromClub: {},
            virtEngagementId: ''
        };

        activate();

        function activate() {
            vm.model.roundWeekNum = vm.model.commonModel.currentWeekNumber;
            console.log('Current Week Number');
            console.log(vm.model.commonModel.currentWeekNumber);
            if ($scope.ngDialogData['dialogType'] === 'betOnTheWaiver') {
                vm.model.waiver = $scope.ngDialogData['waiver'];
                vm.model.offerer = $scope.ngDialogData['offerer'];
                vm.model.roundWeekNum = $scope.ngDialogData['currentRound'];
                getCurrentLeague().then(function() {
                    getUserFootballersList();
                    vm.model.afterTransfer = $scope.ngDialogData['afterTransfer'];
                });
                vm.model.afterTransfer = $scope.ngDialogData['afterTransfer'];
                vm.model.moneyOffered = $scope.ngDialogData['moneyOffered'] || vm.model.moneyOffered;
                return;
            }

            if ($scope.ngDialogData['dialogType'] === 'takeFreeAgent') {
                vm.model.freeAgent = $scope.ngDialogData['freeAgent'];
                vm.model.offerer = $scope.ngDialogData['offerer'];
                vm.model.roundWeekNum = $scope.ngDialogData['currentRound'];
                console.log(vm.model.roundWeekNum);
                getCurrentLeague().then(function(){
                    getUserFootballersList();
                    vm.model.afterTransfer = $scope.ngDialogData['afterTransfer'];
                });
                vm.model.afterTransfer = $scope.ngDialogData['afterTransfer'];
                return;
            }

            if ($scope.ngDialogData['dialogType'] === 'editTransfer') {
                vm.model.footballersForDropHash = $scope.ngDialogData['footballersForDropHash'];
                vm.model.footballersForAddHash = $scope.ngDialogData['footballersForAddHash'];
                vm.model.acceptor = $scope.ngDialogData['acceptor'];
                vm.model.offerer = $scope.ngDialogData['offerer'];
                vm.model.moneyOffered = $scope.ngDialogData['moneyOffered'];
            }

            if ($scope.ngDialogData['dialogType'] === 'createTransfer') {
                if ($scope.ngDialogData['chosenPlayerForAdd']) {
                    vm.model.chosenPlayerForAdd = $scope.ngDialogData['chosenPlayerForAdd'];
                    console.log('Chosen Player for Add');
                    console.log(vm.model.chosenPlayerForAdd);
                } else {
                    vm.model.chosenPlayerForAdd = null;
                }

                if ($scope.ngDialogData['chosenFootballerFromClub']) {
                    vm.model.chosenFootballerFromClub = $scope.ngDialogData['chosenFootballerFromClub'];
                    vm.model.virtEngagementId = $scope.ngDialogData['virtEngagementId'];
                    console.log('chosen footballer from club');
                    console.log(vm.model.chosenFootballerFromClub);
                    vm.model.footballersForAddHash[vm.model.virtEngagementId] = vm.model.chosenFootballerFromClub;
                    console.log(vm.model.footballersForAddHash);
                }
                vm.model.acceptor = $scope.ngDialogData['acceptor'];
                vm.model.offerer = $scope.ngDialogData['offerer'];
                vm.model.counterOffer = $scope.ngDialogData['counterOffer'];
                vm.model.message = $scope.ngDialogData['message'];
            }

            vm.model.afterTransfer = $scope.ngDialogData['afterTransfer'];

            return $q.all([getCurrentLeague()]).then(function () {
                getUserFootballersList();
                getOwnerFootballersList();
            });
        }

        function returnSelectedPlayerStyle(player) {
            return {
                'checked-player': vm.model.footballersForAddHash[player.id] || vm.model.footballersForDropHash[player.id]
            };
        }

        function choosePlayerForAdd(player) {
            vm.model.footballersForAddHash[player.id] = player;
            $timeout(function() {
                $scope.$apply(function() {
                    vm.model.playerForAdd = null;
                });
            });
        }

        $scope.footballersForAddHashEmpty = function() {
            console.log(vm.model.footballersForAddHash);
            return vm.model.footballersForAddHash === {};
        }

        function choosePlayerForDrop(player) {
            vm.model.footballersForDropHash[player.id] = player;
            $timeout(function() {
                $scope.$apply(function() {
                    vm.model.playerForAdd = null;
                });
            });
        }

        function removePlayerFrom(player, hashSuffix) {
            delete vm.model['footballersFor' + hashSuffix + 'Hash'][player.id];
        }

        function checkCashAmountFormat() {
            //var intFormatRegexp = /^(\d*)[M]$/;
            //var floatFormatRegexp = /^(\d+\.\d)[M]$/;
            var intFormatRegexp = /^(\d*)$/;
            var floatFormatRegexp = /^(\d+\.\d)$/;
            if (intFormatRegexp.test(vm.model.moneyOffered) || floatFormatRegexp.test(vm.model.moneyOffered)) {
                return true;
            } else {
                return false;
            }
        }

        function checkMSymbol() {
            console.log(vm.model.moneyOffered);
            var formatRegexp = /^.*[M]$/;
            var countSymbolRegexp = /[M]/;
            if (!formatRegexp.test(vm.model.moneyOffered) && !countSymbolRegexp.test(vm.model.moneyOffered)) {
                vm.model.moneyOffered += 'M';
            }
        }

        function makeTeamToTeamTransfer(footballer) {

            var cashAmountFormatIsValid = checkCashAmountFormat();
            if (!cashAmountFormatIsValid) {
                logger.error('Please, enter cash amount in right format. For example: 99M or 999.9M.');
                return;
            }

            if (vm.model.acceptorLineUpWasLoad === null) {
                logger.error('Select please team from "Fantasy team" dropdown.');
                return;
            }

            if (!vm.model.senderLineUpWasLoad || vm.model.acceptorLineUpWasLoad === false) {
                logger.info('Please wait a moment. Data load in process.');
                return;
            }

            ngDialog.open({
                template: 'app/transfers/confirm_transfer_dialog.html',
                className: 'transfer-dialog ngdialog-theme-default',
                controller: 'ConfirmTransferController',
                controllerAs: 'vm',
                data: {
                    confirmType: 'team_to_team',
                    footballersForDropHash: vm.model.footballersForDropHash,
                    footballersForAddHash: vm.model.footballersForAddHash,
                    moneyOffered: vm.model.moneyOffered,
                    acceptor: vm.model.acceptor,
                    offerer: $scope.ngDialogData['offerer'],
                    afterTransfer: $scope.ngDialogData['afterTransfer'] || angular.noop,
                    counterOffer: vm.model.counterOffer,
                    message: vm.model.message,
                    requestedVirtualFootballer: vm.model.chosenPlayerForAdd
                }
            });
            $scope.closeThisDialog();
        }

        function takeFreeAgent() {
            var apiData = {
                clubId: $stateParams['club_id'] || vm.model.commonModel.selectedClub.id,
                freeAgentId: vm.model.freeAgent.id,
                footballerToFreeAgentId: vm.model.footballerToFreeAgent.id,
                roundWeekNum: vm.model.roundWeekNum
            };
            TransferModel.api.takeFreeAgent(apiData, false).then(function(data) {
                if (data.data.success === 0) {
                    vm.model.afterTransfer(true);
                    $scope.closeThisDialog();
                }

                if (data.data.success === 701 || data.data.success === 702) {
                    logger.error(data.data.message);
                }
            });
        }

        function makeBetOnTheWaiver() {
            console.log('make bet waiver');
            console.log(vm.model.waiver);
            console.log(vm.model.footballerToFreeAgent);
            var cashAmountFormatIsValid = checkCashAmountFormat();
            if (!cashAmountFormatIsValid) {
                logger.error('Please, enter cash amount in right format. For example: 99M or 999.9M');
                return;
            }
            ngDialog.open({
                template: 'app/transfers/confirm_transfer_dialog.html',
                className: 'transfer-dialog ngdialog-theme-default',
                controller: 'ConfirmTransferController',
                controllerAs: 'vm',
                data: {
                    confirmType: 'waiver',
                    waiver: vm.model.waiver,
                    clubId: vm.model.offerer.id,
                    moneyOffered: vm.model.moneyOffered,
                    afterTransfer: $scope.ngDialogData['afterTransfer'],
                    footballerToDrop: vm.model.footballerToFreeAgent
                }
            });
            $scope.closeThisDialog();
        }

        function closeDialog() {
            clearTeamToTeamData();
            $scope.closeThisDialog();
        }

        function clearTeamToTeamData() {
            vm.model.footballersForAdd = [];
            vm.model.footballersForDrop = [];
        }

        function getCurrentLeague() {
            return requestservice.run('oneLeague', {
                'url_params': {
                    ':id': $stateParams['league_id']
                }
            }).then(function (received) {
                console.log('League');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.leagueSquadSize = received.data.result['squad_size'];
                    console.log('vm.model.leagueSquadSize');
                    console.log(vm.model.leagueSquadSize);

                    vm.model.firstWeek = received.data.result['start_round_num'];
                    vm.model.lastWeek = received.data.result['start_round_num'] + received.data.result['num_matches'];
                    if (vm.model.roundWeekNum < vm.model.firstWeek) {
                        vm.model.roundWeekNum = vm.model.firstWeek;
                        console.log(vm.model.roundWeekNum);
                    }
                    if (vm.model.roundWeekNum > vm.model.lastWeek) {
                        vm.model.roundWeekNum = vm.model.lastWeek;
                    }
                    console.log(vm.model.roundWeekNum);
                }
                return received;
            });
        }

        function getUserFootballersList() {
            return requestservice.run('getLineUpData', {
                'url_params': {
                    ':club_id': vm.model.offerer.id || vm.model.commonModel.selectedClub.id,
                    ':round_week_num': vm.model.roundWeekNum
                }
            }).then(function (received) {
                console.log('Bid sender club LineUp');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.senderLineUp = vm.model.lineUp.parseByPositionName(received, true);
                    console.log(vm.model.senderLineUp);
                }
                vm.model.senderLineUpWasLoad = true;
                vm.menu.lineUpIsLoad = true;
                return received;
            });
        }

        function getOwnerFootballersList() {
            console.log('acceptor model -->' + vm.model.acceptor);
            if (!vm.model.acceptor) {
                return;
            }

            // vm.model.footballersForAddHash = {};
            if ($scope.ngDialogData['dialogType'] === 'createTransfer') {
                if ($scope.ngDialogData['chosenFootballerForAdd']) {
                    vm.model.chosenFootballerForAdd = $scope.ngDialogData['chosenFootballerForAdd'];
                    vm.model.footballersForAddHash[vm.model.chosenFootballerForAdd.id] = vm.model.chosenFootballerForAdd;
                }
                if ($scope.ngDialogData['acceptor']) {
                    vm.model.acceptor = $scope.ngDialogData['acceptor'];
                }
                if ($scope.ngDialogData['offerer']) {
                    vm.model.offerer = $scope.ngDialogData['offerer'];
                }
            }
            vm.model.acceptorLineUpWasLoad = false;
            return requestservice.run('getLineUpDataByClub', {
                'url_params': {
                    ':club_id': vm.model.acceptor.id,
                    ':round_week_num':  vm.model.roundWeekNum
                }
            }).then(function (received) {
                console.log('Bid receiver club lineUp');
                if (received.data.success === 0) {
                    vm.model.acceptorLineUp = vm.model.lineUp.parseByPositionName(received, true);
                    console.log(vm.model.acceptorLineUp);
                }
                vm.model.acceptorLineUpWasLoad = true;
                vm.menu.lineUpIsLoad = true;
                return received;
            });
        }

        function checkEnterNumber(event) {
            if (event.type === 'keydown') {
                return getKeyDown(event);
            } else if (event.type === 'keyup') {
                return getKeyUp();
            }
            return true;
        }

        function getKeyDown(event) {
            if ((event.keyCode >= 48 &&  event.keyCode <= 57) || event.keyCode === 38 || event.keyCode === 40) {
                return true;
            } else if (event.keyCode === 190 || event.keyCode === 110) {
                vm.model.moneyOffered = parseFloat(vm.model.moneyOffered + '.1');
            } else if (event.keyCode === 8) {
                vm.model.moneyOffered = parseFloat(event.target.value.substring(0, event.target.value.length - 1));
            }
            event.preventDefault();
            return false;
        }

        function getKeyUp() {
            if (vm.model.moneyOffered === undefined) {
                vm.model.moneyOffered = parseFloat(event.target.value.substring(0, event.target.value.length - 1));
                return false;
            }
            vm.model.moneyOffered = parseFloat(vm.model.moneyOffered.toFixed(1));
            return true;
        }

        function openMenu($mdOpenMenu, ev) {
            $mdOpenMenu(ev);
        }
    }
})();
