const { defineBackLink } = require('../services/defineBackLink.js')

module.exports = {
  method: 'GET',
  path: '/risk-data',
  handler: async (request, h) => {
    const path = request.path
    const previousPage = request.yar.get('previousPage')
    const backLinkUri = defineBackLink(path, previousPage)
    return h.view('risk-data', { backLinkUri })
  },
  options: {
    description: 'How to access flood risk data'
  }
}
