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

module.exports = {
  mapToInflux
}