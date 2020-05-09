const protobuf = require('protobufjs');
const path = require('path');

function loadProtoFile(folderPath, file) {
  return protobuf.loadSync(path.join(folderPath, `${file}.proto`));
}

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

function initialize(folderPath) {
  const V1 = loadProtoFile(folderPath, 'v1');
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

module.exports = {
  initialize,
  Schemas
};