(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('TransfersSettingsController', TransfersSettingsController);

    TransfersSettingsController.$inject = [
        '$state', 'logger', 'requestservice', '$stateParams',
        '$q', 'ClubModel', 'TransferModel', 'moment', '$scope', '$timeout', 'LeagueSettingsModel'
    ];
    /* @ngInject */
    function TransfersSettingsController(
        $state, logger, requestservice, $stateParams, $q,
        ClubModel, TransferModel, moment, $scope, $timeout, LeagueSettingsModel
    ) {
        var vm = this;

        vm.menu = {
            setFinStatus: setFinStatus,
            transferBasicSettingsWasChanged: transferBasicSettingsWasChanged,
            transferAdditDataWasChanged: transferAdditDataWasChanged,
            saveTransfersSettings: saveTransfersSettings,
            restoreDefaultsSettings: restoreDefaultsSettings,
            transfersAddDropSettingsWasChanged: false,
            transfersAdditionalDataWasChanged: false,
            transferDeadlinesWasChanged: false
        };

        vm.model = {
            league: {},
            clubs: ClubModel,
            transfers: TransferModel,
            data: {},
            clubsBudgetForApi: [],
            additionalSettingsForApi: {},

            waiverAuctionDay: null,
            waiverAuctionTime: null,

            weekDays: moment.weekdays(),

            transferDeadlineWeekNumber: null,
            weeks: []
        };

        activate();

        function activate() {
            return $q.all([getTransferBasicSettings(), getLeagueInfo()]).then(function () {});
        }

        function getLeagueInfo() {
            return requestservice.run('oneLeague', {
                'url_params': {
                    ':id': $stateParams['league_id']
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    vm.model.league = received.data.result;
                    vm.model.waiverDate = vm.model.league['waiver_auction_day'];

                    vm.model.waiverAuctionDay = moment(vm.model.league['waiver_auction_day']).format('dddd');
                    vm.model.waiverAuctionTime = moment(vm.model.league['waiver_auction_day']);

                    vm.model.transferDeadlineWeekNumber = vm.model.league['ctc_transfers_deadline_round_number'];
                    vm.model.weeks = new Array(vm.model.league['num_matches']);
                }
                return received;
            });
        }

        function restoreDefaultsSettings() {
            vm.model.transfers.transferSettings['bonus_per_win'] = 2;
            vm.model.transfers.transferSettings['bonus_per_draw'] = 1;
            vm.model.transfers.transferSettings['min_fee_per_add'] = 1;
            vm.model.transfers.transferSettings['trans_addit_set']['annual_transfer_budget'] = 25;
            vm.model.transfers.transferSettings['trans_addit_set']['chairman_vetto'] = true;
            vm.model.waiverAuctionDay = 'Thursday';
            $timeout(function() {
                vm.model.waiverAuctionTime = null;
            });
            $timeout(function() {
                vm.model.waiverAuctionTime = (moment().set({'hour': 12, 'minute': 0}));
                vm.model.waiverAuctionTime = vm.model.waiverAuctionTime.utc().format();
            });
            vm.model.transferDeadlineWeekNumber = vm.model.league['num_matches'];
            vm.menu.transferDeadlinesWasChanged = true;
            vm.menu.transfersAddDropSettingsWasChanged = true;
            vm.menu.transfersAdditionalDataWasChanged = true;
        }

        function saveTransfersSettings() {
            var settingsArray = [],
                sendingData = {};
            if (vm.menu.transfersAddDropSettingsWasChanged) {
                if (checkCashAmountFormat(vm.model.transfers.transferSettings['min_fee_per_add'])) {
                    vm.model.transferSettingsForApi = JSON.parse(JSON.stringify(vm.model.transfers.transferSettings));
                    vm.model.transferSettingsForApi['min_fee_per_add'] = parseFloat(vm.model.transferSettingsForApi['min_fee_per_add']);
                    settingsArray.push('transfer_basic_settings');
                    sendingData['tran_basic_settings'] = vm.model.transferSettingsForApi;
                } else {
                    logger.error('Please, enter minimum fee per add in right format. For example: 99M');
                    return;
                }
                // setTransferBasicSettings();
            }

            if (vm.menu.transfersAdditionalDataWasChanged) {
                if (checkCashAmountFormat(vm.model.transfers.transferSettings['trans_addit_set']['annual_transfer_budget'])) {
                    vm.model.additionalSettingsForApi = JSON.parse(JSON.stringify(vm.model.transfers.transferSettings['trans_addit_set']));
                    vm.model.additionalSettingsForApi['annual_transfer_budget'] = parseFloat(vm.model.additionalSettingsForApi['annual_transfer_budget']);
                    settingsArray.push('transfer_additional_settings');
                    sendingData['trans_addit_set'] = vm.model.additionalSettingsForApi;
                } else {
                    logger.error('Please, enter annual transfer budget in right format. For example: 99M');
                    return;
                }
                // setAdditionalSettings();
            }
            if (vm.menu.transferDeadlinesWasChanged) {
                settingsArray.push('transfer_deadline_settings');
                sendingData['club_to_club_transfer_deadline'] = vm.model.transferDeadlineWeekNumber;
                sendingData['waiver_auction_day'] = returnWaiverDay();
                // saveDeadlineSettings();
            }
            if (parseClubBudgetBeforeSet()) {
                sendingData['clubs_budget'] = vm.model.clubsBudgetForApi;
                // setFinStatus();
            } else {
                logger.error('Please, enter cash amount in right format. For example: 99M');
                return;
            }
            sendingData['settings_for_saving'] = settingsArray;

            LeagueSettingsModel.api.saveLeagueSettings(sendingData, 'Transfer')
                .then(function () {
                    vm.menu.transferDeadlinesWasChanged = false;
                    vm.menu.transfersAddDropSettingsWasChanged = false;
                    vm.menu.transfersAdditionalDataWasChanged = false;
                });
        }

        function returnWaiverDay() {
            var today = moment().weekday();
            var selectedDay = vm.model.weekDays.indexOf(vm.model.waiverAuctionDay);
            var waiverDay;
            if (today >= selectedDay) {
                waiverDay = moment().day(selectedDay + 7);
            } else {
                waiverDay = moment().day(selectedDay);
            }

            waiverDay.set({
                'hours': moment(vm.model.waiverAuctionTime).hours(),
                'minutes': moment(vm.model.waiverAuctionTime).minutes()
            });
            return waiverDay;
        }

        function transferBasicSettingsWasChanged() {
            vm.menu.transfersAddDropSettingsWasChanged = true;
        }

        function transferAdditDataWasChanged() {
            vm.menu.transfersAdditionalDataWasChanged = true;
        }

        function checkCashAmountFormat(budget) {
            return true;
            //var intFormatRegexp = /^(\d*)[M]$/;
            //var floatFormatRegexp = /^(\d*\.\d)[M]$/;

            //var intFormatRegexp = /^(\d*)$/;
            //var floatFormatRegexp = /^(\d*\.\d)$/;
            //if (intFormatRegexp.test(budget) || floatFormatRegexp.test(budget)) {
            //    return true;
            //} else {
            //    return false;
            //}
        }

        function parseClubBudgetBeforeSet() {
            var cashAmountFormatIsValid;
            var cashAmountDataIsValid = true;
            vm.model.clubsBudgetForApi = JSON.parse(JSON.stringify(vm.model.clubs.data));
            vm.model.clubsBudgetForApi.forEach(function(club) {
                cashAmountFormatIsValid = checkCashAmountFormat(club.budget);
                if (cashAmountFormatIsValid) {
                    club.budget = parseFloat(club.budget);
                } else {
                    cashAmountDataIsValid = false;
                }
            });
            return cashAmountDataIsValid;
        }

        function setFinStatus() {
            if (!parseClubBudgetBeforeSet()) {
                logger.error('Please, enter cash amount in right format. For example: 99M');
                return;
            }
            return requestservice.run('setFinStatus', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                },
                'clubs_budget': vm.model.clubsBudgetForApi
            }).then(function (received) {
                console.log('setFinStatus');
                console.log(received);
                if (received.data.success === 0) {
                    logger.success('Allocate funds was saved successfully');
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function getFinStatus() {
            return requestservice.run('getFinStatus', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                console.log('getFinStatus');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.clubs.parseAllocateFundsData(received);
                }
                return received;
            });
        }

        function getTransferBasicSettings() {
            return requestservice.run('getTransferBasicSettings', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                console.log('getTransferBasicSettings');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.transfers.parseTransferSettings(received);
                    console.log(vm.model.transfers.transferSettings);
                }
                getAdditionalSettings();
                return received;
            });
        }

        function setTransferBasicSettings() {
            if (checkCashAmountFormat(vm.model.transfers.transferSettings['min_fee_per_add'])) {
                vm.model.transferSettingsForApi = JSON.parse(JSON.stringify(vm.model.transfers.transferSettings));
                vm.model.transferSettingsForApi['min_fee_per_add'] = parseFloat(vm.model.transferSettingsForApi['min_fee_per_add']);
            } else {
                logger.error('Please, enter minimum fee per add in right format. For example: 99M');
                return;
            }
            return requestservice.run('setTransferBasicSettings', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                },
                'tran_basic_settings': vm.model.transferSettingsForApi
            }).then(function (received) {
                console.log('setTransferBasicSettings');
                console.log(received);
                if (received.data.success === 0) {
                    vm.menu.transfersAddDropSettingsWasChanged = false;
                    logger.success('Transfers add/drop settings was saved successfully');
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function getAdditionalSettings() {
            return requestservice.run('getAdditionalSettings', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                console.log('getAdditionalSettings');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.transfers.parseAdditionalSettings(received);
                }
                return received;
            });
        }

        function setAdditionalSettings() {
            if (checkCashAmountFormat(vm.model.transfers.transferSettings['trans_addit_set']['annual_transfer_budget'])) {
                vm.model.additionalSettingsForApi = JSON.parse(JSON.stringify(vm.model.transfers.transferSettings['trans_addit_set']));
                vm.model.additionalSettingsForApi['annual_transfer_budget'] = parseFloat(vm.model.additionalSettingsForApi['annual_transfer_budget']);
            } else {
                logger.error('Please, enter annual transfer budget in right format. For example: 99M');
                return;
            }
            return requestservice.run('setAdditionalSettings', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                },
                'trans_addit_set': vm.model.additionalSettingsForApi
            }).then(function (received) {
                console.log('setAdditionalSettings');
                console.log(received);
                if (received.data.success === 0) {
                    vm.menu.transfersAdditionalDataWasChanged = false;
                    logger.success('Transfers additional settings were successfully saved');
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function saveDeadlineSettings() {
            var today = moment().weekday();
            var selectedDay = vm.model.weekDays.indexOf(vm.model.waiverAuctionDay);
            var waiverDay;
            if (today >= selectedDay) {
                waiverDay = moment().day(selectedDay + 7);
            } else {
                waiverDay = moment().day(selectedDay);
            }

            waiverDay.set({
                'hours': moment(vm.model.waiverAuctionTime).hours(),
                'minutes': moment(vm.model.waiverAuctionTime).minutes()
            });

            requestservice.run('setTransferDeadlines', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                },
                'club_to_club_transfer_deadline': vm.model.transferDeadlineWeekNumber,
                'waiver_auction_day': waiverDay
            }).then(function(received) {
                if (received.data.success === 0) {
                    vm.menu.transferDeadlinesWasChanged = false;
                    logger.success('Transfer deadline settings were successfully saved');
                } else {
                    logger.error(received.data.message);
                }
            });
        }
    }
})();
