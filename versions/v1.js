function mapToInflux(state) {
  const { status, modifiers } = state;
  const { reboot, halt, calibrateSoil, imageInterval, morningTime, nightTime, camerasEnabled } = modifiers;
  const { id, cameras, halted, debug, soilCalibrating, piStats, currentTemp, currentHumid, currentSoil } = status;
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
      time
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
      time
    }
  }

  const tempMeasurement = {
    measurement: 'temp',
    tags: {
      id
    },
    fields: {
      reading: currentTemp.temp,
      time: currentTemp.time
    }
  }

  const humidMeasurement = {
    measurement: 'humid',
    tags: {
      id
    },
    fields: {
      reading: currentHumid.humid,
      time: currentHumid.time
    }
  }

  const soilMeasurements = currentSoil.map((soil) => {
    return {
      measurement: 'soil',
      tags: {
        id
      },
      fields: {
        reading: soil.reading,
        time: soil.time,
        median: soil.median,
        standardDev: soil.standardDev,
        pin: soil.pin
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

module.exports = {
  mapToInflux
}