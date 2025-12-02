jest.mock('../sanitise-log', () => jest.fn())
let loadConfig

describe('config.js', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...ORIGINAL_ENV }
    loadConfig = () => require('../config')
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
    jest.clearAllMocks()
  })

  const setMinimalEnv = (overrides = {}) => {
    process.env = {
      ...process.env,
      ...overrides
    }
  }

  test('derives flags isDev, isLocalEnv', () => {
    setMinimalEnv({ NODE_ENV: 'dev', IS_LOCAL_ENV: 'true' })
    const config = loadConfig()

    expect(config.isDev).toBe(true)
    expect(config.isTest).toBe(false)
    expect(config.isProd).toBe(false)
    expect(config.isLocalEnv).toBe(true)
  })

  test('derives flags isProd, isLocalEnv', () => {
    setMinimalEnv({ NODE_ENV: 'prod-blue' })
    const config = loadConfig()

    expect(config.isDev).toBe(false)
    expect(config.isTest).toBe(false)
    expect(config.isProd).toBe(true)
    expect(config.isLocalEnv).toBe(false)
  })
})
