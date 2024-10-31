const boom = require('@hapi/boom')
const surfaceWaterDepthViewModel = require('../models/depth-view')
const { redirectToHomeCounty } = require('../helpers')
const errors = require('../models/errors.json')

module.exports = {
  method: 'GET',
  path: '/surface-water-depth',
  handler: async (request, h) => {
    const address = request.yar.get('address')

    if (!address) {
      return h.redirect('/postcode')
    }
    if (address.country_code !== 'E') {
      return redirectToHomeCounty(h, address.postcode, address.country_code)
    }

    const { x, y } = address
    const backLinkUri = '/surface-water'

    try {
      const swDepth = await request.server.methods.swDepth(x, y)

      return h.view('surface-water-depth', surfaceWaterDepthViewModel(swDepth, null, address, backLinkUri))
    } catch (err) {
      return boom.badRequest(errors.riskProfile.message, err)
    }
  },
  options: {
    description: 'Surface water depth description'
  }
}
