module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.redirect('/postcode').permanent()
    },
    options: {
      description: 'Get the home page'
    }
  }
]
