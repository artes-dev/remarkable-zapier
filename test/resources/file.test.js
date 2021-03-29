/* globals describe, expect, test, it */
const zapier = require('zapier-platform-core');

// Use this to make test calls into your app:
const App = require('../../index');
const appTester = zapier.createAppTester(App);
// read the `.env` file into the environment, if available
zapier.tools.env.inject();

describe('resources.file', () => {
  it('file list should run', async () => {
    const bundle = {
      authData: {
        'root_token': process.env.DEVICE_TOKEN,
      },
    };

    const results = await appTester(App.resources.file.list.operation.perform, bundle);
    expect(results).toBeDefined();
    // TODO: add more assertions
  });

  it('file creation should run', async () => {
    const bundle = {
      inputData: {
        filename: 'sample.pdf',

        // in production, this will be an hydration URL to the selected file's data
        file: 'https://cdn.zapier.com/storage/files/f6679cf77afeaf6b8426de8d7b9642fc.pdf',
      },
      authData: {
        'root_token': process.env.DEVICE_TOKEN,
      },
    };

    const results = await appTester(App.resources.file.create.operation.perform, bundle);
    expect(results).toHaveProperty('id');
    expect(results.id).toHaveLength(36);
  });

  it('file get should run', async () => {
    const bundle = {
      inputData: {
        id: 'f851be49-acdd-4c2a-bad3-dcea90a98392',
        // in production, this will be an hydration URL to the selected file's data
      },
      authData: {
        'root_token': process.env.DEVICE_TOKEN,
      },
    };

    const results = await appTester(App.resources.file.get.operation.perform, bundle);
    expect(results).toBeDefined();
  });
  it('file search should run', async () => {
    const bundle = {
      inputData: {
        name: 'sample',
        // in production, this will be an hydration URL to the selected file's data
      },
      authData: {
        'root_token': process.env.DEVICE_TOKEN,
      },
    };

    const results = await appTester(App.resources.file.search.operation.perform, bundle);
    console.log(results);
    expect(results).toBeDefined();
  });
});
