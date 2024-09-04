const Boom = require('@hapi/boom')
const errors = require('../models/errors.json')
const osApi = require('../services/osapi')

module.exports = {
  method: 'GET',
  path: '/os-get-token',
  handler: async (request, h) => {
    try {
      // Add check that use has come from map
      const payload = await osApi.osGetAccessToken()
      return h.response(payload).type('application/json')
    } catch (err) {
      return Boom.badRequest(errors.osGetToken.message, err)
    }
  },
  options: {
    description: 'Get OS Api OAuth token'
  }
}
