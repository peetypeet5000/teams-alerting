const axios = require('axios');
const { setup, postMessage } = require('../dist/cjs/main.cjs');

const ONE_SECTION_CARD = {
  method: 'POST',
  url: 'https://test.com',
  data: {
    '@type': 'messageCard',
    '@context': 'https://schema.org/extensions',
    title: 'Alert: Alert Header',
    summary: 'New alert for AppName',
    sections: [
      {
        facts: [
          { name: 'App Name:', value: 'AppName' },
          { name: 'Time: ', value: `${new Date().toLocaleString()}` },
        ],
      },
      { title: '**Alert Message:**', text: 'Alert Message' },
    ],
  },
  headers: {
    'Content-Type': 'application/vnd.microsoft.teams.card.o365connector',
  },
};

const TWO_SECTION_CARD = {
  method: 'POST',
  url: 'https://test.com',
  data: {
    '@type': 'messageCard',
    '@context': 'https://schema.org/extensions',
    title: 'Alert: Alert Header',
    summary: 'New alert for AppName',
    sections: [
      {
        facts: [
          { name: 'App Name:', value: 'AppName' },
          { name: 'Time: ', value: `${new Date().toLocaleString()}` },
        ],
      },
      { title: '**Alert Message:**', text: 'Alert Message' },
      { title: '**Alert Message:**', text: 'Second Alert Message' },
    ],
  },
  headers: {
    'Content-Type': 'application/vnd.microsoft.teams.card.o365connector',
  },
};

const testError = new Error('Test Error');
const ERROR_CARD = {
  method: 'POST',
  url: 'https://test.com',
  data: {
    '@type': 'messageCard',
    '@context': 'https://schema.org/extensions',
    title: 'Alert: Alert Header',
    summary: 'New alert for AppName',
    sections: [
      {
        facts: [
          { name: 'App Name:', value: 'AppName' },
          { name: 'Time: ', value: `${new Date().toLocaleString()}` },
        ],
      },
      { title: '**Error Message:**', text: `\`${testError.message}\`` },
      {
        title: '**Stack:**',
        text: '\n' + testError.stack.slice(testError.stack.indexOf('\n')),
      },
    ],
  },
  headers: {
    'Content-Type': 'application/vnd.microsoft.teams.card.o365connector',
  },
};

const COMBINATION_CARD = {
  method: 'POST',
  url: 'https://test.com',
  data: {
    '@type': 'messageCard',
    '@context': 'https://schema.org/extensions',
    title: 'Alert: Alert Header',
    summary: 'New alert for AppName',
    sections: [
      {
        facts: [
          { name: 'App Name:', value: 'AppName' },
          { name: 'Time: ', value: `${new Date().toLocaleString()}` },
        ],
      },
      { title: '**Alert Message:**', text: 'Alert Message' },
      { title: '**Error Message:**', text: `\`${testError.message}\`` },
      {
        title: '**Stack:**',
        text: '\n' + testError.stack.slice(testError.stack.indexOf('\n')),
      },
    ],
  },
  headers: {
    'Content-Type': 'application/vnd.microsoft.teams.card.o365connector',
  },
};

jest.mock('axios');

describe('postMessage', () => {
  describe('postMessage formatting', () => {
    beforeAll(() => {
      setup('AppName', [{ url: 'https://test.com', name: 'default' }]);
    });

    it('correctly formats a 1 section card', () => {
      postMessage('Alert Header', ['Alert Message'], 'default');

      expect(axios).toHaveBeenCalledWith(ONE_SECTION_CARD);
    });

    it('correctly formats a 2 section card', () => {
      postMessage('Alert Header', ['Alert Message', 'Second Alert Message'], 'default');

      expect(axios).toHaveBeenCalledWith(TWO_SECTION_CARD);
    });

    it('correctly formats an error card', () => {
      postMessage('Alert Header', [testError], 'default');

      expect(axios).toHaveBeenCalledWith(ERROR_CARD);
    });

    it('correctly formats a combination card', () => {
      postMessage('Alert Header', ['Alert Message', testError], 'default');

      expect(axios).toHaveBeenCalledWith(COMBINATION_CARD);
    });
  });

  describe('postMessage validation', () => {
    it('requires at least 1 section', async () => {
      await expect(postMessage('Alert Header', [], 'default')).rejects.toThrow(
        'At least one and no more than 9 message section must be defined'
      );
    });

    it('requires less than 10 sections', async () => {
      await expect(
        postMessage('Alert Header', ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], 'default')
      ).rejects.toThrow('At least one and no more than 9 message section must be defined');
    });

    it('allows excluding channel name if only one exists', async () => {
      postMessage('Alert Header', ['Alert Message']);

      expect(axios).toHaveBeenCalledWith(ONE_SECTION_CARD);
    });

    it('requires a channel name if multiple channels exist', async () => {
      jest.resetModules();
      const alerts = require('../dist/cjs/main.cjs');

      alerts.setup('AppName', [
        { url: 'https://oregonstateuniversity.webhook.office.com', name: 'default' },
        { url: 'https://test.com', name: 'high' },
      ]);

      alerts.postMessage('Alert Header', ['Message Section'], 'high');

      expect(axios).toHaveBeenCalledWith(ONE_SECTION_CARD);
    });

    it('picks the correct channel when mulitple exist', async () => {
      jest.resetModules();
      const alerts10 = require('../dist/cjs/main.cjs');

      alerts10.setup('AppName', [
        { url: 'https://test.org', name: 'default' },
        { url: 'https://test.com', name: 'high' },
        { url: 'https://test.edu', name: 'low' },
      ]);

      await expect(alerts10.postMessage('Alert Header', ['Message Section'])).rejects.toThrow(
        'Channel name not defined'
      );
    });

    it('requires setup() to have been called first', async () => {
      jest.resetModules();
      const alerts = require('../dist/cjs/main.cjs');

      await expect(alerts.postMessage('Alert Header', ['Message Section'])).rejects.toThrow(
        'You must defined an App Name and Channels with setup() first'
      );
    });
  });

  it('errors if an undefined channel name is requested', async () => {
    jest.resetModules();
    const alerts9 = require('../dist/cjs/main.cjs');

    alerts9.setup('AppName', [
      { url: 'https://oregonstateuniversity.webhook.office.com', name: 'default' },
      { url: 'https://test.com', name: 'high' },
    ]);

    await expect(alerts9.postMessage('Alert Header', ['Message Section'], 'balls')).rejects.toThrow(
      `Could not find channel with name balls`
    );
  });
});

describe('setup', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('requires at least one channel', () => {
    const alerts1 = require('../dist/cjs/main.cjs');

    expect(() => {
      alerts1.setup('AppName');
    }).toThrow('You must define at least one channel');
  });

  it('requires an appname', () => {
    const alerts2 = require('../dist/cjs/main.cjs');

    expect(() => {
      alerts2.setup('', []);
    }).toThrow('App Name cannot be blank');
  });

  it('rejects invalid URLs', () => {
    const alerts5 = require('../dist/cjs/main.cjs');

    expect(() => {
      alerts5.setup('AppName', [{ url: 'not-a-url', name: 'default' }]);
    }).toThrow(`URL not-a-url is invalid`);
  });

  it('rejects non https URLs', () => {
    const alerts6 = require('../dist/cjs/main.cjs');

    expect(() => {
      alerts6.setup('AppName', [{ url: 'http://url.com', name: 'default' }]);
    }).toThrow('URL http://url.com is invalid');
  });

  it('allows multiple valid channels', () => {
    const alerts3 = require('../dist/cjs/main.cjs');

    alerts3.setup('AppName', [
      { url: 'https://oregonstateuniversity.webhook.office.com', name: 'default' },
      { url: 'https://test.com', name: 'high' },
    ]);

    alerts3.postMessage('Alert Header', ['Alert Message'], 'high');

    expect(axios).toHaveBeenCalledWith(ONE_SECTION_CARD);
  });

  it('requires unique channel names', () => {
    const alerts7 = require('../dist/cjs/main.cjs');

    expect(() => {
      alerts7.setup('AppName', [
        { url: 'https://oregonstateuniversity.webhook.office.com', name: 'default' },
        { url: 'https://test.com', name: 'default' },
      ]);
    }).toThrow('Channel default already exists, pick a different name');
  });
});
