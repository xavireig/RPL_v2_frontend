(function () {
    'use strict';

    angular
        .module('app.draft')
        .factory('fayeservice', fayeservice);

    fayeservice.$inject = ['FayeClientWrapperService', 'config'];
    /* @ngInject */
    function fayeservice(FayeClientWrapperService, config) {
        var service = FayeClientWrapperService.wrapper(config.protocol + '://' + config.domainEndpoint + config.portSocketEndpoint + '/faye');
        return service;
    }
})();
