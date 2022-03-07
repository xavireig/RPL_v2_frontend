(function () {
    'use strict';

    angular
        .module('app.news')
        .controller('NewsController', NewsController);

    NewsController.$inject = [
        '$state', 'logger', 'requestservice', '$stateParams',
        '$q', 'NewsModel', 'InjuryAndSuspensionModel', 'ngTableParams', '$filter'
    ];
    /* @ngInject */
    function NewsController(
        $state, logger, requestservice, $stateParams,
        $q, NewsModel, InjuryAndSuspensionModel, ngTableParams, $filter
    ) {
        var vm = this;

        vm.menu = {
            returnTitleColor: returnTitleColor,
            clubAbbr: {
                31: 'CRY', 43: 'MCI', 45: 'NOR', 56: 'SUN', 4: 'NEW',
                8: 'CHE', 14: 'LIV', 20: 'SOU', 3: 'ARS', 57: 'WAT',
                6: 'TOT', 110: 'STK', 13: 'LEI', 1: 'MUN', 80: 'SWA',
                91: 'BOU', 7: 'AVL', 21: 'WHU', 11: 'EVE', 35: 'WBA'
            }
        };

        vm.model = {
            news: NewsModel,
            injAndSusp: InjuryAndSuspensionModel,
            footballerPositionsHash: {
                forward: 'fwd',
                midfielder: 'mid',
                defender: 'def',
                goalkeeper: 'gk'
            },
            featuresList: {}
        };

        activate();

        function activate() {
            return $q.all([getCmsNewsByType('news'), getLastPlayersNews(), getCmsNewsByType('blog'), getInjuriesAndSuspensions(), getFeaturesList()]).then(function () {

            });
        }

        function returnTitleColor(titleColor) {
            return {
                'background-color': titleColor
            };
        }

        function getLastPlayersNews() {
            return requestservice.run('getLastPlayersNews', {
            }).then(function (received) {
                console.log('getLastPlayersNews');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.news.parse(received);
                }
                return received;
            });
        }

        function getCmsNewsByType(newsType) {
            return requestservice.run('getCmsNewsByType', {
                'news_type': newsType
            }).then(function (received) {
                console.log('getCmsByType');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.news.parse(received, newsType);
                }
                return received;
            });
        }

        function getInjuriesAndSuspensions() {
            return requestservice.run('getInjuriesAndSuspensions', {

            }).then(function (received) {
                console.log('getInjuriesAndSuspensions');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.injAndSusp.parse(received);
                    vm.tableData = [];
                    for (var i = 0; i < vm.model.injAndSusp.data.length; i++) {
                        for (var j = 0; j < vm.model.injAndSusp.data[i].footballers.length; j++) {
                            vm.tableData.push({
                                'full_name': $filter('FootballerFullName')(vm.model.injAndSusp.data[i].footballers[j]['full_name'], false, true),
                                'position': vm.model.injAndSusp.data[i].footballers[j].position,
                                'short_club_name': vm.model.injAndSusp.data[i].footballers[j]['real_team']['short_club_name'],
                                'description': vm.model.injAndSusp.data[i].description,
                                'status': vm.model.injAndSusp.data[i].status,
                                'expected_return': vm.model.injAndSusp.data[i]['expected_return']
                            });
                        }
                    }
                    vm.tableParams = new ngTableParams(
                        {},
                        {
                            filterDelay: 0,
                            getData: function($defer, params) {
                                var orderedData = params.sorting() ?
                                    $filter('orderBy')(vm.tableData, params.orderBy()) :
                                    vm.tableData;
                                $defer.resolve(orderedData);
                            }
                        }
                    );
                }
                return received;
            });
        }

        function getFeaturesList() {
            return requestservice.run('getFeatures', {
                'url_params': ''
            }).then(function (received) {
                if (received.data.success === 0) {
                    vm.model.featuresList = received.data.result;
                    if (vm.model.featuresList.length > 5) {
                        vm.model.featuresList.splice(5, vm.model.featuresList.length - 5);
                    }

                }
                return received;
            });
        }
    }
})();
