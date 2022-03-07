(function () {
    'use strict';

    angular
        .module('app.core')
        .controller('PlayersController', PlayersController);

    PlayersController.$inject = ['$q', 'requestservice', 'LeagueModel',
        'CommonModel', 'FootballerModel', '$stateParams', 'ngDialog',
        '$scope', 'UserModel', 'TransferModel', 'StatIconsModel', 'InjuryAndSuspensionModel',
        'ngTableParams', '$filter', 'LineUpModel'];
    /* @ngInject */
    function PlayersController(
        $q, requestservice, LeagueModel,
        CommonModel, FootballerModel, $stateParams, ngDialog,
        $scope, UserModel, TransferModel, StatIconsModel, InjuryAndSuspensionModel,
        ngTableParams, $filter, LineUpModel
    ) {

        var vm = this;

        vm.menu = {
            filter:{
                search: '',
                form: 40,
                position: '',
                'sort_by_stat': false,
                'order_by': '',
                'sort_by_name': false,
                reverse: false,
                'virtual_team_id': '',
                'player_status': '',
                'form_title': 'Season',
                'position_title': 'All positions',
                'virtual_team_title': 'All players',
                work: false
            },
            setSortType: setSortType,
            position: {
                Defender: {id: 0, title: 'Defender', short: 'DEF'},
                Midfielder: {id: 10, title: 'Midfielder', short: 'MID'},
                Forward: {id: 20, title: 'Forward', short: 'FWD'},
                Goalkeeper: {id: 30, title: 'Goalkeeper', short: 'GK'}

            },
            'form_title':[
                {id: 1, title: 'Last Match'},
                {id: 3, title: 'Last 3 Matches'},
                {id: 6, title: 'Last 6 Matches'},
                {id: 40, title: 'Season'}
            ],
            positions: [
                'All Positions',
                'Forward',
                'Defender',
                'Midfielder',
                'Goalkeeper'
            ],
            statuses: [
                'All Players',
                'Free Agent',
                'Waiver',
                'Outbound'
            ],
            getSearchFilter: getSearchFilter,
            transferActivityOrderBy: ['-get_date'],
            transferActivityOrderReverse: false,
            showAddsDrops: 'adds',
            clickListElement: clickListElement,
            clickFilter: clickFilter,
            showStatics: showStatics,
            loadPagePlayer: loadPagePlayer,
            dialogPlayerInfo: dialogPlayerInfo,
            makeTeamToTeamTransfer: makeTeamToTeamTransfer,
            takeFreeAgent: takeFreeAgent,
            makeBetOnTheWaiver: makeBetOnTheWaiver,
            keyPressEnter: keyPressEnter,
            setTransferActivityOrder: setTransferActivityOrder,
            checkClubCapacity: checkClubCapacity,
            getLineUp: getLineUp
        };

        vm.model = {
            lineUp: LineUpModel,
            commonModel: CommonModel,
            leagues: LeagueModel,
            footballer: FootballerModel,
            statIconsModel: StatIconsModel,
            injuryModel: InjuryAndSuspensionModel,
            page: 1,
            'per_page':20,
            'page_end': false,
            transfers: TransferModel,
            showTableStat: [],
            trends: [],
            trendTotalAdd: 0,
            trendTotalDrop: 0,
            leagueScoringType: {},
            leaguePointsByPositions: {
                defender: {},
                forward: {},
                goalkeeper: {},
                midfielder: {}
            },
            search: {
                'full_name': '',
                'position': 'All Positions',
                'player_status': 'All Players',
                'owner': {
                    'name': 'All Clubs'
                }
            },
            firstWeek: '',
            lastWeek: '',
            roundWeekNum: ''
        };

        vm.view = {
            showStatColumn: showStatColumn,
            leagueScoringTypeIsPoints: leagueScoringTypeIsPoints
        };

        activate();

        function activate() {
            vm.model.footballer.clear();
            vm.model.roundWeekNum = vm.model.commonModel.currentWeekNumber;
            // return $q.all([getOneLeague(), getScoringTypeData($stateParams['league_id']), getPlayersTableInfo(true), getTransferList(), getTrendsList()]).then(function() {
            return $q.all([getAllSeasons(), getOneLeague(), getScoringTypeData($stateParams['league_id']), getPlayersTableInfo(true)], getTransferList(), getLineUp()).then(function() {
                for (var i = 0; i < vm.model.statIconsModel.tableStats.length; i++) {
                    if (vm.view.showStatColumn(vm.model.statIconsModel.tableStats[i])) {
                        vm.model.showTableStat.push(vm.model.statIconsModel.tableStats[i]);
                    }
                }
                checkClubCapacity();
            });
        }

        function checkClubCapacity() {
            if (vm.model.lineUp.total > vm.model.leagues.one['squad_size']) {
               ngDialog.open({
                template: 'app/directives/confirmation/confirmation_dialog.html',
                className: 'player-card ngdialog-theme-default confirmation-dialog confirm-revoke-dialog',
                controller: 'GlobalConfirmationDialogController',
                controllerAs: 'vm',
                showClose: false,
                data: {
                    title: 'HEADS-UP',
                    text: 'Your squad is currently over your league’s max size of ' + vm.model.leagues.one['squad_size'] + '.You must drop a footballer in order to perform any transactions',
                    cancel: {
                        buttonTitle: 'OKAY',
                        action: angular.noop
                    }
                }
            });
            }
        }

        function getLineUp() {
            return requestservice.run('getLineUpData', {
                'url_params': {
                    ':club_id': $stateParams['club_id'],
                    ':round_week_num': vm.model.roundWeekNum
                }
            }).then(function (received) {
                console.log('LineUp');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.lineUp.parse(received);

                }
                return received;
            });
        }

        function getAllSeasons() {
            return requestservice.run('getAllSeason', {
            }).then(function (received) {
                if (received.data.success === 0) {
                    console.log('Seasons loaded');
                    console.log(received);
                    vm.model.seasons = received.data.result;
                    $scope.currentSeasonId = vm.model.seasons[0].id;
                }
                return received;
            });
        }

         function getSearchFilter() {
            if (vm.model.search.owner.name === 'All Clubs') {
                return {
                    'full_name': vm.model.search['full_name'],
                    'position': vm.model.search.position === 'All Positions' ? '' : vm.model.search.position,
                    'player_status': vm.model.search['player_status'] === 'All Players' ? '' : vm.model.search['player_status'],
                };
            } else {
               return {
                    'full_name': vm.model.search['full_name'],
                    'position': vm.model.search.position === 'All Positions' ? '' : vm.model.search.position,
                    'player_status': vm.model.search['player_status'] === 'All Players' ? '' : vm.model.search['player_status'],
                    'owner': {
                        'name': vm.model.search.owner.name
                    }
                };
            }
        }

        function setSortType(fieldName) {
            if (fieldName === 'full_name') {
                vm.menu.filter['sort_by_stat'] = false;
                vm.menu.filter['sort_by_name'] = true;
                setReverseSort(fieldName);
            } else {
                if (fieldName === 'owned_percentage') {
                    vm.menu.filter['sort_by_stat'] = false;
                    vm.menu.filter['sort_by_owned_percentage'] = true;
                    setReverseSort(fieldName);
                } else {
                    if (fieldName === 'points') {
                        vm.menu.filter['sort_by_stat'] = false;
                        vm.menu.filter['points'] = true;
                        setReverseSort(fieldName);
                    } else {
                        vm.menu.filter['sort_by_stat'] = true;
                        vm.menu.filter['sort_by_name'] = false;
                        setReverseSort(fieldName);
                    }
                }
            }

            getPlayersTableInfo(true);
        }

        function setReverseSort(fieldName) {
            if (vm.menu.filter['order_by'] === fieldName) {
                vm.menu.filter.reverse = !vm.menu.filter.reverse;
            } else {
                vm.menu.filter['order_by'] = fieldName;
                vm.menu.filter.reverse = true;
            }
        }

        function getOneLeague() {
            return requestservice.run('oneLeague', {
                'url_params': {
                    ':id': $stateParams['league_id']
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    vm.model.leagues.parseOne(received);
                    console.log('LEAGUE');
                    console.log(received.data.result);
                    vm.model.firstWeek = vm.model.leagues.one['start_round_num'];
                    vm.model.lastWeek = vm.model.leagues.one['start_round_num'] + vm.model.leagues.one['num_matches'] - 1;
                    if (vm.model.roundWeekNum < vm.model.firstWeek) {
                        vm.model.roundWeekNum = vm.model.firstWeek;
                    }
                    if (vm.model.roundWeekNum > vm.model.lastWeek) {
                        vm.model.roundWeekNum = vm.model.lastWeek;
                    }
                }
                return received;
            });
        }

        function getScoringTypeData(leagueId) {
            return requestservice.run('getCategoriesData', {
                'url_params': {
                    ':league_id': leagueId
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    vm.model.leagueScoringType = received.data.result;
                    console.log(' ==== vm.model.leagueScoringType ==== ');
                    if (vm.model.leagueScoringType['league_sco_type']['scoring_type'] === 'point') {
                        parsePointsByPositions(vm.model.leagueScoringType['league_sco_points']);
                    }
                    console.log(vm.model.leagueScoringType);
                }
                return received;
            });
        }

        function parsePointsByPositions(pointValuesArray) {
            pointValuesArray.forEach(function (pointValuesHash) {
                vm.model.leaguePointsByPositions[pointValuesHash['position']] = pointValuesHash;
            });
            console.log('+++ vm.model.leaguePointsByPositions +++');
            console.log(vm.model.leaguePointsByPositions);
        }

        function afterTransfer(clear) {
            getPlayersTableInfo(clear);
            // getTransferList();
            // getTrendsList();
        }

        function getPlayersTableInfo(clear) {
            if (clear) {
                vm.model.footballer.total = 0;
                vm.model.page = 1;
                vm.model['page_end'] = false;
            }
            if (vm.model['page_end']) {
                return;
            }
            if (vm.menu.filter.work) {
                return;
            }
            vm.menu.filter.work = true;
            var footballersCountBeforeRequest = vm.model.footballer.total;
            return requestservice.run('getPlayersTable', {
                // filter: vm.menu.filter,
                'league_id': $stateParams['league_id'],
                // page: vm.model.page,
                // 'per_page':  vm.model['per_page'],
                'week_num': vm.model.commonModel.currentWeekNumber
            }).then(function (received) {
                vm.menu.filter.work = false;
                console.log('Players table');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.page++;
                    if (clear) {
                        vm.model.footballer.clear();
                    }
                    vm.model.footballer.parse(received);

                    vm.tableParams = new ngTableParams(
                        {
                            sorting: {
                                'rank': 'asc'
                            }
                        },
                        {
                            filterDelay: 0,
                            getData: function($defer, params) {
                                $scope.orderedData = params.sorting() ?
                                    $filter('orderBy')(vm.model.footballer.data, params.orderBy()) :
                                    vm.model.footballer.data;

                                $defer.resolve($scope.orderedData);
                            }
                        }
                    );

                    if (footballersCountBeforeRequest === vm.model.footballer.total || vm.model.footballer.total < vm.model['per_page']) {
                        vm.model['page_end'] = true;
                    }
                }
                return received;
            });
        }

        function setTransferActivityOrder(fieldsArray) {
            var currentSortableField = vm.menu.transferActivityOrderBy[0].substr(1);
            var receivedField = fieldsArray[0];
            var orderSymbol = !vm.menu.transferActivityOrderReverse ? '-' : '+';
            if (currentSortableField === receivedField) {
                vm.menu.transferActivityOrderBy.length = 0;
                vm.menu.transferActivityOrderReverse = !vm.menu.transferActivityOrderReverse;
                fieldsArray.forEach(function(field) {
                    vm.menu.transferActivityOrderBy.push(orderSymbol + field);
                });
            } else {
                vm.menu.transferActivityOrderBy.length = 0;
                vm.menu.transferActivityOrderReverse = false;
                fieldsArray.forEach(function(field) {
                    vm.menu.transferActivityOrderBy.push('+' + field);
                });
            }
        }

        function makeTeamToTeamTransfer(footballer) {
            if (footballer.owner['user_id'] === UserModel.data.id) {
                return;
            }
            ngDialog.open({
                template: 'app/transfers/team_to_team_transfer_dialog.html',
                className: 'transfer-dialog ngdialog-theme-default',
                scope: $scope,
                controller: 'TransfersController',
                controllerAs: 'vm',
                data: {
                    dialogType: 'createTransfer',
                    chosenPlayerForAdd: footballer,
                    acceptor: footballer['owner'],
                    offerer: vm.model.commonModel.selectedClub,
                    afterTransfer: afterTransfer
                }
            });
        }

        function takeFreeAgent(footballer) {
            ngDialog.open({
                template: 'app/transfers/take_free_agent.dialog.html',
                className: 'transfer-dialog ngdialog-theme-default',
                scope: $scope,
                controller: 'TransfersController',
                controllerAs: 'vm',
                data: {
                    dialogType: 'takeFreeAgent',
                    freeAgent: footballer,
                    offerer: vm.model.commonModel.selectedClub,
                    currentRound: vm.model.roundWeekNum,
                    afterTransfer: afterTransfer
                }
            });
        }

        function makeBetOnTheWaiver(footballer) {
            ngDialog.open({
                template: 'app/transfers/waiver.dialog.html',
                className: 'transfer-dialog ngdialog-theme-default',
                scope: $scope,
                controller: 'TransfersController',
                controllerAs: 'vm',
                data: {
                    dialogType: 'betOnTheWaiver',
                    waiver: footballer,
                    offerer: vm.model.commonModel.selectedClub,
                    currentRound: vm.model.roundWeekNum,
                    afterTransfer: afterTransfer
                }
            });
        }

        function clickListElement(filterid, id, filtername, name) {
            vm.menu.filter[filterid] = id;
            vm.menu.filter[filtername] = name;
            if (filterid === 'player_status') {
                vm.menu.filter['virtual_team_id'] = '';
            } else if (filterid === 'virtual_team_id') {
                vm.menu.filter['player_status'] = '';
            }
        }

        function clickFilter() {
            vm.menu.filter['sort_by_stat'] = false;
            vm.menu.filter['sort_by_name'] = false;
            vm.menu.filter['order_by'] = '';
            vm.menu.filter.reverse = false;
            getPlayersTableInfo(true);
        }

        function showStatics(value, fieldName, playerPosition) {
            if (value === undefined) {
                return 0;
            }

            if ((playerPosition === 'forward' || playerPosition === 'midfielder') && fieldName === 'int_clean_sheet') {
                return '-';
            }
            return value;
        }

        function loadPagePlayer() {
            getPlayersTableInfo(false);
        }

        function dialogPlayerInfo(player) {
            ngDialog.open({
                template: 'app/players/player_card.html',
                className: 'player-card ngdialog-theme-default',
                scope: $scope,
                controller: 'PlayerCardController',
                controllerAs: 'vm',
                data: {
                    'player_id': player.id,
                    'league_id': $stateParams['league_id'],
                    'week_num': vm.model.commonModel.currentWeekNumber,
                    'player': player,
                    afterTransfer: afterTransfer
                }
            });
        }

        function keyPressEnter(event) {
            var keyCode = event.which || event.keyCode;
            if (keyCode === 13) {
                clickFilter();
            }
        }

        function getTransferList() {
            return requestservice.run('getListTransfer', {
                'url_params': {
                    ':league_id': $stateParams['league_id'] || vm.model.commonModel.selectedClub.league.id
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    vm.model.transfers.clear();
                    vm.model.transfers.parse(received);
                }
                return received;
            });
        }

        function getTrendsList() {
            return requestservice.run('getListTrends', {
                'url_params': {
                    ':league_id': $stateParams['league_id']
                }
            }).then(function (received) {
                console.log('getListTrends');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.trends = received.data.result;
                    vm.model.trendTotalAdd = 0;
                    vm.model.trendTotalDrop = 0;
                    if (vm.model.trends.added && vm.model.trends.added.length > 0) {
                        vm.model.trendTotalAdd = vm.model.trends['total_added'];
                    }
                    if (vm.model.trends.dropped && vm.model.trends.dropped.length > 0) {
                        vm.model.trendTotalDrop += vm.model.trends['total_dropped'];
                    }
                }
                return received;
            });
        }

        function showStatColumn(icon) {
            var result = false;
            if (leagueScoringTypeIsPoints()) {
                result = showPointLegendIcon(icon);
            }
            if (leagueScoringTypeIsCategories()) {
                result = showLegendIcon(icon);
            }
            return result;
        }

        function showLegendIcon(icon) {
            var result = false;
            if (!icon['catsAffected'] || icon['catsAffected'].length === 0) {
                result = true;
            } else {
                icon['catsAffected'].forEach(function (category) {
                    result = result || vm.model.leagueScoringType['league_sco_cat'][category];
                });
            }
            return result;
        }

        function showPointLegendIcon(icon) {
            var result = false;
            if (!icon['pointAffected'] || icon['pointAffected'].length === 0) {
                result = true;
            } else {
                icon['pointAffected'].forEach(function (category) {
                    vm.model.leagueScoringType['league_sco_points'].forEach(function (hash) {
                        result = result || parseFloat(hash[category]) !== 0;
                    });
                });
            }
            return result;
        }

        function leagueScoringTypeIsPoints() {
            return vm.model.leagueScoringType['league_sco_type'] && vm.model.leagueScoringType['league_sco_type']['scoring_type'] === 'point';
        }

        function leagueScoringTypeIsCategories() {
            return vm.model.leagueScoringType['league_sco_type'] && vm.model.leagueScoringType['league_sco_type']['scoring_type'] === 'category';
        }

    }
})();
