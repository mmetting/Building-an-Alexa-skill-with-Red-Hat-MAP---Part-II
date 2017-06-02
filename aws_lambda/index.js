'use strict';

const Alexa = require('alexa-sdk');

const APP_ID = undefined;

const languageStrings = {
    'en': {
        translation: {
            FEEDS: {},
            SKILL_NAME: 'Red Hat Mobile RSS',
            WELCOME_MESSAGE: "Welcome to %s. You can ask me about recent open source news ... Now, what can I help you with?",
            WELCOME_REPROMT: 'For instructions on what you can say, please say help me.',
            HELP_MESSAGE: "Ask me to fetch the most recent feeds",
            HELP_REPROMT: "Ask me to fetch the most recent feeds",
            STOP_MESSAGE: 'Goodbye!',
            SOMETHING_WENT_WRONG: 'Ups, something went wrong!',
            RANDOM_FEED: 'Here is a new open source feed:\n\n'
        }
    },
    'de': {
        translation: {
            FEEDS: {},
            SKILL_NAME: 'Red Hat Mobile RSS',
            WELCOME_MESSAGE: 'Willkommen bei %s. Du kannst dir die aktuellsten open source feeds vorlesen lassen ... Nun, womit kann ich dir helfen?',
            WELCOME_REPROMT: 'Wenn du wissen möchtest, was du sagen kannst, sag einfach „Hilf mir“.',
            HELP_MESSAGE: 'Frag mich, die Feeds zu laden',
            HELP_REPROMT: 'Frag mich, die Feeds zu laden',
            STOP_MESSAGE: 'Auf Wiedersehen!',
            SOMETHING_WENT_WRONG: 'Ups, es ist etwas schief gegangen!',
            RANDOM_FEED: 'Hier ist ein neuer News Feed:\n\n'
        }
    }
};

const handlers = {
    'LaunchRequest': function () {
        this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('SKILL_NAME'));
        this.attributes.repromptSpeech = this.t('WELCOME_REPROMT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'FeedsIntent': function () {
        var feeds = this.t('FEEDS');
        
        fetchFeeds()
        .then((feeds) => {
            if (feeds.length > 0) {
                var firstFeed = feeds[0];
                this.emit(':tell', this.t('RANDOM_FEED') + firstFeed.teaser);
            }
        })
        .catch((err) => {
            this.emit(':tell', this.t('SOMETHING_WENT_WRONG'));
        });
    },
    'AMAZON.HelpIntent': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'Unhandled': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const https = require('https');
function fetchFeeds() {

    return new Promise((resolve, reject) => {
        var options = {
            hostname: 'mmetting-xjgjgwu35npdekfvycwbkama-demos-dev.mbaas2.tom.redhatmobile.com',
            port: 443,
            path: '/feeds',
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        https.get(options, (res) => {
            
            const body = [];
            
            res.on('data', (chunk) => body.push(chunk));
            res.on('end', () => {
                var feeds = JSON.parse(body.join('')).data;

                console.log(feeds);
                resolve(feeds);
            });

        }).on('error', (e) => {
            console.log(e);
            reject(e);
        });
    });
}

