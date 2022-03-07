(function () {
    'use strict';

    angular
        .module('app.core')
        .controller('LeagueAcceptedInviteController', LeagueAcceptedInviteController);

    LeagueAcceptedInviteController.$inject = [
        '$state', 'logger', 'requestservice', '$stateParams',
        '$q', '$scope', 'moment', 'NewsModel',
        'UserModel', 'TransferModel', 'ngDialog',
        'CommonModel'
    ];
    /* @ngInject */
    function LeagueAcceptedInviteController(
        $state, logger, requestservice, $stateParams,
        $q, $scope, moment, NewsModel,
        UserModel, TransferModel, ngDialog,
        CommonModel
    ) {
        var vmi = this;

        vmi.menu = {};

        vmi.model = {
            'league_name': ''
        };

        activate();

        function activate() {
            vmi.model['league_name'] = $scope.ngDialogData['nameLeague'];
            vmi.model.goToCreateClub = $scope.ngDialogData['goToCreateClub'];
        }
    }
})();
