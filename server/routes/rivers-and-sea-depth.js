const boom = require('@hapi/boom')
const errors = require('../models/errors.json')
const { redirectToHomeCounty } = require('../helpers')
const RiversAndSeaDepthViewModel = require('../models/depth-view')

module.exports = {
  method: 'GET',
  path: '/rivers-and-sea-depth',
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
    const backLinkUri = '/rivers-and-sea'

    try {
      const risk = await request.server.methods.riskService(x, y)
      const model = new RiversAndSeaDepthViewModel(risk, address, backLinkUri)
      return h.view('rivers-and-sea-depth', model)
    } catch (err) {
      return boom.badRequest(errors.riskProfile.message, err)
    }
  },
  options: {
    description: 'Understand rivers and the sea page'
  }
}
