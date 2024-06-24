const config = require('../config')
const util = require('../util')
const urlBase = config.serviceUrl

module.exports = {
  getIsEngland: function (easting, northing) {
    const url = urlBase + '/is-england/' + easting + '/' + northing
    return util.getJson(url)
  }
}
