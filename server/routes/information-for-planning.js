module.exports = [
  {
    method: 'GET',
    path: '/information-for-planning',
    handler: (request, h) => {
      const backLinkUri = '/postcode'
      const model = {
        backLinkUri
      }
      return h.view('information-for-planning', model)
    },
    options: {
      description: 'Get the information for planning page'
    }
  }
]
