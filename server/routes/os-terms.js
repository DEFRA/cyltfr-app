const { defineBackLink } = require('../services/defineBackLink.js')

module.exports = {
  method: 'GET',
  path: '/os-terms',
  handler: (request, h) => {
    const path = request.path
    const previousPage = request.yar.get('previousPage')
    const backLinkUri = defineBackLink(path, previousPage)
    return h.view('os-terms', { year: new Date().getFullYear(), backLinkUri })
  },
  options: {
    description: 'Get Ordnance Survey terms and conditions'
  }
}
