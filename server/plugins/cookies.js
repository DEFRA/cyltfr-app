const cookiePolicyOptions = {
  ttl: 1000 * 60 * 60 * 24 * 365,
  isSecure: true,
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
          const { state } = request
          const cookiesPolicy = (state || {}).cookies_policy
          const response = request.response
          const context = response.source.context || {}

          Object.assign(context, { cookiesPolicy })

          response.source.context = context
        }

        return h.continue
      })
    }
  }
}
