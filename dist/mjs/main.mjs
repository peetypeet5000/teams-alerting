import axios from 'axios';
// Internal State
const definedChannels = [];
let definedAppName;
/**
 * Returns day and time nicely formatted for alert
 * @returns {Promise<String>} - Date & Time String
 */
function getPrettyDate() {
    const date = new Date();
    return date.toLocaleString();
}
/**
 * Axios POST for the postTeamsMessage function
 * @param {cardObject} message - Correct card object from postTeamsMessage()
 * @param {string} url - a URL for the teams webhook
 *
 * @returns {Promise<responce>} - Response object
 */
async function doPost(message, url) {
    const postMessage = {
        method: 'POST',
        url: `${url}`,
        data: message,
        headers: {
            'Content-Type': 'application/vnd.microsoft.teams.card.o365connector',
        },
    };
    const res = await axios(postMessage);
    return res;
}
/**
 * Verifys the URL is parsable and of protocol https. This functions
 * throws errors to indicate it is not valid
 * @param {String} url - URL of teams channel to send webhook to
 */
function validateURL(url) {
    try {
        const validatedURL = new URL(url);
        if (validatedURL.protocol !== 'https:') {
            throw new Error(`URL ${url} is not https`);
        }
    }
    catch (e) {
        console.error(e);
        throw new Error(`URL ${url} is invalid`);
    }
}
/**
 * Setup App Name and Channels for future alerts. Must be run at least once
 * per project before postMessage
 * @param {string} appName - Name of app to be logged
 * @param {Channel[]} channels - Array of Channel objects to send messages to
 */
export function setup(appName, channels) {
    if (appName.length < 1) {
        throw new Error('App Name cannot be blank');
    }
    definedAppName = appName;
    if (!Array.isArray(channels)) {
        throw new Error('You must define at least one channel');
    }
    channels.forEach((channel) => {
        validateURL(channel.url);
        for (let i = 0; i < definedChannels.length; i++) {
            if (definedChannels[i].name === channel.name) {
                throw new Error(`Channel ${channel.name} already exists, pick a different name`);
            }
        }
        definedChannels.push({ url: channel.url, name: channel.name });
    });
}
/**
 * Log a JS Error object or string to Teams
 * @param {string} header - String for alert header
 * @param {Error[]|string[]} sections Array of things to be logged. Can be strings or Error objects
 * @param {string} channel Name of channel to send message to. Can be undefined if only one channel exists
 */
export async function postMessage(header, sections, channel) {
    if (definedAppName === '' || definedChannels.length <= 0) {
        throw new Error('You must defined an App Name and Channels with setup() first');
    }
    if (sections.length < 1 || sections.length > 9) {
        throw new Error('At least one and no more than 9 message section must be defined');
    }
    // format card
    const card = {
        '@type': 'messageCard',
        '@context': 'https://schema.org/extensions',
        title: `Alert: ${header}`,
        summary: `New alert for ${definedAppName}`,
        sections: [
            {
                facts: [
                    { name: 'App Name:', value: definedAppName },
                    { name: 'Time: ', value: getPrettyDate() },
                ],
            },
        ],
    };
    // If the error is an error object, append the stack trace
    sections.forEach((section) => {
        if (section instanceof Error && section.stack != null) {
            card.sections.push({
                title: '**Error Message:**',
                text: `\`${section.message}\``,
            }, {
                title: '**Stack:**',
                // Pops the error message off the stack and formats so it prints correctly
                text: '\n' + section.stack.slice(section.stack.indexOf('\n')),
            });
            // Otherwise, just print the string
        }
        else {
            card.sections.push({
                title: '**Alert Message:**',
                text: `${section}`,
            });
        }
    });
    // If only one channel, always use that. Otherwise, find matching channel name
    if (definedChannels.length === 1) {
        void doPost(card, definedChannels[0].url);
    }
    else {
        if (typeof channel === 'undefined') {
            throw new Error('Channel name not defined');
        }
        else {
            const channelToSend = definedChannels.find((c) => (c.name === channel));
            if (channelToSend == null) {
                throw new Error(`Could not find channel with name ${channel}`);
            }
            else {
                void doPost(card, channelToSend.url);
            }
        }
    }
}
