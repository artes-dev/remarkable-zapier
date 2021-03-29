/* globals describe, it, expect */
jest.setTimeout(30000);
const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);
let newAuthData;

describe('session auth app', () => {

  zapier.tools.env.inject();
  it('has an exchange for token', async () => {
    const bundle = {
      authData: {
        one_time_code: process.env.ONE_TIME_CODE,
      },
    };

    token = newAuthData = await appTester(
        App.authentication.sessionConfig.perform,
        bundle,
    );
    console.log(newAuthData);
    expect(newAuthData.device_token).toMatch(/^ey/);
  });

  it('has auth details added to every request', async () => {
    const bundle = {
      authData: {
        root_token: newAuthData.root_token,
        device_token: newAuthData.device_token,
      },
    };

    const response = await appTester(App.authentication.test, bundle);
    expect(response.status).toBe(200);
  });
});

