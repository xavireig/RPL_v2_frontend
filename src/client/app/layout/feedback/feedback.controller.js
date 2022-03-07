(function () {
    'use strict';

    angular
        .module('app.core')
        .controller('FeedbackController', FeedbackController);

    FeedbackController.$inject = ['UserModel', '$scope', 'requestservice', 'ngDialog', 'logger'];
    /* @ngInject */
    function FeedbackController(UserModel, $scope, requestservice, ngDialog, logger) {
        var vm = this;

        vm.menu = {
            sendFeedback: sendFeedback
        };

        vm.model = {
            creatorName: UserModel.data['full_name'],
            creatorEmail: UserModel.data.email,
            message: '',
            subjectIndex: $scope.ngDialogData.subjectIndex,
            favouriteGoalIndex: 0,

            subjects: [
                {key: 'write_for_site', title: 'I\'d like to write for the site'},
                {key: 'issue', title: 'Bug / Issue'},
                {key: 'feature', title: 'Feature request'},
                {key: 'chatter', title: 'Just wanna say hi'}
            ],

            favouriteGoals: [
                'Roberto Carlos free kick v. France `98',
                'Dennis Bergkamp v. Newcastle `02',
                'Ryan Giggs v. Arsenal `99',
                'Steven Gerrard v. Olympiakos `04',
                'Zlatan Ibrahinovic v. England `12'
            ]
        };

        activate();

        function activate() {
            console.log('UserModel');
            console.log(UserModel);
        }

        function sendFeedback() {
            return requestservice.run('sendFeedback', {
                'creator_name': vm.model.creatorName,
                'creator_email': vm.model.creatorEmail,
                'subject': vm.model.subjects[vm.model.subjectIndex].key,
                'message': vm.model.message,
                'favourite_goal': vm.model.favouriteGoals[vm.model.favouriteGoalIndex]
            }).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    ngDialog.close();
                    logger.success(received.data.message)
                } else {
                    logger.error(received.data.message);
                }
            });
        }

    }
})();
