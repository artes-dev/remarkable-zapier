const {
  config: authentication,
  befores = [],
  afters = [],
} = require('./authentication');

const fileResource = require('./resources/file');
const hydrators = require('./hydrators');

const handleHTTPError = (response, z) => {
  if (response.status >= 400) {
    throw new Error(`Unexpected status code ${response.status}`);
  }
  return response;
};

const App = {
  // This is just shorthand to reference the installed dependencies
  // you have. Zapier will need to know these before we can upload!
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  authentication,

  // beforeRequest & afterResponse are optional hooks into the
  // provided HTTP client
  beforeRequest: [...befores],

  afterResponse: [
    handleHTTPError,
  ],

  hydrators: hydrators,

  // If you want to define optional resources to simplify
  // creation of triggers,  searches, creates - do that here!
  resources: {
    [fileResource.key]: fileResource,
  },

  triggers: {
    // [repoTrigger.key]: repoTrigger,
    // [issueTrigger.key]: issueTrigger,
  },

  searches: {},

  creates: {
    // [issueCreate.key]: issueCreate,
  },
};

// Finally, export the app.
module.exports = App;

// module.exports = {
//   // This is just shorthand to reference the installed dependencies you have.
//   // Zapier will need to know these before we can upload.
//   version: require('./package.json').version,
//   platformVersion: require('zapier-platform-core').version,
//
//   // If you want your trigger to show up, you better include it here!
//   triggers: {},
//
//   // If you want your searches to show up, you better include it here!
//   searches: {},
//
//   // If you want your creates to show up, you better include it here!
//   creates: {},
//
//   resources: {},
// };
