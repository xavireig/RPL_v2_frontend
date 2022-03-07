(function () {
    'use strict';

    angular
        .module('app.core')

        .directive('owlCarousel', ['$', function ($) {
            return {
                restrict: 'E',
                transclude: false,
                link: function (scope, element, attrs, controllers) {
                    scope.initCarousel = function (element) {
                        // provide any default options you want
                        var defaultOptions = {};
                        var customOptions = scope.$eval($(element).attr('data-options'));
                        // combine the two options objects
                        for (var key in customOptions) {
                            if (customOptions.hasOwnProperty(key)) {
                                defaultOptions[key] = customOptions[key];
                            }
                        }
                        // init carousel
                        $(element).owlCarousel(defaultOptions);
                    };
                    scope.goNextOwlCarousel = function (id) {
                        $(element).trigger('next.owl');
                    };
                    scope.goPrevOwlCarousel = function (id) {
                        $(element).trigger('prev.owl');
                    };
                    scope.$watch('isShapeChanged', function() {
                        if ($(element).attr('id') === 'crest-pattern') {
                            $(element).trigger('destroy.owl.carousel');
                        }
                    });
                }
            };
        }])

        .directive('owlCarouselItem', ['$timeout', function ($timeout) {
            return {
                restrict: 'A',
                transclude: false,
                link: function (scope, element) {
                    // wait for the last item in the ng-repeat then call init
                    if (scope.$last) {
                        $timeout(function() {
                            scope.initCarousel(element.parent());
                        }, 100);
                    }
                }
            };
        }]);

})();
