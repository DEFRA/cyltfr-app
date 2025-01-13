const { defineBackLink } = require('../services/defineBackLink.js')

module.exports = [
  {
    method: 'GET',
    path: '/accessibility-statement',
    handler: async (request, h) => {
      const path = request.path
      const previousPage = request.yar.get('previousPage')
      const backLinkUri = defineBackLink(path, previousPage)
      return h.view('accessibility-statement', { noIndex: false, backLinkUri })
    },
    options: {
      description: 'Get the accessibility statement page'
    }
  }
]
