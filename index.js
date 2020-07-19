const protobuf = require('protobufjs');
const path = require('path');

const versions = require('./versions');

function loadProtoFile(file) {
  return protobuf.loadSync(path.join(__dirname, `protos/${file}.proto`));
}

/**
 * Object containing all the protobuf objects loaded.
 * Uses protobufjs under the covers.
 */
const Schemas = {
  V1: {
    HumidReading: null,
    SoilReading: null,
    TempReading: null,
    SoilStorage: null,
    TempStorage: null,
    HumidStorage: null,
    Status: null,
    Modifiers: null,
    State: null
  }
};

const Versions = {
  1: {
    schema: Schemas.V1,
    mapToInflux: versions.V1.mapToInflux,
    readDatabase: versions.V1.readDatabase,
  }
}

/**
 * Loads the protobuf files into the Schemas object.
 */
function initialize() {
  const V1 = loadProtoFile('v1');
  Schemas.V1.HumidReading = V1.lookupType('HumidReading');
  Schemas.V1.SoilReading = V1.lookupType('SoilReading');
  Schemas.V1.TempReading = V1.lookupType('TempReading');
  Schemas.V1.SoilStorage = V1.lookupType('SoilStorage');
  Schemas.V1.TempStorage = V1.lookupType('TempStorage');
  Schemas.V1.HumidStorage = V1.lookupType('HumidStorage');
  Schemas.V1.Status = V1.lookupType('Status');
  Schemas.V1.Modifiers = V1.lookupType('Modifiers');
  Schemas.V1.State = V1.lookupType('State');
}

function readState(version, buffer) {
  if (Versions[version]) {
    const schema = Versions[version].schema.State;
    return schema.decode(buffer);
  }
  throw new Error(`Version ${version} is invalid`);
}

function mapToInflux(version, state) {
  if (Versions[version]) {
    return Versions[version].mapToInflux(state);
  }
  throw new Error(`Version ${version} is invalid`);
}

async function readDatabase(version, filePath, callback) {
  if (Versions[version]) {
    return await Versions[version].readDatabase(filePath, callback);
  }
  throw new Error(`Version ${version} is invalid`);
}

module.exports = {
  initialize,
  readState,
  mapToInflux,
  readDatabase,
  Versions,
  Schemas
};