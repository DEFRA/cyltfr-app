const { defineBackLink } = require('../services/defineBackLink.js')

module.exports = [
  {
    method: 'GET',
    path: '/privacy-notice',
    handler: async (request, h) => {
      const path = request.path
      const previousPage = request.yar.get('previousPage')
      const backLinkUri = defineBackLink(path, previousPage)
      return h.view('privacy-notice', { noIndex: false, backLinkUri })
    },
    options: {
      description: 'Get the privacy notice page'
    }
  }
]
