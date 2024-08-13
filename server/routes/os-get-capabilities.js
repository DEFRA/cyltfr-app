const Boom = require('@hapi/boom')
const errors = require('../models/errors.json')

module.exports = {
  method: 'GET',
  path: '/os-get-capabilities',
  handler: async (request, h) => {
    try {
      const payload = await request.server.methods.osGetCapabilities()
      return h.response(payload).type('text/xml')
    } catch (err) {
      return Boom.badRequest(errors.osGetCapabilities.message, err)
    }
  },
  options: {
    description: 'Get map capabilities'
  }
}
