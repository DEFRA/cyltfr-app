const logSanitisedConfig = require('../sanitise-log')

describe('sanitise-log.js', () => {
  const protectedProps = ['secretKey']

  let originalConsoleLog

  beforeEach(() => {
    originalConsoleLog = console.log
    console.log = jest.fn()
  })

  afterEach(() => {
    console.log = originalConsoleLog
  })

  test('when isLocalEnv is true the raw config is logged', () => {
    const config = {
      isLocalEnv: true,
      secretKey: 'abc123',
      other: 'value'
    }

    logSanitisedConfig(config, protectedProps)

    expect(console.log).toHaveBeenCalledTimes(1)
    expect(console.log).toHaveBeenCalledWith('Server config', config)
  })

  test('when isLocalEnv is false the protected properties are redacted', () => {
    const config = {
      isLocalEnv: false,
      secretKey: 'abc123',
      other: 'value'
    }

    logSanitisedConfig(config, protectedProps)

    expect(console.log).toHaveBeenCalledTimes(1)
    const [label, loggedConfig] = console.log.mock.calls[0]

    expect(label).toBe('Server config')
    expect(loggedConfig.other).toBe('value')
    expect(loggedConfig.secretKey).toBe('[REDACTED:6]')
  })

  test('when isLocalEnv is unset the protected properties are redacted', () => {
    const config = {
      secretKey: 'abc123',
      other: 'value'
    }

    logSanitisedConfig(config, protectedProps)

    expect(console.log).toHaveBeenCalledTimes(1)
    const [label, loggedConfig] = console.log.mock.calls[0]

    expect(label).toBe('Server config')
    expect(loggedConfig.other).toBe('value')
    expect(loggedConfig.secretKey).toBe('[REDACTED:6]')
  })
})
