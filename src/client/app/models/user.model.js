(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('UserModel', UserModel);

    UserModel.$inject = ['logger', '$localStorage', '$base64'];
    /* @ngInject */
    function UserModel(logger, $localStorage, $base64) {
        var userModel;

        userModel = {
            subscription: {
                statusIdentified: false,
                statusPrepaid: false
            },
            isAuthChecked: false,
            isSignedIn: false,
            fbAccessToken: '',
            fbUserId: '',
            data: {},
            parse: parse,
            save: save,
            load: load,
            clear: clear,
            parseProfile: parseProfile,
            isTrailEndNotice: isTrailEndNotice,
            trialEndNoticePeriod: 3,
            parseSubscription: parseSubscription
        };

        return userModel;

        function clear() {
            userModel.isSignedIn = false;
            userModel.data = {};
            delete $localStorage.userCache;
        }

        function load() {
            if (typeof $localStorage.userCache !== 'undefined' &&
                $localStorage.userCache !== null) {
                try {
                    /*global escape: true */
                    userModel.data = JSON.parse(decodeURIComponent(escape($base64.decode($localStorage.userCache))));
                } catch (err) {
                    console.log('User data is broken. It will be reset.');
                    save();
                }
            }
        }

        function save() {
            /*global unescape: true */
            $localStorage.userCache = $base64.encode(unescape(encodeURIComponent(JSON.stringify(userModel.data))));
        }

        function parse(data) {
            userModel.data = data.data.result;
            userModel.isSignedIn = true;
            userModel.isAuthChecked = true;
            parseSubscription(data);
            userModel.save();
        }

        function parseProfile(data) {
            userModel.data.email = data.data.result.email;
            userModel.data.fname = data.data.result.fname;
            userModel.data.lname = data.data.result.lname;
        }

        function parseSubscription(data) {
            if (data.data.result.subscription) {
                userModel.data.subscription = {
                    isActive: true,
                    isTrial: data.data.result.subscription.isTrial,
                    endDate: Date.parse(data.data.result.subscription['end_date'])
                };
            } else {
                userModel.data.subscription = {
                    isActive: false,
                    isTrial: undefined,
                    endDate: undefined
                };
            }
        }

        function isTrailEndNotice() {
            return (userModel.data.subscription.isActive &&
                userModel.data.subscription.isTrial &&
                isTrailEndNear());
        }

        function isTrailEndNear() {
            return (((userModel.data.subscription.endDate - Date.now()) / 86400000) <= userModel.trialEndNoticePeriod &&
                userModel.data.subscription.endDate > Date.now());
        }
    }
})();
