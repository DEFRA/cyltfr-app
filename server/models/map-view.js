let mapDefinition
const fs = require('fs')
const path = require('path')
const config = require('../config')

class MapViewModel {
  constructor (easting, northing, address, backLinkUri, mapConfig) {
    if (!mapDefinition) {
      const filePath = path.join('./server/models/definition/', config.dataVersion)
      const mapData = fs.readFileSync(path.join(filePath, 'maps.json'))
      mapDefinition = JSON.parse(mapData)
    }
    this.maps = mapDefinition
    this.easting = easting
    this.northing = northing
    this.address = address
    this.local = !!easting
    this.date = Date.now()
    this.year = new Date().getFullYear()
    this.backLink = backLinkUri
    this.mapConfig = JSON.stringify(mapConfig)
  }
}

module.exports = MapViewModel
