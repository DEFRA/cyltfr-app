const config = require('../config')
const {
  getCookiePolicy,
  removeAnalyticsCookies
} = require('../services/cookie-policy')

const cookiePolicyOptions = {
  ttl: 1000 * 60 * 60 * 24 * 365,
  isSecure: (!config.isDev),
  encoding: 'base64json',
  clearInvalid: false,
  isSameSite: 'Lax'
}

module.exports = {
  plugin: {
    name: 'cookies',
    register: (server, options) => {
      server.state('cookies_policy', cookiePolicyOptions)

      server.ext('onPreResponse', (request, h) => {
        if (request.response.variety === 'view') {
          const cookiesPolicy = getCookiePolicy(request)
          const response = request.response
          const context = response.source.context || {}

          Object.assign(context, { cookiesPolicy })

          response.source.context = context

          if (cookiesPolicy?.analytics === false) {
            removeAnalyticsCookies(request, h)
          }
        }

        return h.continue
      })
    }
  }
}
