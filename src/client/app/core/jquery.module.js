var jqueryModule = angular.module('jqueryModule', []);
jqueryModule.factory('$', ['$window', function($window) {
    return $window.$; // assumes underscore has already been loaded on the page
}]);
jqueryModule.factory('braintree', ['$window', function($window) {
    return $window.braintree; // assumes underscore has already been loaded on the page
}]);
