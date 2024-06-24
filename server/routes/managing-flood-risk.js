module.exports = {
  method: 'GET',
  path: '/managing-flood-risk',
  handler: function (_request, h) {
    return h.response().redirect('https://www.gov.uk/prepare-for-flooding').permanent(true)
  },
  options: {
    description: 'Managing flood risk page redirect to Pepare for flooding'
  }
}
