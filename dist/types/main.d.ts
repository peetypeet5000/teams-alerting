interface Channel {
    url: string;
    name: string;
}
/**
 * Setup App Name and Channels for future alerts. Must be run at least once
 * per project before postMessage
 * @param {string} appName - Name of app to be logged
 * @param {Channel[]} channels - Array of Channel objects to send messages to
 */
export declare function setup(appName: string, channels: Channel[]): void;
/**
 * Log a JS Error object or string to Teams
 * @param {string} header - String for alert header
 * @param {Error[]|string[]} sections Array of things to be logged. Can be strings or Error objects
 * @param {string} channel Name of channel to send message to. Can be undefined if only one channel exists
 */
export declare function postMessage(header: string, sections: Array<Error | string>, channel: string | undefined): Promise<void>;
export {};
