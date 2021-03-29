'use strict';
const Remarkable = require('remarkable-typescript');
const uuid = require('uuid');

// This function runs before every outbound request. You can have as many as you
// need. They'll need to each be registered in your index.js file.
const includeSessionKeyHeader = (request, z, bundle) => {

  if (bundle.authData.device_token) {
    request.headers = request.headers || {};
    request.headers['Authorization'] = 'Bearer ' + bundle.authData.device_token;
  }
  z.console.log(request);

  return request;
};

const testAuth = (z, bundle) => z.request({
  method: 'GET',
  url: 'https://document-storage-production-dot-remarkable-production.appspot.com/document-storage/json/2/docs',
});

// This function runs after every outbound request. You can use it to check for
// errors or modify the response. You can have as many as you need. They'll need
// to each be registered in your index.js file.
const handleBadResponses = (response, z, bundle) => {
  if (response.status >= 401) {
    throw new z.errors.Error(
        // This message is surfaced to the user
        'The API Key you supplied is incorrect',
        'AuthenticationError',
        response.status,
    );
  }

  return response;
};

/*
* Register your reMarkable and generate a device token. You must do this first to pair your device if you didn't
* specify a token. This may take a few seconds to complete. It seems that the deviceToken never expires.
* Params: { code: string }
* Returns: deviceToken: string
*/
const getSessionKey = async (z, bundle) => {
  if (bundle.authData.device_token) {
    return await refreshAccessToken(z, bundle);
  } else {
    return await getAccessToken(z, bundle);
  }
};

const getAccessToken = async (z, bundle) => {
  const promise = z.request(`https://my.remarkable.com/token/json/2/device/new`, {
    method: 'POST',
    body: {
      code: bundle.authData.one_time_code,
      deviceDesc: 'browser-chrome',
      deviceId: uuid.v4(),
    },
    headers: {
      'content-type': 'application/json',
    },
  });

  // Needs to return at minimum, `access_token`, and if your app also does refresh, then `refresh_token` too
  return promise.then((response) => {
    if (response.status !== 200) {
      throw new Error('Unable to fetch access token: ' + response.content);
    }
    bundle.authData.root_token = response.content;

    return refreshAccessToken(z, bundle);
  });
};

const refreshAccessToken = async (z, bundle) => {
  z.console.log('refreshing');

  const client = new Remarkable.Remarkable({deviceToken: bundle.authData.root_token});
  let token = await client.refreshToken();

  return {
    root_token: bundle.authData.root_token,
    device_token: token,
  };
};

module.exports = {
  config: {
    type: 'session',
    fields: [
      {
        key: 'one_time_code',
        type: 'string',
        label: 'Remarkable One-time Code',
        helpText: 'You must register your reMarkable [here].(https://my.remarkable.com/connect/desktop)',
        required: true,
      },
    ],
    test: testAuth,
    sessionConfig: {
      perform: getSessionKey,
    },
    connectionLabel: 'Remarkable',
  },
  befores: [includeSessionKeyHeader],
  afters: [handleBadResponses],
};