const boom = require('@hapi/boom')
const SurfaceWaterDepthViewModel = require('../models/risk-view')
const errors = require('../models/errors.json')

module.exports = {
  method: 'GET',
  path: '/surface-water-depth',
  handler: async (request, h) => {
    const address = request.yar.get('address')

    if (!address) {
      return h.redirect('/postcode')
    }

    const { x, y } = address
    const radius = 15
    const backLinkUri = '/surface-water'

    try {
      const risk = await request.server.methods.riskService(x, y, radius)

      return h.view('surface-water-depth', new SurfaceWaterDepthViewModel(risk, address, backLinkUri))
    } catch (err) {
      return boom.badRequest(errors.riskProfile.message, err)
    }
  },
  options: {
    description: 'Surface water depth description'
  }
}
