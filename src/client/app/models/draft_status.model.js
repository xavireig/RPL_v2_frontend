(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('DraftStatusModel', DraftStatusModel);

    DraftStatusModel.$inject = ['moment'];
    /* @ngInject */
    function DraftStatusModel(moment) {
        var draftStatusModel;

        draftStatusModel = {
            data: {},
            'timer_milliseconds': 0,
            parse: parse,
            clear: clear
        };

        return draftStatusModel;

        function parse(data) {
            draftStatusModel.data = data.data.result;
            draftStatusModel['timer_milliseconds'] = moment().unix() * 1000 + draftStatusModel.data['time_to_end_step'] * 1000;
            // var rev = JSON.parse(JSON.stringify(draftStatusModel.data['short_status']['club_queue_list']));
            // draftStatusModel.data['short_status']['club_queue_list'] = draftStatusModel.data['short_status']['club_queue_list'].concat(rev.reverse());
        }

        function clear() {
            draftStatusModel.data = {};
        }
    }
})();
