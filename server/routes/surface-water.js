const boom = require('@hapi/boom')
const SurfaceWaterViewModel = require('../models/risk-view')
const { redirectToHomeCounty } = require('../helpers')
const errors = require('../models/errors.json')

module.exports = {
  method: 'GET',
  path: '/surface-water',
  handler: async (request, h) => {
    try {
      const address = request.yar.get('address')
      request.yar.set('previousPage', request.path)

      if (!address) {
        return h.redirect('/postcode')
      }
      if (address.country_code !== 'E') {
        return redirectToHomeCounty(h, address.postcode, address.country_code)
      }

      const { x, y } = address
      const radius = 15
      const backLinkUri = '/risk'

      try {
        const risk = await request.server.methods.riskService(x, y, radius)

        return h.view('surface-water', new SurfaceWaterViewModel(risk, address, backLinkUri))
      } catch (err) {
        return boom.badRequest(errors.riskProfile.message, err)
      }
    } catch (err) {
      return boom.badRequest(errors.addressById.message, err)
    }
  },
  options: {
    description: 'Surface water risk description'
  }
}
