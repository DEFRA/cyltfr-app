/* $lab:coverage:off$ */
const CatboxRedis = require('@hapi/catbox-redis')
const config = require('./config')
const { redisCacheEnabled, redisCacheHost, redisCachePort } = config
let CatboxMemory
if (!redisCacheEnabled) { CatboxMemory = require('@hapi/catbox-memory') }

module.exports = redisCacheEnabled
  ? {
      name: 'server_cache',
      provider: {
        constructor: CatboxRedis.Engine,
        options: {
          host: redisCacheHost,
          port: redisCachePort
        }
      }
    }
  : {
      name: 'server_cache',
      provider: {
        constructor: CatboxMemory.Engine
      }
    }
/* $lab:coverage:on$ */
