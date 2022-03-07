(function () {
    'use strict';

    angular
        .module('app.league')
        .controller('PromotionsController', PromotionsController);

    PromotionsController.$inject = [
        '$state', 'logger', 'requestservice', '$stateParams',
        '$q', 'PromotionsModel', 'LeagueModel', 'LeagueSettingsModel'
    ];
    /* @ngInject */
    function PromotionsController($state, logger, requestservice, $stateParams, $q, PromotionsModel, LeagueModel,
                                  LeagueSettingsModel) {
        var vm = this;

        vm.menu = {
            createOrUpdatePromotion: createOrUpdatePromotion,
            checkNumber: checkNumber
        };

        vm.model = {
            'number_of_leagues_list': [2, 3, 4, 5, 6],

            'number_of_leagues': 2,
            'array_of_league_ids': [],

            promotion: null,
            league: LeagueModel
        };

        vm.view = {
            toArray: toArray,
            blockLinkLeagues: blockLinkLeagues
        };

        activate();

        function activate() {
            getPromotion();
        }

        function checkNumber(one) {
            var result = one;
            if (vm.model.promotion) {
                result = Math.max(one, (vm.model.promotion['ready_leagues'] || []).length  + (vm.model.promotion['pending_leagues'] || []).length);
            }
            vm.model['number_of_leagues'] = result;
        }

        function getPromotion() {
            requestservice.run('getPromotion', {
                'league_id': $stateParams['league_id']
            }).then(function(received) {
                if (received.data.success === 0) {
                    console.log('getPromotion');
                    console.log(received.data.result);
                    vm.model.promotion = received.data.result;
                    PromotionsModel.promotion = vm.model.promotion;
                    parsePromotion();
                } else {
                    logger.error(received.data.message);
                }
            });
        }

        function parsePromotion() {
            if (vm.model.promotion) {
                vm.model['number_of_leagues'] = (vm.model.promotion['ready_leagues'] || []).length + (vm.model.promotion['pending_leagues'] || []).length;
                vm.model['array_of_league_ids'] = new Array(vm.model['number_of_leagues']);
                vm.model.promotion['ready_leagues'].forEach(function(league) {
                    var item = {
                        title: league['uniq_code'],
                        disabled: true,
                        status: 'accepted'
                    };
                    vm.model['array_of_league_ids'][league['promotion_order'] - 1] = item;
                });
                vm.model.promotion['pending_leagues'].forEach(function(league) {
                    var item = {
                        title: league['uniq_code'],
                        disabled: true,
                        status: 'pending'
                    };
                    vm.model['array_of_league_ids'][league['promotion_order'] - 1] = item;
                });

                vm.model.promotion.switchPos = vm.model.promotion['enable_status'];
            } else {
                vm.model['array_of_league_ids'] = new Array(vm.model['number_of_leagues']);
                var item = {
                    title: vm.model.league.one['uniq_code'],
                    disabled: false
                };
                vm.model['array_of_league_ids'][0] = item;
            }
        }

        function createOrUpdatePromotion() {
            if (vm.model.promotion && vm.model.promotion.hasOwnProperty('id')) {
                updatePromotion();
            } else {
                createPromotion();
            }
        }

        function createPromotion() {
            var tmpArray = [];
            vm.model['array_of_league_ids'].forEach(function(item) {
                if (item && item.title && /^[a-zA-Z0-9]+$/.test(item.title)) {
                    tmpArray.push(item.title);
                }
            });
            requestservice.run('createPromotion',
                {
                    'league_ids': tmpArray
                }).then(function(received) {
                if (received.data.success === 0) {
                    logger.success('Promotion was successfully created');
                    getPromotion();
                } else {
                    logger.error(received.data.message);
                }
            });
        }

        function updatePromotion() {
            var tmpArray = [];
            vm.model['array_of_league_ids'].forEach(function(item) {
                if (item) {
                    tmpArray.push(item.title);
                }
            });
            requestservice.run('updatePromotion',
                {
                    'league_ids': tmpArray,
                    'promotion_id': vm.model.promotion.id
                }).then(function(received) {
                    if (received.data.success === 0) {
                        logger.success('Promotion was successfully updated');
                        updateEnableStatus();
                    } else {
                        logger.error(received.data.message);
                    }
                });
        }

        function updateEnableStatus() {
            if (vm.model.promotion) {
                requestservice.run('changeEnableStatus', {
                    'promotion_id': vm.model.promotion.id,
                    'enable_status': vm.model.promotion.switchPos
                }).then(function(received) {
                    if (received.data.success === 0) {
                        logger.success('Status successfully changed');
                    } else {
                        logger.error(received.data.message);
                    }
                });
            }
        }

        function blockLinkLeagues() {
            var result = false;
            if (vm.model.promotion) {
                result = vm.model['number_of_leagues'] === (vm.model.promotion['ready_leagues'] || []).length + (vm.model.promotion['pending_leagues'] || []).length;
            }
            return result;
        }

        //Private function

        function toArray(num) {
            return new Array(num);
        }

    }
})();
