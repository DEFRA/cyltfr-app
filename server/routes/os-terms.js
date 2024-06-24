module.exports = {
  method: 'GET',
  path: '/os-terms',
  options: {
    description: 'Get Ordnance Survey terms and conditions',
    handler: (request, h) => {
      return h.view('os-terms', {
        year: new Date().getFullYear()
      })
    }
  }
}
