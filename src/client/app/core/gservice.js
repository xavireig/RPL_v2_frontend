(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('gservice', gservice);

    gservice.$inject = ['logger', '$timeout'];
    /* @ngInject */
    function gservice(logger, $timeout) {

        var service = {
            splitEmailsByComma: splitEmailsByComma
        };

        return service;

        function splitEmailsByComma(sendEmails) {
            var listStrings = sendEmails.split(',');
            var incorrectEmailsIds = [];
            var correctEmailsList = [];
            var emailRegex = /^([a-z0-9_\.\+-]+)@([a-z0-9_\.-]+)\.([a-z\.]{2,6})$/;
            for (var ind = 0; ind < listStrings.length; ind++) {
                listStrings[ind] = listStrings[ind].trim();
                if (emailRegex.test(listStrings[ind])) {
                    correctEmailsList.push(listStrings[ind]);
                } else {
                    incorrectEmailsIds.push(ind + 1);
                }
            }

            return {
                correctEmailsList: correctEmailsList,
                incorrectEmailsIds: incorrectEmailsIds
            };
        }
    }
})();
