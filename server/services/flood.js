const config = require('../config')
const util = require('../util')
const floodWarningsUrl = config.floodWarningsUrl

async function findWarnings (location) {
  const url = floodWarningsUrl + '/api/warnings?location=' + location

  return util.getJson(url, true)
}

async function simulateFindWarnings (_location) {
  const simulatedData = require('../routes/simulated/data/warnings-service.json')

  return simulatedData
}

if (config.simulateAddressService) {
  module.exports = {
    findWarnings: simulateFindWarnings
  }
} else {
  module.exports = {
    findWarnings
  }
}
