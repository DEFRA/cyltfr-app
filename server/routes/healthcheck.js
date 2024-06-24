module.exports = [
  {
    method: 'GET',
    path: '/healthcheck',
    handler: async (request, h) => {
      return 'ok'
    },
    options: {
      description: 'Get healthcheck response: "ok" 200'
    }
  }
]
