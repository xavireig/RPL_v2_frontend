// jshint ignore: start
// jscs:disable
(function () {
    'use strict';

    angular
        .module('FayeClientWrapper')
        .factory('FayeClientWrapperService', FayeClientWrapperService);

    FayeClientWrapperService.$inject = ['$q', '$rootScope', 'CommonModel', 'logger'];
    /* @ngInject */
    function FayeClientWrapperService($q, $rootScope, CommonModel, logger) {
        var fayeClientWrapper;

        fayeClientWrapper = {
            commonModel: CommonModel,
            wrapper: wrapper
        };

        return fayeClientWrapper;

        function wrapper(url, fun) {
            var client, scope, wrapperService;
            scope = $rootScope;
            client = new Faye.Client(url);
            if (typeof fun === 'function') {
                fun(client);
            }

            wrapperService = {
                client: client,
                publish: publish,
                subscribe: subscribe,
                cancelSubscription: cancelSubscription,
                getSubscription: getSubscription
            };
            return wrapperService;

            function publish(channel, data) {
                return this.client.publish(channel, data);
            }

            function subscribe(channel, callback) {
                return this.client.subscribe(channel, function(data) {
                    return scope.$apply(function() {
                        return callback(data);
                    });
                });
            }

            function cancelSubscription(stateName) {
                if (!stateName) {
                    logger.error('Expected 1 parameter. Please, specify state name.');
                    return;
                }

                if (fayeClientWrapper.commonModel.returnSubscription(stateName)) {
                    fayeClientWrapper.commonModel.subscription[stateName].cancel();
                }
            }

            function getSubscription(channel) {
                var deferred, sub;
                deferred = $q.defer();
                sub = this.client.subscribe(channel, function(data) {
                    scope.$apply(function() {
                        return deferred.resolve(data);
                    });
                    return sub.cancel();
                });
                return deferred.promise;
            }
        }
    }
})();
