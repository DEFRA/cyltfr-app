const boom = require('@hapi/boom')
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

    try {
      const { x, y } = address
      const radius = 15
      const backLinkUri = '/surface-water'

      return h.view('surface-water-depth', { x, y, radius, backLinkUri })
    } catch (err) {
      return boom.badRequest(errors.riskProfile.message, err)
    }
  },
  options: {
    description: 'Surface water depth description'
  }
}
