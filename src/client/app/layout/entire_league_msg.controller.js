(function() {
    'use strict';

    angular
        .module('app.layout')
        .controller('EntireLeagueEmailController', EntireLeagueEmailController);

    EntireLeagueEmailController.$inject = [
         '$scope', 'LeagueModel', 'ClubModel', 'CommonModel', 'requestservice', 'ngDialog', 'toastr'
    ];
    /* @ngInject */
    function EntireLeagueEmailController(
         $scope, LeagueModel, ClubModel, CommonModel, requestservice, ngDialog, toastr
    ) {

        toastr.options.preventDuplicates = true;

        $scope.data = {
            leagueId: '',
            subject: '',
            body: ''
        };

        var reset = function() {
            $scope.data.subject = '';
            $scope.data.body = '';
        };

        $scope.sendEmail = function() {
            $scope.data.leagueId = CommonModel.leagueClubs[0]['league_id'];
            requestservice.run('sendEmailToLeagueMembers', {
                'url_params': {
                    ':league_id': $scope.data.leagueId
                },
                'subject': $scope.data.subject,
                'body': $scope.data.body

            }).then(function(data) {
                if (data.data.success === 400) {
                    toastr.error(data.data.message, 'Error Sending Mail');
                }
                else {
                    toastr.success(data.data.message, 'Success');
                    reset();
                    ngDialog.close();
                }

            }).catch(function(data) {
                console.log('error -->' + data);
            });
        };
    }
})();
