const path = require('path')
const nunjucks = require('nunjucks')
const config = require('../config')
const pkg = require('../../package.json')
const G4AnalyticsAccount = config.G4AnalyticsAccount
const GTagManagerId = config.GTagManagerId

module.exports = {
  plugin: require('@hapi/vision'),
  options: {
    engines: {
      html: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment)

          return (context) => {
            return template.render(context)
          }
        },
        prepare: (options, next) => {
          options.compileOptions.environment = nunjucks.configure([
            path.join(options.relativeTo || process.cwd(), options.path),
            'node_modules/govuk-frontend/dist/govuk/',
            'node_modules/govuk-frontend/dist/govuk/components/'
          ], {
            autoescape: true,
            watch: false
          })

          return next()
        }
      }
    },
    path: '../views',
    relativeTo: __dirname,
    isCached: !config.isDev,
    context: {
      appVersion: pkg.version,
      assetPath: '/assets',
      serviceRef: 'LTF-App',
      serviceName: 'Check your long term flood risk',
      serviceUrl: config.isProd ? 'https://www.gov.uk/check-long-term-flood-risk' : '/postcode',
      pageTitle: 'Check your long term flood risk',
      G4AnalyticsAccount,
      GTagManagerId,
      appStage: config.env,
      floodWarningsUrl: config.floodWarningsUrl,
      phase: 'beta',
      feedback: true,
      siteUrl: config.floodRiskUrl,
      ogDescription: 'Check your risk of flooding and use flood risk maps',
      noIndex: true, // stop robot crawl by default
      friendlyCaptchaEnabled: config.friendlyCaptchaEnabled,
      friendlyCaptchaSiteKey: config.friendlyCaptchaSiteKey
    }
  }
}
