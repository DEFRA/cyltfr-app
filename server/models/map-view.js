const maps = require('./maps.json')

class MapViewModel {
  constructor (easting, northing, address, backLinkUri, mapToken, osToken, osTokenExpiry) {
    this.maps = maps
    this.easting = easting
    this.northing = northing
    this.address = address
    this.local = !!easting
    this.date = Date.now()
    this.year = new Date().getFullYear()
    this.backLink = backLinkUri
    this.mapToken = mapToken
    this.osToken = osToken
    this.osTokenExpiry = osTokenExpiry
  }
}

module.exports = MapViewModel
