(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('VirtualFixtureModel', VirtualFixtureModel)
        .factory('EplFixtureModel', EplFixtureModel);

    VirtualFixtureModel.$inject = [];
    /* @ngInject */
    function VirtualFixtureModel() {
        var virtualFixtureModel;

        virtualFixtureModel = {
            one: {},
            data: [],
            clubFixtures: [],
            total: 0,
            paging: {
                'page': 1,
                'per_page': 200
            },
            parse: parse,
            parseClubFixtures: parseClubFixtures,
            clear: clear
        };

        return virtualFixtureModel;

        function parse(data) {
            virtualFixtureModel.data = data.data.result;
            virtualFixtureModel.total = data.data.result.length;
        }

        function parseClubFixtures(data) {
            virtualFixtureModel.clubFixtures = data.data.result;
            virtualFixtureModel.total = data.data.result.length;
        }

        function clear() {
            virtualFixtureModel.data = [];
            virtualFixtureModel.paging.page = 1;
            virtualFixtureModel.total = 0;
        }
    }

    EplFixtureModel.$inject = [];
    /* @ngInject */
    function EplFixtureModel() {
         var eplFixtureModel;

         eplFixtureModel = {
             one: {},
             data: [],
             eplFixtures: [],
             hash: [],
             total: 0,
             paging: {
                 'page': 1,
                 'per_page': 200
             },
             getHash: getHash,
             parse: parse,
             parseEplFixtures: parseEplFixtures,
             clear: clear
         };

         return eplFixtureModel;

         function parse(data) {
             eplFixtureModel.data = data.data.result;
             eplFixtureModel.total = data.data.result.length;
         }

         function parseEplFixtures(data) {
             eplFixtureModel.eplFixtures = data.data.result;
             eplFixtureModel.total = data.data.result.length;
         }

         function clear() {
             eplFixtureModel.data = [];
             eplFixtureModel.paging.page = 1;
             eplFixtureModel.total = 0;
         }

         function getHash(data) {
             eplFixtureModel.hash = data;
         }
     }
})();
