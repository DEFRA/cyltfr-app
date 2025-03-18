module.exports = {
  method: 'GET',
  path: '/postcode-checker',
  handler: async (request, h) => {
    return h.view('postcode-checker')
  },
  options: {
    description: 'Temporary postcode checker page'
  }
}
