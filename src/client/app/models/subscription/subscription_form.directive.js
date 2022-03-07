(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('subscriptionForm', subscriptionForm);

    subscriptionForm.$inject = ['braintree', '$', 'requestservice', 'logger', 'CommonModel', '$stateParams', 'UserModel'];
    /* @ngInject */
    function subscriptionForm(braintree, $, requestservice, logger, CommonModel, $stateParams, UserModel) {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/models/subscription/subscription_form.html',
            link: function (scope, element, attr) {

                var form = element.find('#my-sample-form')[0];
                var submit = element.find('#submit-button')[0];
                var paypalButton = element.find('#paypal-button')[0];

                braintree.client.create({
                    authorization: attr.token
                }, function (clientErr, clientInstance) {
                    if (clientErr) {
                        logger.error(clientErr.message);
                        return;
                    }

                    braintree.hostedFields.create({
                        client: clientInstance,
                        styles: {
                            'input': {
                                'font-size': '14pt'
                            },
                            'input.invalid': {
                                'color': 'red'
                            },
                            'input.valid': {
                                'color': 'green'
                            }
                        },
                        fields: {
                            number: {
                                selector: '#card-number',
                                placeholder: '4111 1111 1111 1111'
                            },
                            cvv: {
                                selector: '#cvv',
                                placeholder: '123'
                            },
                            expirationDate: {
                                selector: '#expiration-date',
                                placeholder: '10 / 2019'
                            }
                        }
                    }, function (hostedFieldsErr, hostedFieldsInstance) {
                        if (hostedFieldsErr) {
                            logger.error(hostedFieldsErr.message);
                            return;
                        }

                        hostedFieldsInstance.on('empty', function (event) {
                            $('#card-image').removeClass();
                            $(form).removeClass();
                        });

                        hostedFieldsInstance.on('cardTypeChange', function (event) {
                            // Change card bg depending on card type
                            if (event.cards.length === 1) {
                                $(form).removeClass().addClass(event.cards[0].type);
                                $('#card-image').removeClass().addClass(event.cards[0].type);
                                $('header').addClass('header-slide');

                                // Change the CVV length for AmericanExpress cards
                                if (event.cards[0].code.size === 4) {
                                    hostedFieldsInstance.setPlaceholder('cvv', '1234');
                                }
                            } else {
                                hostedFieldsInstance.setPlaceholder('cvv', '123');
                            }
                        });

                        submit.removeAttribute('disabled');

                        form.addEventListener('submit', function (event) {
                            event.preventDefault();

                            console.log(attr);
                            console.log(attr.agreed);

                            if (!JSON.parse(attr.agreed)) {
                                logger.error('Please, agree to Terms and Conditions');
                                return;
                            }

                            window.dataLayer = window.dataLayer || [];
                            window.dataLayer.push({ 'event': 'trackUpgrade', 'eventCategory': 'Upgrade', 'eventAction': 'Direct Payment', 'eventLabel': 'Annual Subscription' });

                            hostedFieldsInstance.tokenize(function (tokenizeErr, payload) {
                                if (tokenizeErr) {
                                    logger.error(tokenizeErr.message);
                                    return;
                                }
                                sendNonceToServer(payload);
                            });
                        });

                    });

                    // Create a PayPal component.
                    braintree.paypal.create({
                        client: clientInstance
                    }, function (paypalErr, paypalInstance) {

                        // Stop if there was a problem creating PayPal.
                        // This could happen if there was a network error or if it's incorrectly
                        // configured.
                        if (paypalErr) {
                            logger.error(paypalErr.message);
                            return;
                        }

                        // Enable the button.
                        paypalButton.removeAttribute('disabled');

                        // When the button is clicked, attempt to tokenize.
                        paypalButton.addEventListener('click', function (event) {

                            if (!JSON.parse(attr.agreed)) {
                                logger.error('Please, agree to Terms and Conditions');
                                return;
                            }
                            window.dataLayer = window.dataLayer || [];
                            window.dataLayer.push({ 'event': 'trackUpgrade', 'eventCategory': 'Upgrade', 'eventAction': 'PayPal', 'eventLabel': 'Monthly Subscription'});

                            // Because tokenization opens a popup, this has to be called as a result of
                            // customer action, like clicking a button—you cannot call this at any time.
                            paypalInstance.tokenize({
                                flow: 'vault'
                            }, function (tokenizeErr, payload) {

                                // Stop if there was an error.
                                if (tokenizeErr) {
                                    if (tokenizeErr.type !== 'CUSTOMER') {
                                        console.error('Error tokenizing:', tokenizeErr);
                                    }
                                    return;
                                }

                                // Tokenization succeeded!
                                paypalButton.setAttribute('disabled', true);
                                sendNonceToServer(payload);
                            });

                        }, false);

                    });

                    function sendNonceToServer(payload) {
                        requestservice.run('createSubscription', {
                            nonce: payload.nonce,
                            plan: attr.plan,
                            'league_id': parseInt($stateParams['league_id']) || CommonModel.selectedClub['league_id']
                        }).then(function (received) {
                            if (received.data.success === 0) {
                                logger.success('Subscription successfully created. Please, reload the page for the changes to take effect.');

                                var data = {
                                    data: {
                                        result: {
                                            subscription: {
                                                'isTrial': received.data.isTrial,
                                                'end_date': received.data['end_date']
                                            }
                                        }
                                    }
                                };


                                UserModel.parseSubscription(data)
                                scope.closeThisDialog();
                            } else {
                                logger.error(received.data.message);
                            }
                            return received;
                        });
                    }
                });
            }
        };
        return directive;
    }
})();
