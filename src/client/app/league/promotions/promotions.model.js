(function () {
    'use strict';

    angular
        .module('app.league')
        .factory('PromotionsModel', PromotionsModel);

    PromotionsModel.$inject = ['requestservice', 'logger'];
    /* @ngInject */
    function PromotionsModel(requestservice, logger) {
        var promotionsModel;

        promotionsModel = {
            promotion: null
        };

        return promotionsModel;
    }
})();
