const maps = require('./maps.json')

class MapViewModel {
  constructor (easting, northing, address, backLinkUri) {
    this.maps = maps
    this.easting = easting
    this.northing = northing
    this.address = address
    this.local = !!easting
    this.date = Date.now()
    this.year = new Date().getFullYear()
    this.backLink = backLinkUri
  }
}

module.exports = MapViewModel
