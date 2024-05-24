module.exports = {
  method: 'GET',
  path: '/os-get-capabilities',
  handler: {
    file: {
      path: 'server/routes/simulated/data/os-get-capabilities.xml'
    }
  },
  options: {
    description: 'Get map capabilities'
  }
}
