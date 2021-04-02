const Remarkable = require('remarkable-typescript');
const hydrators = require('../hydrators');
const uuid = require('uuid');

const _ = require('lodash');
// get a list of files
const performList = async (z, bundle) => {
  const client = new Remarkable.Remarkable({deviceToken: bundle.authData.root_token});
  await client.refreshToken();

  let items = await client.getAllItems();

  return items.map((item) => {
    item.id = item.ID;
    return item;
  });
};

// find a particular file by name (or other search criteria)
const performSearch = async (z, bundle) => {
  const client = new Remarkable.Remarkable({deviceToken: bundle.authData.root_token});
  await client.refreshToken();
  let items = await client.getAllItems();

  let arr = [];
  items.forEach(function(item) {
    if (item.VissibleName.includes(bundle.inputData.name)) {
      arr.push(item);
    }
  });

  return arr;
};

// get a particular file by id
const performGet = async (z, bundle) => {
  const client = new Remarkable.Remarkable({deviceToken: bundle.authData.root_token});
  await client.refreshToken();

  const item = client.getItemWithId(bundle.inputData.id);

  bundle.inputData.file = item.BlobURLGet;
  const pdf = z.dehydrateFile(hydrators.downloadFile, {
    file: item.BlobURLGet,
  });

  return item;
};

// creates a new file
const performCreate = async (z, bundle) => {
  const fileResponse = await z.request({
    url: bundle.inputData.file,
    raw: true,
  });

  // pdf = z.dehydrateFile(hydrators.downloadFile);

  const client = new Remarkable.Remarkable({deviceToken: bundle.authData.root_token});
  await client.refreshToken();

  switch (bundle.inputData.filename.split('.').pop()) {
    case 'pdf':
      fileId = await client.uploadPDF(bundle.inputData.filename, fileResponse.buffer());
      break;
    case 'epub':
      fileId = await client.uploadEPUB(bundle.inputData.filename, uuid.v4(), fileResponse.buffer());
      break;
    case 'zip':
      fileId = await client.uploadZip(bundle.inputData.filename, uuid.v4(), fileResponse.buffer());
  }

  return {id: fileId};
};

module.exports = {
  // see here for a full list of available properties:
  // https://github.com/zapier/zapier-platform/blob/master/packages/schema/docs/build/schema.md#resourceschema
  key: 'file',
  noun: 'File',

  // If `get` is defined, it will be called after a `search` or `create`
  // useful if your `searches` and `creates` return sparse objects
  get: {
    display: {
      label: 'Get File',
      description: 'Gets a file.',
    },
    operation: {
      inputFields: [
        {key: 'id', required: true},
      ],
      perform: performGet,
    },
  },

  list: {
    display: {
      label: 'New File',
      description: 'Lists the files.',
    },
    operation: {
      perform: performList,
      // `inputFields` defines the fields a user could provide
      // Zapier will pass them in as `bundle.inputData` later. They're optional on triggers, but required on searches and creates.
      inputFields: [],
    },
  },

  search: {
    display: {
      label: 'Find File',
      description: 'Finds a file given a name.',
    },
    operation: {
      inputFields: [
        {key: 'name', required: true},
      ],
      perform: performSearch,
    },
  },

  create: {
    display: {
      label: 'Upload File',
      description: 'Uploads a new file. *Only pdf, epub and Remarkable zip format supported.',
    },
    operation: {
      inputFields: [
        {key: 'filename', required: false},
        {key: 'file', required: true},
      ],
      perform: performCreate,
    },
  },

  // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
  // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
  // returned records, and have obvious placeholder values that we can show to any user.
  // In this resource, the sample is reused across all methods
  sample: {
    'ID': '015936b9-5cd3-4c6d-95bc-699c7d58b727',
    'Version': 1,
    'Message': '',
    'Success': true,
    'BlobURLGet': 'https://cdn.zapier.com/storage/files/f6679cf77afeaf6b8426de8d7b9642fc.pdf',
    'BlobURLGetExpires': '0001-01-01T00:00:00Z',
    'ModifiedClient': '2021-02-10T01:03:50.699699Z',
    'Type': 'DocumentType',
    'VissibleName': 'Buying',
    'CurrentPage': '1',
  },

  // If fields are custom to each user (like spreadsheet columns), `outputFields` can create human labels
  // For a more complete example of using dynamic fields see
  // https://github.com/zapier/zapier-platform/tree/master/packages/cli#customdynamic-fields
  // Alternatively, a static field definition can be provided, to specify labels for the fields
  // In this resource, these output fields are reused across all resources
  outputFields: [
    {key: 'id', label: 'ID'},
    {key: 'ID', label: 'ID2'},
    {key: 'Version', label: 'Version'},
    {key: 'Message', label: 'Message'},
    {key: 'Success', label: 'Success'},
    {key: 'BlobURLGet', label: 'BlobURLGet'},
    {key: 'BlobURLGetExpires', label: 'BlobURLGetExpires'},
    {key: 'ModifiedClient', label: 'ModifiedClient'},
    {key: 'Type', label: 'Type'},
    {key: 'VissibleName', label: 'Name'},
    {key: 'CurrentPage', label: 'CurrentPage'},
  ],
};
