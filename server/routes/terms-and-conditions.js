const { defineBackLink } = require('../services/defineBackLink.js')

module.exports = [
  {
    method: 'GET',
    path: '/terms-and-conditions',
    handler: async (request, h) => {
      const path = request.path
      const previousPage = request.yar.get('previousPage')
      const backLinkUri = defineBackLink(path, previousPage)
      return h.view('terms-and-conditions', { noIndex: false, backLinkUri })
    },
    options: {
      description: 'Get the terms and conditions page'
    }
  }
]
