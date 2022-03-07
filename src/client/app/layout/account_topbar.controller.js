(function () {
    'use strict';

    angular
        .module('app.layout')
        .controller('AccountTopbarController', AccountTopbarController);

    AccountTopbarController.$inject = [
        '$state', 'logger', 'UserModel', 'authservice', 'CommonModel',
        'BidModel', 'ngDialog', '$scope', 'LeagueModel', 'requestservice',
        '$stateParams', '$', '$q', '$window', 'config', '$timeout', 'LeagueInviteModel', 'ClubModel', 'MatchDayModel'
    ];
    /* @ngInject */
    function AccountTopbarController(
        $state, logger, UserModel, authservice, CommonModel,
        BidModel, ngDialog, $scope, LeagueModel, requestservice,
        $stateParams, $, $q, $window, config, $timeout, LeagueInviteModel, ClubModel, MatchDayModel
    ) {
        var vm = this;

        vm.menu = {
            signOut: signOut,
            openBidDialog: openBidDialog,
            clickOnNotification: clickOnNotification,
            goToDashboard: goToDashboard,
            bidsWasLoad: false,
            leaguesListWasReceived: false,
            getToMyAccount: getToMyAccount,
            openApproveDialog: openApproveDialog,
            getNotApprovedBids: getNotApprovedBids,
            returnNotApprovedBidsCount: returnNotApprovedBidsCount,
            checkUserPermissionsInLeague: checkUserPermissionsInLeague,
            chooseClub: chooseClub,
            goToLeagueSetting: goToLeagueSetting,
            goToHelpPage: goToHelpPage,
            createFeedbackDialog: createFeedbackDialog,
            acceptLeague: acceptLeague,
            rejectLeague: rejectLeague,
            displayLeagueEmailForm: displayLeagueEmailForm,
            goToPreDraft: goToPreDraft,
            isUpgradeNowVisible: isUpgradeNowVisible,
            selectLeague: selectLeague
        };

        vm.model = {
            user: UserModel,
            commonModel: CommonModel,
            bids: BidModel,
            leagues: LeagueModel,
            notifications: {
                data: []
            },
            notApprovedBids: [],
            currentLeague: {},
            leagueInvites: LeagueInviteModel
        };

        activate();

        function activate() {
            console.log('subscription model');
            console.log(vm.model.user.data.subscription)

            if (vm.model.user.isSignedIn) {
                // TODO: getLeagueNotifications(), getNotApprovedBids()
                return $q.all([getMyLeagues(), getMyClubs(), getInvitesMeToLeagues()]).then(function () {
                    vm.menu.leagueId = vm.model.commonModel.selectedClub.league ?
                        vm.model.commonModel.selectedClub.league.id : $stateParams['league_id'] || (vm.model.leagues.data.myLeagues[0] || {}).id;
                });
            }
        }

        function isUpgradeNowVisible(){
            return !vm.model.user.data.subscription.isActive || (vm.model.user.data.subscription.isActive && vm.model.user.data.subscription.isTrial);
        }

        function selectLeague(league) {
            console.log(league);
            var clubs = CommonModel.topBarMenu.currentSeasonClubs;
            var selectedClub = null;
            for(var i=0; i<clubs.length;i++){

                if(league.id == clubs[i].league_id){
                    selectedClub = clubs[i];
                    break;
                }
            }
            console.log(selectedClub);
            vm.model.commonModel.selectedClub = selectedClub;
            vm.menu.chooseClub();
        }

        function signOut() {
            console.log(UserModel.data);
            return authservice.signOut().then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    UserModel.clear();
                    CommonModel.clear();
                    ClubModel.clear();
                    ClubModel.clearOne();
                    LeagueModel.clear();
                    BidModel.clear();
                    LeagueInviteModel.clear();
                    MatchDayModel.clear();
                    window.location.pathname = '/';
                }
                return received;
            });
        }

        function displayLeagueEmailForm() {
            ngDialog.open({
                template: 'app/layout/display_league_email_form.html',
                className: 'entire-league-msg ngdialog-theme-default',
                controller: 'EntireLeagueEmailController',
                controllerAs: 'vm',
                data: {}
            });
        }

        function goToPreDraft() {
            $state.go('league_before_draft', {
                'league_id': vm.menu.leagueId
            });
        }

        function goToLeagueSetting() {
            // if ($stateParams['league_id'] === null || $stateParams['league_id'].toString() === '0' || $stateParams['league_id'].toString() === 'missing') {
            //     logger.info('Your club doesn\'t belong to any league');
            //     return;
            // }
            // $state.go('league_settings', {
            //     'league_id': $stateParams['league_id']
            // });
            $state.go('league_settings', {
                'league_id': vm.menu.leagueId
            });
        }

        function goLeagueInvite(oneLeagueId) {
            $state.go('new_league_invite_owners', {
                'league_id': oneLeagueId
            });
        }

        function goToDashboard(leagueId, byLogoClick) {
            if (byLogoClick) {
                $state.go('dashboard', {
                    'club_id': vm.model.commonModel.selectedClub.id,
                    'league_id': $stateParams['league_id'] || vm.model.commonModel.selectedClub['league_id'] || 0
                });
            } else {
                vm.model.commonModel.leagueClubs = [];
                vm.model.commonModel.selectedLeagueClubId = null;
                vm.model.commonModel.clubsList.forEach(function(club) {
                    if (club['league_id'] === leagueId) {
                        $state.go('dashboard', {
                            'club_id': club.id,
                            'league_id': club['league_id']
                        });
                    }
                });
            }
        }

        function openApproveDialog() {
            if (vm.model.bids.notApprovedBids.length) {
                ngDialog.open({
                    template: 'app/layout/approve_transfer.dialog.html',
                    className: 'transfer-dialog ngdialog-theme-default',
                    controller: 'ApproveTransferController',
                    controllerAs: 'vm',
                    showClose: false
                });
            }
        }

        function getNotApprovedBids() {
            if ($stateParams['league_id'] && $stateParams['league_id'].toString() !== '0') {
                return requestservice.run('getNotApprovedBids', {
                    'url_params': {
                        ':league_id': $stateParams['league_id']
                    }
                }).then(function (received) {
                    console.log('getNotApprovedBids');
                    console.log(received);
                    if (received.data.success === 0) {
                        vm.model.bids.notApprovedBids = received.data.result;
                        console.log(vm.model.bids.notApprovedBids.length);
                    }
                    return received;
                });
            } else {
                setTimeout(getNotApprovedBids, 1000);
            }
        }

        function getLeagueNotifications() {
            return requestservice.run('getLeagueNotifications', {
            }).then(function (received) {
                console.log('getLeagueNotifications');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.notifications.data = received.data.result;
                }
                return received;
            });
        }

        function getMyLeagues() {
            vm.model.leagues.clear();
            return requestservice.run('listOfLeagues', {
                'page': vm.model.leagues.paging.page++,
                'per_page': vm.model.leagues.paging['per_page']
            }).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.leagues.parse(received);
                    vm.menu.leaguesListWasReceived = true;
                }
                return received;
            });
        }

        function markNotificationViewed(notificationId) {
            requestservice.run('markNotificationViewed', {
                id: notificationId
            }).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    $(event.target.parentElement).fadeOut();
                    getLeagueNotifications();
                }
            });
        }

        function clickOnNotification(event, notification) {
            markNotificationViewed(notification.id);

            if (notification.bid) {
                openBidDialog(notification.bid);
            } else {
                event.preventDefault();
                event.stopPropagation();
            }
            return false;
        }

        function openBidDialog(bid) {
            var offeredFootballers = vm.model.bids.parseFootballers(bid['offered_virt_footballers']);
            var requestedFootballers = vm.model.bids.parseFootballers(bid['requested_virt_footballers']);

            ngDialog.open({
                template: 'app/transfers/confirm_transfer_dialog.html',
                className: 'transfer-dialog ngdialog-theme-default',
                controller: 'ConfirmTransferController',
                controllerAs: 'vm',
                scope: $scope,
                data: {
                    confirmType: 'bid',
                    bidId: bid.id,
                    footballersForDropHash: offeredFootballers,
                    footballersForAddHash: requestedFootballers,
                    moneyOffered: bid['money_offered'],
                    acceptor: bid['acceptor_club'],
                    offerer: bid['offerer_club'],
                    afterTransfer: getLeagueNotifications,
                    leagueId: bid['acceptor_club']['league_id']
                }
            });
        }

        function goLeagueSetting(leagueId) {
            $state.go('league_settings', {'league_id': leagueId});
        }

        function getToMyAccount() {
            $state.go('dashboard', {
                'club_id': $stateParams['club_id'],
                'league_id': $stateParams['league_id']
            });
        }

        function returnNotApprovedBidsCount() {
            if (vm.model.bids.notApprovedBids) {
                return vm.model.bids.notApprovedBids.length;
            } else {
                return '0';
            }
        }

        function checkUserPermissionsInLeague() {
            var userIsChairman = false;
            vm.model.leagues.data.myLeagues.every(function(league) {
                userIsChairman = (league.id.toString() === (vm.menu.leagueId || {}).toString());
                return !userIsChairman;
            });
            return userIsChairman;
        }

        //---SIDEBAR---//

        function getMyClubs() {
            console.log('$scope');
            console.log($scope);
            return requestservice.run('listOfUserClubs', {
                'page': 1,
                'per_page': 200
            }).then(function (received) {
                if (received.data.success === 0) {
                    console.log('CLUBS menu');
                    console.log(received);
                    CommonModel.clubsList = received.data.result['current_season_clubs'];
                    // TODO .concat(received.data.result['old_seasons_clubs']);
                    CommonModel.topBarMenu.currentSeasonClubs = received.data.result['current_season_clubs'];
                    CommonModel.topBarMenu.oldSeasonClubs = received.data.result['old_seasons_clubs'];

                    if (vm.model.commonModel.clubsList.length === 0) {
                        vm.model.commonModel.selectedClub.id = 0;
                        return;
                    }
                    vm.model.commonModel.clubsList.forEach(function(club) {
                        if (club.id === parseInt(vm.model.commonModel.selectedClub.id) || parseInt($stateParams['league_id']) === club['league_id']) {
                            vm.model.commonModel.selectedClub = club;
                            vm.model.clubWasFound = true;
                        }
                    });
                    if (!vm.model.clubWasFound) {
                        vm.model.commonModel.selectedClub = vm.model.commonModel.clubsList[0];
                    }
                }
                return received;
            });
        }

        function chooseClub() {

            console.log(vm.model.commonModel.selectedClub);
            vm.model.commonModel.leagueClubs = [];
            vm.model.commonModel.selectedLeagueClubId = null;

            if ($state.current.name === 'dashboard') {
                $state.go('dashboard', {
                    'club_id': vm.model.commonModel.selectedClub.id,
                    'league_id': vm.model.commonModel.selectedClub['league_id'] || 0
                });
                return;
            }

            if (vm.model.commonModel.selectedClub && (vm.model.commonModel.selectedClub['league_id'] === null ||
                vm.model.commonModel.selectedClub['league']['draft_status'] !== 'completed')) {
                logger.error('Selected club does not participate in any league or draft not closed');
                $state.go('dashboard', {
                    'club_id': vm.model.commonModel.selectedClub.id,
                    'league_id': vm.model.commonModel.selectedClub['league_id'] || 0
                });
                return;
            }
            $state.go($state.current.name, {
                'club_id': vm.model.commonModel.selectedClub.id,
                'league_id': vm.model.commonModel.selectedClub['league_id'] || 0
            });
        }

        function goToHelpPage(anchor) {
            $window.open(config.protocol + '://' + config.domainEndpoint + config.portEndpoint + '/help' + anchor, '_blank');
        }

        function createFeedbackDialog(subjectIndex) {
            ngDialog.open({
                template: 'app/layout/feedback/feedback.template.html',
                className: 'transfer-dialog ngdialog-theme-default',
                controller: 'FeedbackController',
                controllerAs: 'vm',
                data: {
                    subjectIndex: subjectIndex
                }
            });
        }

        function getInvitesMeToLeagues() {
            return requestservice.run('myInvitesInLeagues', {'filter': 'waiting'}).then(function (received) {
                console.log('received');
                console.log(received);
                if (received.data.success === 0) {
                    vm.model.leagueInvites.clear();
                    vm.model.leagueInvites.parse(received);
                }
                return received;
            });
        }

        function goNewClubFromInvite(currentInvitation) {
            console.log(vm.model.commonModel.selectedClub);
            if (typeof vm.model.commonModel.selectedClub.league === 'undefined' ||
                vm.model.commonModel.selectedClub.league === null) {

                requestservice.run('acceptInvitation', {
                    'url_params': {
                        ':league_id': currentInvitation.league.id,
                        ':club_id': vm.model.commonModel.selectedClub.id
                    }
                }).then(function (received) {
                    console.log(received);
                    console.log('Came after league');
                    console.log(received.data.result);

                    if (received.data.success === 500) {
                        return;
                    }

                    if (received.data.success === 0) {
                        logger.success('Club has joined league successfully');
                    }
                    else if (received.data.success === 200) {
                        logger.success(received.data.message);
                    }

                    window.location.reload(true);
                    return received;
                });
            }
            else {

                $state.go('new_club_form_without_user_signed_up_link', {
                    'league_id': currentInvitation.league.id,
                    'league': '',
                    redirectedFromInviteLink: true
                });
            }

            // $state.go('new_club_form', {
            //     redirectedFromLeague: leagueInviteId
            // });
        }

        function acceptLeague(currentInvitation) {
            goNewClubFromInvite(currentInvitation);
        }

        function checkIfLeagueCanAcceptInvite(currentInvitation, callback) {
            console.log(currentInvitation);
            return requestservice.run('checkIfLeagueCanAcceptInvite', {
                'url_params': {
                    ':invite_id': currentInvitation.id
                }
            }).then(function (received) {
                if (received.data.success === 0) {
                    callback();
                } else {
                    logger.error(received.data.message);
                }
                getInvitesMeToLeagues();
                return received;
            });
        }

        function rejectLeague(currentInvitation) {
            return requestservice.run('rejectInvitation', {
                'url_params': {
                    ':league_id': currentInvitation.league.id
                }
            }).then(function (received) {
                console.log(received);
                if (received.data.success === 0) {
                    logger.info('You\'ve rejected the invitation to the league "' + currentInvitation.league.title + '".');
                    getInvitesMeToLeagues();
                }
                return received;
            });
        }

        function getAnyClubWithoutLeague() {
            return CommonModel.clubsList.filter(function(element) {
                return !element['league_id'];
            });
        }

    }
})();
