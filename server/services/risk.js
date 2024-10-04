const util = require('../util')
const config = require('../config')
const url = config.serviceUrl
const floodRiskUrl = url + '/floodrisk/'
const swDepthRiskUrl = url + '/swdepth/'
const rsDepthRiskUrl = url + '/rsdepth/'

function getByCoordinates (x, y, radius) {
  const uri = floodRiskUrl + x + '/' + y + '/' + radius

  return util.getJson(uri)
}

function swDepthRisk (x, y) {
  const uri = swDepthRiskUrl + x + '/' + y

  return util.getJson(uri)
}

function rsDepthRisk (x, y) {
  const uri = rsDepthRiskUrl + x + '/' + y

  return util.getJson(uri)
}

module.exports = {
  getByCoordinates, swDepthRisk, rsDepthRisk
}
