const util = require('../util')
const config = require('../config')
const url = config.serviceUrl
const floodRiskUrl = url + '/floodrisk/'

function getByCoordinates (x, y, radius) {
  const uri = floodRiskUrl + x + '/' + y + '/' + radius

  return util.getJson(uri)
}

module.exports = {
  getByCoordinates
}
