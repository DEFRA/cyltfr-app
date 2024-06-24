const Boom = require('@hapi/boom')
const util = require('../util')
const config = require('../config')
const errors = require('../models/errors.json')
const { osMapsUrl, osMapsKey, osGetCapabilitiesUrl } = config

module.exports = {
  method: 'GET',
  path: '/os-get-capabilities',
  handler: async (request, h) => {
    try {
      const url = `${osMapsUrl}?key=${osMapsKey}&${osGetCapabilitiesUrl}`
      let payload = await util.get(url, {}, true)
      // replace secret key in capabilities
      const regex = new RegExp(osMapsKey, 'g')
      payload = payload.toString().replace(regex, '***')
      return h.response(payload).type('text/xml')
    } catch (err) {
      return Boom.badRequest(errors.osGetCapabilities.message, err)
    }
  },
  options: {
    description: 'Get map capabilities'
  }
}
