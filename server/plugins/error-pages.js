const errors = require('../models/errors.json')

/*
* Add an `onPreResponse` listener to return error pages
*/
module.exports = {
  plugin: {
    name: 'error-pages',
    register: (server, options) => {
      server.ext('onPreResponse', (request, h) => {
        const response = request.response

        if (response.isBoom) {
          // An error was raised during
          // processing the request
          const statusCode = response.output.statusCode

          // In the event of 404
          // return the `404` view
          if (statusCode === 404) {
            return h.view('404').code(statusCode)
          }

          // Log the error
          request.log('error', response)

          // In the event of 429
          // return the `429` view
          if (statusCode === 429) {
            return h.view('429').code(statusCode)
          }

          if (statusCode === 401) {
            return h.continue
          }

          // Then return the `500` view
          switch (response.message) {
            case errors.addressByPostcode.message:
            case errors.addressById.message:
              return h.view('500-error').code(statusCode)
            case errors.friendlyCaptchaError.message:
              return h.view('500-friendly-captcha').code(statusCode)
            case errors.sessionTimeoutError.message:
              return h.view('500-session-timeout').code(statusCode)
            case errors.javascriptError.message:
              return h.view('500-javascript').code(statusCode)
            case errors.riskProfile.message:
            case errors.spatialQuery.message:
              return h.view('500-error').code(statusCode)
            default:
              return h.view('500-error').code(statusCode)
          }
        }

        return h.continue
      })
    }
  }
}
