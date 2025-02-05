const Boom = require('@hapi/boom')
const errors = require('../models/errors.json')
const osApi = require('../services/osapi')

const HTTP_STATUS_OK = 200

module.exports = {
  method: 'GET',
  path: '/os-get-token',
  handler: async (request, h) => {
    try {
      const mapTokenExpiry = request.yar.get('mapTokenExpiry')
      if (Date.now() > mapTokenExpiry) {
        return h.response({ error: errors.osGetTokenMapExpired.message }).code(HTTP_STATUS_OK)
      }
      const payload = await osApi.osGetAccessToken()
      return h.response(payload).type('application/json')
    } catch (err) {
      return Boom.serverUnavailable(errors.osGetToken, err)
    }
  },
  options: {
    description: 'Get OS Api OAuth token'
  }
}
