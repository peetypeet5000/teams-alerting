# Teams Alerting

This package is used to send errors and general alerts to a Microsoft Teams channel via a Webhook.

[![Node.js CI](https://github.com/peetypeet5000/teams-alerting/actions/workflows/node.js.yml/badge.svg)](https://github.com/peetypeet5000/teams-alerting/actions/workflows/node.js.yml)

## Requirements

This module is compatible with NodeJS v16.x and later. It also requires a Microsoft Teams Team and the ability to create channels and Webhooks.

## Example Usage

ESM:

```javascript
// Import and Setup
import { postMessage, setup } from 'teams-alerting';
setup('Project', [
  { url: 'example-url', name: 'channel1' },
  { url: 'example-url2', name: 'channel2' },
]);

// Call as many times as you'd like!
postMessage('Error!', [new Error()], 'channel1');
postMessage('A different Error', ['This string gives more details'], 'channel2');

try {
  throw new Error('Error details');
} catch (e) {
  postMessage('Here we directly log an error we caught', [e], 'channel1');
}
```

CommonJS:

```javascript
const alerts = require('teams-alerting');
alerts.setup('Project', [{ url: 'example-url', name: 'channel1' }]);

// Channel parameter is optional if only one channel is defined
try {
  throw new Error('This is an error');
} catch (e) {
  alerts.postMessage('Error!', ['This is a string', e]);
}
```

### Set-up

The exported function

```typescript
function setup(appName: string, channels: Channel[]);
```

needs to be run once per project to specify the channels to send to and the name of the program. Once this function has been run, you can call `postMessage()` to send alerts. If you'd like to send alerts in a different file in the same project, you don't need to run setup again. The `appName` parameter specifies the name of the program and this will be included with every alert. The `channels` array specifies the different Teams channels you want to send messages to. You can define as many channels as you'd like, but you must define at least one. Each channel must have key `url` and `name` populated.

### Posting Alerts

The exported function

```typescript
async function postMessage(header: string, sections: Array<Error | string>, channel: string | undefined): Promise<void>;
```

is used to post messages to the teams channel. In it, you specify a header for the message that is displayed prominently. Then, you can add up to 9 sections to the message. A section can either be a string or an `Error` object. Lastly, you can define the channel to send the message to, which is the channel.name property you passed into `setup` earlier. If only one channel is defined in `setup`, this parameter is optional and all messages are sent to that channel.

## Images

A single error object being logged:
![An error object being logged](/screenshots/ErrorObject.png)

A single alert string being logged:
![An alert being logged](/screenshots/Alert.png)

Both being logged:
![Both being logged](/screenshots/Both.png)

## Reference

1. [Connector card for Microsoft 365 Groups](https://learn.microsoft.com/en-us/microsoftteams/platform/task-modules-and-cards/cards/cards-reference#connector-card-for-microsoft-365-groups)
2. [Format Cards in Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/platform/task-modules-and-cards/cards/cards-format?tabs=adaptive-md%2Cdesktop%2Cconnector-html)
3. [Schema Reference](https://learn.microsoft.com/en-us/outlook/actionable-messages/message-card-reference#actions)
