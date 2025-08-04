const config = require('../config')
const cache = require('../cache')

module.exports = {
  plugin: require('@hapi/yar'),
  options: {
    cache: cache
      ? {
          cache: cache.name,
          segment: 'session'
        }
      : undefined,
    maxCookieSize: 0,
    storeBlank: false,
    name: 'cyltfr_session',
    cookieOptions: {
      password: config.cookiePassword,
      isSecure: (!config.isDev),
      isHttpOnly: (!config.isDev),
      isSameSite: 'Lax'
    }
  }
}
