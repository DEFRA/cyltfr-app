const boom = require('@hapi/boom')
const surfaceWaterDepthViewModel = require('../models/depth-view')
const { redirectToHomeCounty } = require('../helpers')
const errors = require('../models/errors.json')

module.exports = {
  method: 'GET',
  path: '/surface-water-depth',
  handler: async (request, h) => {
    const address = request.yar.get('address')
    request.yar.set('previousPage', request.path)

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
      const risk = request.yar.get('risk') || {}
      const surfaceWaterOverrides = {
        surfaceWaterRiskOverride: risk.surfaceWaterRiskOverride || false,
        surfaceWaterRiskOverrideCC: risk.surfaceWaterRiskOverrideCC || false
      }

      return h.view('surface-water-depth', surfaceWaterDepthViewModel(swDepth, null, address, backLinkUri, surfaceWaterOverrides))
    } catch (err) {
      return boom.serverUnavailable(errors.riskProfile.message, err)
    }
  },
  options: {
    description: 'Surface water depth description'
  }
}
