const { find } = require('../services/address')
const { getByCoordinates } = require('../services/risk')
const config = require('../config')

const cacheEnabled = config.cacheEnabled

const serverMethods = [
  {
    name: 'find',
    method: find,
    options: cacheEnabled
      ? {
          cache: {
            cache: 'server_cache',
            expiresIn: 100 * 1000,
            generateTimeout: 20000
          }
        }
      : undefined
  },
  {
    name: 'riskService',
    method: getByCoordinates,
    options: cacheEnabled
      ? {
          cache: {
            cache: 'server_cache',
            expiresIn: 100 * 1000,
            generateTimeout: 20000
          }
        }
      : undefined
  }
]

module.exports = serverMethods
