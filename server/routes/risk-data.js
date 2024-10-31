module.exports = {
  method: 'GET',
  path: '/risk-data',
  handler: async (request, h) => {
    return h.view('risk-data')
  },
  options: {
    description: 'How to access flood risk data'
  }
}
