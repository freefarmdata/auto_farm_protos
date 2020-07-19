const fs = require('fs');
const util = require('util');

const asyncOpen = util.promisify(fs.open);
const asyncRead = util.promisify(fs.read);

const HEADERS_SIZE = 12;

function parseHeaders(buffer) {
  const software = Buffer.from(buffer.slice(0, 4)).readInt32LE();
  const version = Buffer.from(buffer.slice(4, 8)).readInt32LE();
  const length = Buffer.from(buffer.slice(8, 12)).readInt32LE();
  return { software, version, length };
}

function mapToInflux(state) {
  const { status, modifiers } = state;
  const { reboot, halt, calibrateSoil, imageInterval, morningTime, nightTime, camerasEnabled } = modifiers;
  const { id, software, cameras, halted, debug, soilCalibrating, piStats, currentTemp, currentHumid, currentSoil } = status;
  const { piTemp, piVolts, upTime, time } = piStats;

  const statusMeasurement = {
    measurement: 'status',
    tags: {
      id
    },
    fields: {
      software,
      cameras,
      halted,
      debug,
      soilCalibrating,
      piTemp,
      piVolts,
      upTime,
      readTime: time
    }
  }

  const modsMeasurement = {
    measurement: 'modifiers',
    tags: {
      id
    },
    fields: {
      reboot,
      halt,
      calibrateSoil,
      imageInterval,
      morningTime,
      nightTime,
      camerasEnabled,
      readTime: time
    }
  }

  const tempMeasurement = {
    measurement: 'temp',
    tags: {
      id
    },
    fields: {
      reading: currentTemp.temp,
      readTime: currentTemp.time
    }
  }

  const humidMeasurement = {
    measurement: 'humid',
    tags: {
      id
    },
    fields: {
      reading: currentHumid.humid,
      readTime: currentHumid.time
    }
  }

  const soilMeasurements = currentSoil.map((soil) => {
    return {
      measurement: 'soil',
      tags: {
        id,
        pin: soil.pin.toString()
      },
      fields: {
        reading: soil.reading,
        readTime: soil.time,
        median: soil.median,
        standardDev: soil.standardDev,
      }
    }
  });

  return [
    statusMeasurement,
    modsMeasurement,
    tempMeasurement,
    humidMeasurement,
    ...soilMeasurements
  ]
}

async function readDatabase(filePath, callback) {
  const fd = await asyncOpen(filePath, 'r');

  let offset = 0;
  while (true) {
    let headers = new Buffer.alloc(HEADERS_SIZE); 
    headers = await asyncRead(fd, headers, 0, HEADERS_SIZE, offset);
    if (headers.bytesRead <= 0) {
      break;
    }

    headers = parseHeaders(headers.buffer);
    offset += HEADERS_SIZE;
    
    let data = new Buffer.alloc(headers.length);
    data = await asyncRead(fd, data, 0, headers.length, offset);
    if (data.bytesRead <= 0) {
      break;
    }

    data = data.buffer;
    offset += headers.length;

    callback({ headers, data });
  }

  fs.closeSync(fd);
}

module.exports = {
  mapToInflux,
  readDatabase
}