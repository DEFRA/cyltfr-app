const boom = require('@hapi/boom')
const errors = require('../models/errors.json')
const GroundWaterViewModel = require('../models/groundwater-view')

module.exports = {
  method: 'GET',
  path: '/ground-water',
  handler: async (request, h) => {
    const address = request.yar.get('address')
    request.yar.set('previousPage', request.path)

    if (!address) {
      return h.redirect('/postcode')
    }

    const { x, y } = address
    const radius = 15
    const backLinkUri = '/risk'

    try {
      let gwRisk = request.yar.get(`gwrisk-${x}-${y}`)
      if (!gwRisk) {
        gwRisk = await request.server.methods.reservoirRisk(x, y, radius)
        request.yar.set(`gwrisk-${x}-${y}`, gwRisk)
      }

      let risk = request.yar.get(`risk-${x}-${y}`)
      if (!risk) {
        risk = await request.server.methods.riskService(x, y, radius)
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

        request.yar.set(`risk-${x}-${y}`, risk)
      }

      const model = new GroundWaterViewModel(gwRisk, risk, address, backLinkUri)
      return h.view('ground-water', model)
    } catch (err) {
      return boom.badRequest(errors.riskProfile.message, err)
    }
  },
  options: {
    description: 'Understand groundwater page'
  }
}
