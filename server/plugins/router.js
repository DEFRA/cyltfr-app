const routes = [].concat(
  require('../routes/home'),
  require('../routes/postcode'),
  require('../routes/search'),
  require('../routes/england-only'),
  require('../routes/risk-data'),
  require('../routes/risk'),
  require('../routes/information-for-planning'),
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
  require('../routes/rivers-and-sea-depth'),
  require('../routes/ground-water'),
  require('../routes/surface-water-depth'),
  require('../routes/os-get-token')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}
