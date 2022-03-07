(function () {
    'use strict';

    var core = angular.module('app.core');

    core.config(toastrConfig);

    toastrConfig.$inject = ['toastr'];
    /* @ngInject */
    function toastrConfig(toastr) {
        toastr.options.timeOut = 4000;
        toastr.options.positionClass = 'toast-bottom-right';
    }

    var config = {
        appErrorPrefix: '[rplv2 Error] ',
        appTitle: 'Roto Premier League - Draft-Style Fantasy EPL',

        protocol: '[[_PROTOCOL_]]',
        domainEndpoint: '[[_DOMAIN_ENDPOINT_]]',
        portEndpoint: '[[_PORT_ENDPOINT_]]',
        actionCableUrl: '[[_ACTION_CABLE_URL_]]'
    };

    core.value('config', config);

    core.config(configure);

    configure.$inject = [
        '$logProvider',
        'routerHelperProvider',
        'exceptionHandlerProvider',
        '$facebookProvider',
        '$sceProvider'
    ];
    /* @ngInject */
    function configure(
        $logProvider,
        routerHelperProvider,
        exceptionHandlerProvider,
        $facebookProvider,
        $sceProvider
    ) {
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
        exceptionHandlerProvider.configure(config.appErrorPrefix);
        routerHelperProvider.configure({docTitle: config.appTitle + ': '});
        $facebookProvider.setAppId('933423210029516');
        $facebookProvider.setPermissions('user_friends,public_profile,email');

        $sceProvider.enabled(false);
    }

})();
