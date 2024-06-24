const config = require('../config')
const cache = require('../cache')

module.exports = {
  plugin: require('hapi-rate-limit'),
  options: {
    enabled: false, // Enabled on a per-route basis
    userPathLimit: config.rateLimitRequests,
    userPathCache: {
      expiresIn: config.rateLimitExpiresIn * 60 * 1000,
      cache: cache && cache.name
    },
    pathLimit: false,
    userLimit: false,
    trustProxy: true,
    ipWhitelist: config.rateLimitWhitelist
  }
}
