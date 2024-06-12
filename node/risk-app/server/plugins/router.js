const config = require('../config')
const routes = [].concat(
  require('../routes/home'),
  require('../routes/postcode'),
  require('../routes/search'),
  require('../routes/england-only'),
  require('../routes/risk-data'),
  require('../routes/risk'),
  require('../routes/map'),
  require('../routes/managing-flood-risk'),
  require('../routes/public'),
  require('../routes/gwc-proxy'),
  require('../routes/feedback'),
  require('../routes/os-terms'),
  require('../routes/accessibility-statement'),
  require('../routes/cookies'),
  require('../routes/privacy-notice'),
  require('../routes/terms-and-conditions'),
  require('../routes/healthcheck')
)
if (config.simulateAddressService) {
  routes.push(require('../routes/simulated/os-maps-proxy'))
  routes.push(require('../routes/simulated/os-get-capabilities'))
} else {
  routes.push(require('../routes/os-maps-proxy'))
  routes.push(require('../routes/os-get-capabilities'))
}

if (config.riskPageFlag) {
  routes.push(require('../routes/surface-water'))
  routes.push(require('../routes/rivers-and-sea'))
  routes.push(require('../routes/ground-water'))
}

module.exports = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}
