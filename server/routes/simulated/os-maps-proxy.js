module.exports = {
  method: 'GET',
  path: '/os-maps-proxy',
  handler: {
    file: {
      path: 'server/routes/simulated/data/os-maps-proxy.png'
    }
  },
  options: {
    description: 'Get OS maps proxy'
  }
}
