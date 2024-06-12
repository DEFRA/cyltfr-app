module.exports = {
  method: 'GET',
  path: '/healthcheck',
  options: {
    description: 'Container healthcheck',
    handler: async (_request, _h) => {
      return { healthy: 1 }
    }
  }
}
