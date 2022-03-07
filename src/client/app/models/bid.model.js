(function () {
    'use strict';

    angular
        .module('app.bids')
        .factory('BidModel', BidModel);

    BidModel.$inject = ['requestservice', 'logger'];
    /* @ngInject */
    function BidModel(requestservice, logger) {
        var bidModel;

        bidModel = {
            one: {},
            data: [],
            'requested_bids_virt_footballers': {
                'offered_footballers': {},
                'requested_footballers': {}
            },
            notApprovedBids: [],
            total: 0,
            paging: {
                'page': 1,
                'per_page': 200
            },
            parse: parse,
            parseFootballers: parseFootballers,
            clear: clear,
            api: {
                acceptBid: acceptBid,
                rejectBid: rejectBid
            }
        };

        return bidModel;

        function parse(data) {
            bidModel.data = data.data.result;
            bidModel.total = data.data.result.length;
        }

        function parseFootballers(footballers) {
            var parsedFootballers = {};
            footballers.forEach(function(virtFootballer) {
                parsedFootballers[virtFootballer.id] = virtFootballer;
            });

            return parsedFootballers;
        }

        function clear() {
            bidModel.data = [];
            bidModel.paging.page = 1;
            bidModel.total = 0;
        }

        function acceptBid(id) {
            return requestservice.run('acceptBid', {
                'id': id,
                'from_admin': false
            }).then(function (received) {
                console.log('acceptBid');
                console.log(received);
                if (received.data.success === 0) {
                    logger.success('Bid accepted successfully. Check out your new lineup!');
                }
                return received;
            });
        }

        function rejectBid(id) {
            return requestservice.run('rejectBid', {
                'id': id
            }).then(function (received) {
                console.log('rejectBid');
                console.log(received);
                if (received.data.success === 0) {
                    logger.success('Bid rejected successfully');
                }
                return received;
            });
        }
    }
})();
