const maps = require('./maps.json')

class MapViewModel {
  constructor (easting, northing, address, backLinkUri, mapToken) {
    this.maps = maps
    this.easting = easting
    this.northing = northing
    this.address = address
    this.local = !!easting
    this.date = Date.now()
    this.year = new Date().getFullYear()
    this.backLink = backLinkUri
    this.mapToken = mapToken
  }
}

module.exports = MapViewModel
