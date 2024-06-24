const config = require('../config')
const uri = config.geoserverUrl + '/geoserver/gwc/service/wms'

module.exports = {
  method: 'GET',
  path: '/gwc-proxy',
  handler: {
    proxy: {
      mapUri: function (request) {
        const url = uri + request.url.search
        return { uri: url }
      },
      passThrough: true
    }
  },
  options: {
    description: 'Get GWC map proxy'
  }
}
