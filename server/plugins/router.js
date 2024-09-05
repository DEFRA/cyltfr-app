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
  require('../routes/feedback'),
  require('../routes/os-terms'),
  require('../routes/accessibility-statement'),
  require('../routes/cookies'),
  require('../routes/privacy-notice'),
  require('../routes/terms-and-conditions'),
  require('../routes/healthcheck'),
  require('../routes/surface-water'),
  require('../routes/rivers-and-sea'),
  require('../routes/ground-water'),
  require('../routes/os-get-token')
)
if (config.simulateAddressService) {
  routes.push(require('../routes/simulated/os-get-capabilities'))
} else {
  routes.push(require('../routes/os-get-capabilities'))
}

module.exports = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}
