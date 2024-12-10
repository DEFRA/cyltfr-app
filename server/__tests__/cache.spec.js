describe('cache configuration', () => {
  const mockCatboxRedis = require('@hapi/catbox-redis')
  const mockConfig = require('../__mocks__/config')

  test('should configure cache with CatboxRedis when redisCacheEnabled is true', () => {
    mockConfig.setConfigOptions({
      redisCacheEnabled: true
    })
    const module = require('../cache')

    expect(module).toEqual({
      name: 'server_cache',
      provider: {
        constructor: mockCatboxRedis.Engine,
        options: {
          host: mockConfig.redisCacheHost,
          port: mockConfig.redisCachePort,
          tls: undefined
        }
      }
    })
  })
})
