(function () {
    'use strict';

    angular
        .module('app.club')
        .controller('ClubProfileController', ClubProfileController);

    ClubProfileController.$inject = [
        '$state', 'requestservice', '$stateParams',
        '$q', '$timeout', '$scope', 'CommonModel'];
    /* @ngInject */
    function ClubProfileController($state, requestservice, $stateParams,
                                   $q, $timeout, $scope, CommonModel) {
        var vm = this;

        vm.menu = {
        };

        vm.model = {
            commonModel: CommonModel,
            info: {},
            totalTransfers: null,
        };

        activate();

        function activate() {

            return $q.all([getClubInf()]).then(function () {
                // getClubTransactions(vm.model.info.id);
            });

        }

        function getClubInf() {
            return requestservice.run('oneClub', {
                'url_params': {
                    ':id': $stateParams['club_id']
                }
            }).then(function (received) {
                console.log('Club Info');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.info = received.data.result;
                    vm.model.firstWeek = received.data.result.league['start_round_num'];
                    vm.model.lastWeek = received.data.result.league['max_round_num'];
                    if (vm.model.commonModel.currentWeekNumber < vm.model.firstWeek) {
                        vm.model.commonModel.currentWeekNumber = vm.model.firstWeek;
                    }
                    if (vm.model.commonModel.currentWeekNumber > vm.model.lastWeek) {
                        vm.model.commonModel.currentWeekNumber = vm.model.lastWeek;
                    }
                }
                return received;
            });
        }

        function getClubTransactions(clubId) {

            requestservice.run('clubTransactions', {
                'url_params': {
                    ':club_id': clubId
                }

            }).then(function(data) {
                vm.model.totalTransfers = data.data.transaction;
            }).catch(function(data) {
                console.log('error -->' + data);
            });
        }

        squadEvent();

        function squadEvent() {
            $timeout(function() {
                $scope.$broadcast('thingsRendered');
                angular.element('.squad-row').children('.squad-col:nth-child(1)').addClass('squad-left');
                angular.element('.squad-row').children('.squad-col:nth-child(2)').addClass('squad-left');
                angular.element('.squad-row').children('.squad-col:nth-child(3)').addClass('squad-right');
                angular.element('.squad-row').children('.squad-col:nth-child(4)').addClass('squad-right');
                angular.element('.squad-left').wrapAll('<div class="squad-block squad-left-block col-xs-6"></div>');
                angular.element('.squad-right').wrapAll('<div class="squad-block squad-right-block col-xs-6"></div>');
            }, 500);
        }
    }
})();
