(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('PublicListingController', PublicListingController);

    PublicListingController.$inject = ['$rootScope', '$state', 'requestservice', 'clipboard',
        'logger', 'ngDialog', 'LeagueModel', '$filter', '$q', '$stateParams', 'config'
    ];
    /* @ngInject */
    function PublicListingController($rootScope, $state, requestservice, clipboard,
        logger, ngDialog, LeagueModel, $filter, $q, $stateParams, config) {
        var vm = this;

        vm.menu = {
            saveDescription: saveDescription,
            copyLinkToClipboard: copyLinkToClipboard,
        };

        vm.model = {
            description: '',
            link: '',
            sharedLink: config.domainEndpoint,
            code: ''
        };

        activate();

        function saveDescription() {

            return requestservice.run('saveLeagueDescription', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                },
                'description': vm.model.description
            }).then(function (received) {
                console.log('saveLeagueDescription');
                console.log(received);
                if (received.data.success === 0) {
                    logger.success('league description saved successfully');
                    $state.go('new_league_checklist', {
                        'league_id': $stateParams['league_id'],
                        point: 2
                    });
                }
                return received;
            });

        }

        function activate() {
            return $q.all([getLeagueCode()]).then(function () {

            });
        }

        function getLeagueCode() {
            requestservice.run('getLeagueCode', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    vm.model.code = received.data.result;
                    vm.model.link = location.origin + '/league/invite/' + received.data.result + '/link';
                    vm.model.description = received.data.description;
                } else {
                    logger.error(received.data.message);
                }
                return received;
            });
        }

        function copyLinkToClipboard() {
            console.log('Copied');
        }
    }

})();
