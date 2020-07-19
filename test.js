const protoManager = require('./index');

protoManager.initialize();

async function run() {
  const packages = [];
  await protoManager.readDatabase(1, './database.db', ({ headers, data }) => {
    const state = protoManager.readState(headers.version, data);
    packages.push({ headers, state });
  });

  console.log(packages);
}

run();
