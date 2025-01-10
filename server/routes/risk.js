const boom = require('@hapi/boom')
const RiskViewModel = require('../models/risk-view')
const { redirectToHomeCounty } = require('../helpers')
const errors = require('../models/errors.json')

module.exports = {
  method: 'GET',
  path: '/risk',
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

      try {
        const risk = await request.server.methods.riskService(x, y, radius)

        // FLO-1139 If query 1 to 6 errors then throw default error page
        const hasError = risk.riverAndSeaRisk?.error ||
          risk.surfaceWaterRisk?.error ||
          risk.reservoirDryRisk?.error ||
          risk.reservoirWetRisk?.error ||
          risk.leadLocalFloodAuthority?.error ||
          risk.extraInfo?.error

        if (hasError) {
          return boom.badRequest(errors.spatialQuery.message, {
            risk,
            address
          })
        }

        const backLinkUri = '/search'
        return h.view('risk', new RiskViewModel(risk, address, backLinkUri))
      } catch (err) {
        return boom.badRequest(errors.riskProfile.message, err)
      }
    } catch (err) {
      return boom.badRequest(errors.addressById.message, err)
    }
  },
  options: {
    description: 'Get risk text page'
  }
}
