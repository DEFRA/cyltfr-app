const Boom = require('@hapi/boom')
const config = require('../config')
const errors = require('../models/errors.json')
const util = require('../util')
const { osMapsUrl, osMapsKey } = config

module.exports = {
  method: 'GET',
  path: '/os-maps-proxy',
  handler: async (request, h) => {
    try {
      const requestParams = decodeURIComponent(request.url.search.slice(1, -1))
      const url = `${osMapsUrl}${requestParams}?key=${osMapsKey}`
      const payload = await util.get(url, {}, true)
      return h.response(payload).type('image/png')
    } catch (err) {
      if (request.server.methods.notify) { request.server.methods.notify(err) }
      return Boom.badRequest(errors.osMapsProxy.message, err)
    }
  },
  options: {
    description: 'Get OS maps proxy'
  }
}
