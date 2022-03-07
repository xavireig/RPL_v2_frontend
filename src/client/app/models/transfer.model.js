(function () {
    'use strict';

    angular
        .module('app.transfers')
        .factory('TransferModel', TransferModel);

    TransferModel.$inject = ['requestservice', 'logger'];
    /* @ngInject */
    function TransferModel(requestservice, logger) {
        var transferModel;

        transferModel = {
            one: {},
            data: [],
            transferSettings: {},
            total: 0,
            paging: {
                'page': 1,
                'per_page': 200
            },
            parse: parse,
            parseTransferSettings: parseTransferSettings,
            parseAdditionalSettings: parseAdditionalSettings,
            clear: clear,
            api: {
                takeFreeAgent: takeFreeAgent,
                dropPlayer: dropPlayer,
                transferTeamToTeam: transferTeamToTeam,
                createWaiverBid: createWaiverBid
            }
        };

        return transferModel;

        function parse(data) {
            transferModel.data = data.data.result;
            transferModel.total = data.data.result.length;
        }

        function parseTransferSettings(data) {
            transferModel.transferSettings = data.data.result['tran_basic_settings'];
            //transferModel.transferSettings['min_fee_per_add'] += 'M';
        }

        function parseAdditionalSettings(data) {
            console.log('skjdhfksjdh ksjdhf ksjdfksjdhf ksjh');
            transferModel.transferSettings['trans_addit_set'] = data.data.result['trans_addit_set'];
            //transferModel.transferSettings['trans_addit_set']['annual_transfer_budget'] += 'M';
        }

        function clear() {
            transferModel.data = [];
            transferModel.paging.page = 1;
            transferModel.total = 0;
        }

        function takeFreeAgent(apiData, success) {
            return requestservice.run('takeFreeAgent', {
                'url_params': {
                    ':id': apiData.clubId
                },
                'virtual_footballer_id': apiData['freeAgentId'],
                'virtual_footballer_engagement_id': apiData['footballerToFreeAgentId'],
                'round_week_num': apiData['roundWeekNum']
            }).then(function (received) {
                console.log('takeFreeAgent');
                console.log(received);
                if (received.data.success === 0) {
                    logger.success('Free agent was taken');
                    if (success) {
                        success();
                    }
                }

                if (received.data.success === 399) {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function dropPlayer(apiData, success) {
            console.log(apiData['virtEngagementId']);
            return requestservice.run('dropPlayer', {
                'url_params': {
                    ':id': apiData['virtEngagementId']
                },
            }).then(function (received) {
                console.log('dropPlayer');
                console.log(received);
                if (received.data.success === 0) {
                    logger.success('Player was dropped');
                    if (success) {
                        success();
                    }
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function transferTeamToTeam(apiData, success) {
            return requestservice.run('transferTeamToTeam', {
                'sender_virtual_club_id': apiData['offererVirtualClubId'],
                'receiver_virtual_club_id': apiData['acceptorVirtualClubId'],
                'offered_virtual_footballer_engagement_ids': apiData['offeredVirtFootballerIdsArray'],
                'requested_virtual_footballer_engagement_ids': apiData['requestedVirtFootballerIdsArray'],
                'requested_virtual_footballer_id': apiData['requestedVirtualFootballerId'],
                'amount': apiData['moneyOffered'],
                'message': apiData['message']
            }).then(function (received) {
                console.log('transferTeamToTeam');
                console.log(received);
                if (received.data.success === 0) {
                    if (success) {
                        success();
                    }
                }
                return received;
            });
        }

        function createWaiverBid(apiData, success) {
            return requestservice.run('createWaiverBid', {
                'club_id': apiData['clubId'],
                'virtual_footballer_id': apiData['footballerId'],
                'money_offered': apiData['moneyOffered'],
                'virtual_engagement_to_drop_id': apiData['footballerToDropId']
            }).then(function (received) {
                console.log('createWaiverBid');
                console.log(received);
                if (received.data.success === 0) {
                    logger.success('Waiver bid was created');
                    if (success) {
                        success();
                    }
                }
                return received;
            });
        }
    }
})();
