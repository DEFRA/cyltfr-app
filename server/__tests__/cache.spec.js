const mockCatboxRedis = require('@hapi/catbox-redis')

jest.mock('../config', () => ({
  setConfigOptions: jest.fn(),
  redisCacheHost: 'mockHost',
  redisCachePort: 1234,
  redisTLS: undefined,
  redisCacheEnabled: true
}))

describe('cache configuration', () => {
  test('should configure cache with CatboxRedis when redisCacheEnabled is true', () => {
    const module = require('../cache')

    expect(module).toEqual({
      name: 'server_cache',
      provider: {
        constructor: mockCatboxRedis.Engine,
        options: {
          host: 'mockHost',
          port: 1234,
          tls: undefined
        }
      }
    })
  })
})
