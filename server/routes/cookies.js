const joi = require('joi')

module.exports = [
  {
    method: 'GET',
    path: '/cookies',
    handler: async (request, h) => {
      const { query } = request
      const { updated } = query
      return h.view('cookies', { updated })
    },
    options: {
      description: 'Get Cookies Page',
      validate: {
        query: joi.object({
          updated: joi.boolean().default(false)
        }).required()
      }
    }
  },
  {
    method: 'POST',
    path: '/cookies',
    handler: async (request, h) => {
      const { payload, state = {} } = request
      const { analytics, async } = payload
      const { cookies_policy: cookiesPolicy = {} } = state

      // Update cookie analytics preference
      cookiesPolicy.analytics = analytics

      // And update cookie state
      h.state('cookies_policy', cookiesPolicy)

      if (async) {
        return h.response('ok')
      }

      return h.redirect('/cookies?updated=true')
    },
    options: {
      description: 'Submit Cookies Page',
      validate: {
        payload: joi.object({
          analytics: joi.boolean().required(),
          async: joi.boolean().default(false)
        }).required(),
        failAction: async (request, h, err) => {
          return h.view('cookies').takeover()
        }
      }
    }
  }
]
