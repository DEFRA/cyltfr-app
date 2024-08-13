const boom = require('@hapi/boom')
const RiskViewModel = require('../models/risk-view')
const errors = require('../models/errors.json')
const { defineBackLink } = require('../services/defineBackLink.js')

module.exports = {
  method: 'GET',
  path: '/risk',
  handler: async (request, h) => {
    try {
      const address = request.yar.get('address')
      const path = request.path

      if (!address) {
        return h.redirect('/postcode')
      }

      const { x, y } = address
      const radius = 15

      try {
        const risk = await request.server.methods.riskService(x, y, radius)
        // FLO-1139 If query 1 to 6 errors then throw default error page
        const hasError = risk.riverAndSeaRisk === 'Error' ||
          risk.surfaceWaterRisk === 'Error' ||
          risk.reservoirDryRisk === 'Error' ||
          risk.reservoirWetRisk === 'Error' ||
          risk.leadLocalFloodAuthority === 'Error' ||
          risk.extraInfo === 'Error'

        if (hasError) {
          return boom.badRequest(errors.spatialQuery.message, {
            risk,
            address
          })
        }

        if (!risk.inEngland) {
          return h.redirect('/england-only')
        }
        const backLinkUri = defineBackLink(path, address.postcode)
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
