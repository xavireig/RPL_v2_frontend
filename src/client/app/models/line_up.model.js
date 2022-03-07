(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('LineUpModel', LineUpModel);

    LineUpModel.$inject = [];
    /* @ngInject */
    function LineUpModel() {
        var lineUpModel;

        lineUpModel = {
            data: {},
            'players_starting_xi': [],
            'players_bench': [],
            formationTypes: {
                'f442': [
                    {
                        className: 'fwd',
                        styleData: ['top: 0; left: 30%;', 'top: 0; right: 30%;']
                    },
                    {
                        className: 'mid',
                        styleData: ['left: 7%;top: 50px;', 'left: 29%;top: 50px;', 'right: 29%;top: 50px;', 'right: 7%;top: 50px;']
                    },
                    {
                        className: 'def',
                        styleData: ['left: 7%;top: 0;', 'left: 29%;top: 0;', 'right: 29%;top: 0;', 'right: 7%;top: 0;']
                    },
                    {
                        className: 'golkiper',
                        styleData: ['top: 10px; left: 40%;']
                    }
                ],
                'f433': [
                    {
                        className: 'fwd',
                        styleData: ['top: 0; left: 40%;', 'top: 0; left: 15%;', 'top: 0; right: 15%;']
                    },
                    {
                        className: 'mid',
                        styleData: ['top: 50px; left: 40%;', 'top: 50px; left: 15%;', 'top: 50px; right: 15%;']
                    },
                    {
                        className: 'def',
                        styleData: ['left: 7%;top: 0;', 'left: 29%;top: 0;', 'right: 29%;top: 0;', 'right: 7%;top: 0;']
                    },
                    {
                        className: 'golkiper',
                        styleData: ['top: 10px; left: 40%;']
                    }
                ],
                'f451': [
                    {
                        className: 'fwd',
                        styleData: ['top: 5px; left: 40%;']
                    },
                    {
                        className: 'mid',
                        styleData: ['top: 0; left: 40%;', 'top: 25px; left: 15%;', 'top: 25px; right: 15%;', 'right: 24%;top: 134px;', 'left: 24%;top: 134px;']
                    },
                    {
                        className: 'def',
                        styleData: ['left: 7%;top: 0;', 'left: 29%;top: 0;', 'right: 29%;top: 0;', 'right: 7%;top: 0;']
                    },
                    {
                        className: 'golkiper',
                        styleData: ['top: 10px; left: 40%;']
                    }
                ],
                'f352': [
                    {
                        className: 'fwd',
                        styleData: ['top: 0; left: 30%;', 'top: 0; right: 30%;']
                    },
                    {
                        className: 'mid',
                        styleData: ['top: 0; left: 40%;', 'top: 25px; left: 15%;', 'top: 25px; right: 15%;', 'right: 24%;top: 134px;', 'left: 24%;top: 134px;']
                    },
                    {
                        className: 'def',
                        styleData: ['top: 0; left: 40%;', 'top: 0; left: 15%;', 'top: 0; right: 15%;']
                    },
                    {
                        className: 'golkiper',
                        styleData: ['top: 10px; left: 40%;']
                    }
                ],
                'f343': [
                    {
                        className: 'fwd',
                        styleData: ['top: 0; left: 40%;', 'top: 0; left: 15%;', 'top: 0; right: 15%;']
                    },
                    {
                        className: 'mid',
                        styleData: ['left: 7%;top: 50px;', 'left: 29%;top: 50px;', 'right: 29%;top: 50px;', 'right: 7%;top: 50px;']
                    },
                    {
                        className: 'def',
                        styleData: ['top: 0; left: 40%;', 'top: 0; left: 15%;', 'top: 0; right: 15%;']
                    },
                    {
                        className: 'golkiper',
                        styleData: ['top: 10px; left: 40%;']
                    }

                ],
                'f541': [
                    {
                        className: 'fwd',
                        styleData: ['top: 5px; left: 40%;']
                    },
                    {
                        className: 'mid',
                        styleData: ['left: 14%;top: 25px;', 'left: 32%;top: 60px;', 'right: 32%;top: 60px;', 'right: 14%;top: 25px;']
                    },
                    {
                        className: 'def',
                        styleData: ['top: 0; left: 40%;', 'top: -25px; left: 25%;', 'top: -25px; right: 25%;', 'right: 10%;top: -50px;', 'left: 10%;top: -50px;']
                    },
                    {
                        className: 'golkiper',
                        styleData: ['top: 10px; left: 40%;']
                    }

                ],
                'f532': [
                    {
                        className: 'fwd',
                        styleData: ['top: 0; left: 30%;', 'top: 0; right: 30%;']
                    },
                    {
                        className: 'mid',
                        styleData: ['top: 50px; left: 40%;', 'top: 50px; left: 15%;', 'top: 50px; right: 15%;']
                    },
                    {
                        className: 'def',
                        styleData: ['top: 0; left: 40%;', 'top: -25px; left: 25%;', 'top: -25px; right: 25%;', 'right: 10%;top: -50px;', 'left: 10%;top: -50px;']
                    },
                    {
                        className: 'golkiper',
                        styleData: ['top: 10px; left: 40%;']
                    }

                ]
            },
            footballerPositionsHash: {
                forward: 'fwd',
                midfielder: 'mid',
                defender: 'def',
                goalkeeper: 'golkiper'
            },
            footballerPositionsSymbols: {
                forward: 'F',
                midfielder: 'M',
                defender: 'D',
                goalkeeper: 'GK'
            },
            footballersHash: {
                'fwd': [],
                'mid': [],
                'def': [],
                'golkiper': []
            },
            footballersOrder: {
                forward: 1,
                midfielder: 2,
                defender: 3,
                goalkeeper: 4
            },
            footballersPositionsOrderArray: ['fwd', 'mid', 'def', 'golkiper'],
            lineUpWasAnnounced: false,
            total: 0,
            parse: parse,
            parseByPositionName: parseByPositionName,
            clear: clear
        };

        return lineUpModel;

        function parse(data) {
            var virtFootballers = data.data.result['virt_footballers'];
            lineUpModel.total = virtFootballers.length;
            lineUpModel.data = data.data.result;
            lineUpModel.footballersHash = {'fwd': [], 'mid': [], 'def': [], 'golkiper': []};
            lineUpModel['players_starting_xi'] = [];
            lineUpModel['players_bench'] = [];
            lineUpModel['players_reserve'] = [];
            for (var ind = 0; ind < virtFootballers.length; ind++) {
                if (virtFootballers[ind]['footballer_role_in_round']['game_role']) {
                    lineUpModel.lineUpWasAnnounced = true;
                }

                if (virtFootballers[ind]['on_starting_xi']) {
                    //code after condition
                    virtFootballers[ind]['sortId'] = lineUpModel.footballersOrder[virtFootballers[ind]['footballer']['position']];
                    lineUpModel['players_starting_xi'].push(virtFootballers[ind]);

                    lineUpModel.footballersHash[
                        lineUpModel.footballerPositionsHash[virtFootballers[ind]['footballer']['position']]].push(virtFootballers[ind]);
                } else if (virtFootballers[ind]['on_bench']) {
                    virtFootballers[ind]['sortId'] = lineUpModel.footballersOrder[virtFootballers[ind]['footballer']['position']];
                    lineUpModel['players_bench'].push(virtFootballers[ind]);
                } else {
                    virtFootballers[ind]['sortId'] = lineUpModel.footballersOrder[virtFootballers[ind]['footballer']['position']];
                    lineUpModel['players_reserve'].push(virtFootballers[ind]);
                }
            }
        }

        function parseByPositionName(data, returnLineUp) {
            var virtFootballers = data.data.result['virt_footballers'];
            lineUpModel.data = data.data.result;

            lineUpModel.footballersHash = {'fwd': [], 'mid': [], 'def': [], 'golkiper': []};
            for (var ind = 0; ind < virtFootballers.length; ind++) {
                virtFootballers[ind]['sortId'] = lineUpModel.footballersOrder[virtFootballers[ind]['footballer']['position']];
                lineUpModel.footballersHash[
                    lineUpModel.footballerPositionsHash[virtFootballers[ind]['footballer']['position']]].push(virtFootballers[ind]);
            }

            if (returnLineUp) {
                return lineUpModel.data;
            }
        }

        function clear() {
            lineUpModel.data = {};
        }
    }
})();
