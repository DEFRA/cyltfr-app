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
      const risk = await request.server.methods.reservoirRisk(x, y, radius)

      const model = new GroundWaterViewModel(risk, address, backLinkUri)
      return h.view('ground-water', model)
    } catch (err) {
      return boom.badRequest(errors.riskProfile.message, err)
    }
  },
  options: {
    description: 'Understand groundwater page'
  }
}
