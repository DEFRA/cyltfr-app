describe('cache configuration', () => {
  const mockCatboxRedis = require('@hapi/catbox-redis')
  const config = require('../config')

  test('should configure cache with CatboxRedis when redisCacheEnabled is true', () => {
    config.redisCacheEnabled = true
    const module = require('../cache')

    expect(module).toEqual({
      name: 'server_cache',
      provider: {
        constructor: mockCatboxRedis.Engine,
        options: {
          host: config.redisCacheHost,
          port: config.redisCachePort,
          tls: undefined
        }
      }
    })
  })
})
