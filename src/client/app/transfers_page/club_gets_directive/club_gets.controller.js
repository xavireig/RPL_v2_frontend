(function () {
    'use strict';

    angular
        .module('app.core')
        .controller('ClubGetsController', ClubGetsController);

    ClubGetsController.$inject = ['LineUpModel'];
    /* @ngInject */
    function ClubGetsController(LineUpModel) {
        var vm = this;

        vm.model = {
            lineupModel: LineUpModel
        };
    }
})();
