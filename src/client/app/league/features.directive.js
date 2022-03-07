(function () {
    'use strict';

    angular
        .module('app.lineup')
        .directive('features', featuresDirective);

    featuresDirective.$inject = ['moment', 'requestservice', '$stateParams', 'logger'];
    /* @ngInject */
    function featuresDirective(moment, requestservice, $stateParams, logger) {
        var directive = {
            restrict: 'E',
            replace: true,
            link: link,
            scope:{
                featuresList: '=featuresList',
                showDesc: '=showDesc'
            },
            templateUrl: 'app/league/features.html'
        };
        return directive;

        function link (scope, element, attrs) {
            var vm = scope;

            vm.menu = {
                showFeature: showFeature,
                moveElement: moveElement
            };

            vm.model = {
                currentFeature: -1
            };

            function showFeature(index) {
                if (vm.model.currentFeature === -1) {
                    moveElement(3);
                }
                if (vm.model.currentFeature >= index && index >= vm.model.currentFeature - 2) {
                    return '';
                }
                return 'display:none';
            }

            function moveElement(change) {
                vm.model.currentFeature += change;
                if (vm.model.currentFeature < 0) {
                    vm.model.currentFeature = 0;
                } else if (vm.model.currentFeature > vm.featuresList.length) {
                    vm.model.currentFeature = vm.featuresList.length;
                }
            }
        }
    }
})();
