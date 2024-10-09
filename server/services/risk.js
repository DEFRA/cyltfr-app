const util = require('../util')
const config = require('../config')

function getByCoordinates (x, y, radius) {
  const uri = `${config.serviceUrl}/floodrisk/${x}/${y}/${radius}`

  return util.getJson(uri)
}

function swDepthRisk (x, y) {
  const uri = `${config.serviceUrl}/swdepth/${x}/${y}`

  return util.getJson(uri)
}

function rsDepthRisk (x, y) {
  const uri = `${config.serviceUrl}/rsdepth/${x}/${y}`

  return util.getJson(uri)
}

module.exports = {
  getByCoordinates, swDepthRisk, rsDepthRisk
}
