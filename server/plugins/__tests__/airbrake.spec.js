jest.mock('@airbrake/node', () => ({
  Notifier: jest.fn()
}))

const Airbrake = require('@airbrake/node')
const airbrakePlugin = require('../airbrake')

const createServerStub = () => ({
  events: {
    on: jest.fn()
  },
  method: jest.fn(),
  log: jest.fn()
})

const validOptions = {
  appId: 'app-id',
  key: 'secret-key',
  host: 'https://airbrake.example',
  env: 'test',
  notify: 'notify'
}

const AIRBRAKE_FAILURE_MESSAGE = 'Airbrake notification failed'

const hasErrorLog = (calls) => calls.some(([, logPayload]) => {
  if (!logPayload || typeof logPayload.message !== 'string') {
    return false
  }

  return logPayload.message.includes(AIRBRAKE_FAILURE_MESSAGE)
})

describe('airbrake plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('registers notifier, request listener, and notify server method', async () => {
    const notify = jest.fn().mockResolvedValue({ id: 'notice-1' })
    Airbrake.Notifier.mockImplementation(() => ({ notify }))
    const server = createServerStub()

    await airbrakePlugin.plugin.register(server, validOptions)

    expect(Airbrake.Notifier).toHaveBeenCalledWith({
      host: validOptions.host,
      projectId: validOptions.appId,
      projectKey: validOptions.key,
      environment: validOptions.env
    })
    expect(server.events.on).toHaveBeenCalledWith(
      { name: 'request', channels: ['error', 'app'], filter: 'error' },
      expect.any(Function)
    )
    expect(server.method).toHaveBeenCalledWith(validOptions.notify, expect.any(Function))
  })

  test('throws when options are invalid', async () => {
    const server = createServerStub()

    await expect(airbrakePlugin.plugin.register(server, { appId: 'app-id' })).rejects.toThrow()
  })

  test('request event handler from registration notifies with request context', async () => {
    const notify = jest.fn().mockResolvedValue({ id: 'notice-2' })
    Airbrake.Notifier.mockImplementation(() => ({ notify }))
    const server = createServerStub()

    await airbrakePlugin.plugin.register(server, validOptions)

    const requestHandler = server.events.on.mock.calls[0][1]
    const error = new Error('request failed')
    const req = {
      route: { path: '/search' },
      method: 'get',
      url: { href: 'http://localhost/search' }
    }

    await requestHandler(req, { error }, [])

    expect(error.component).toBe('hapi')
    expect(notify).toHaveBeenCalledWith({
      error,
      session: {
        route: '/search',
        method: 'get',
        url: 'http://localhost/search'
      }
    })
  })

  test('notify server method from registration logs and notifies', async () => {
    const notify = jest.fn().mockResolvedValue({ id: 'notice-3' })
    Airbrake.Notifier.mockImplementation(() => ({ notify }))
    const server = createServerStub()

    await airbrakePlugin.plugin.register(server, validOptions)

    const notifyMethod = server.method.mock.calls[0][1]
    const error = new Error('manual notify')
    const session = { route: '/risk', method: 'post' }

    await notifyMethod(error, session)

    expect(server.log).toHaveBeenCalledWith(
      ['error'],
      expect.objectContaining({
        message: expect.stringContaining('Notify called: manual notify'),
        error
      })
    )
    expect(notify).toHaveBeenCalledWith({ error, session })
  })
})

describe('airbrake private helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('logAirbrakeFailure logs expected error format', () => {
    const server = createServerStub()

    airbrakePlugin._private.logAirbrakeFailure(server, 'network timeout')

    expect(server.log).toHaveBeenCalledWith(
      ['error'],
      expect.objectContaining({
        message: expect.stringContaining('Airbrake notification failed: network timeout'),
        error: 'network timeout'
      })
    )
  })

  test('notifyAirbrake does not log failure when notice has id', async () => {
    const server = createServerStub()
    const airbrake = {
      notify: jest.fn().mockResolvedValue({ id: 'ok-id' })
    }

    await airbrakePlugin._private.notifyAirbrake(airbrake, { error: new Error('ok') }, server)

    expect(airbrake.notify).toHaveBeenCalledTimes(1)
    expect(hasErrorLog(server.log.mock.calls)).toBe(false)
  })

  test('notifyAirbrake logs failure when notice has no id', async () => {
    const server = createServerStub()
    const airbrake = {
      notify: jest.fn().mockResolvedValue({ error: 'missing id' })
    }

    await airbrakePlugin._private.notifyAirbrake(airbrake, { error: new Error('boom') }, server)

    expect(hasErrorLog(server.log.mock.calls)).toBe(true)
  })

  test('notifyAirbrake logs failure when notifier rejects', async () => {
    const server = createServerStub()
    const airbrake = {
      notify: jest.fn().mockRejectedValue(new Error('service unavailable'))
    }

    await airbrakePlugin._private.notifyAirbrake(airbrake, { error: new Error('boom') }, server)

    expect(hasErrorLog(server.log.mock.calls)).toBe(true)
  })

  test('createRequestErrorHandler uses event.data fallback', async () => {
    const server = createServerStub()
    const error = { message: 'fallback error' }
    const airbrake = {
      notify: jest.fn().mockResolvedValue({ id: 'notice-4' })
    }
    const handler = airbrakePlugin._private.createRequestErrorHandler(airbrake, server)
    const req = {
      route: { path: '/map' },
      method: 'get',
      url: { href: 'http://localhost/map' }
    }

    await handler(req, { data: error }, [])

    expect(error.component).toBe('hapi')
    expect(airbrake.notify).toHaveBeenCalledWith({
      error,
      session: {
        route: '/map',
        method: 'get',
        url: 'http://localhost/map'
      }
    })
  })

  test('createRequestErrorHandler accepts non-object error payload', async () => {
    const server = createServerStub()
    const airbrake = {
      notify: jest.fn().mockResolvedValue({ id: 'notice-5' })
    }
    const handler = airbrakePlugin._private.createRequestErrorHandler(airbrake, server)
    const req = {
      route: { path: '/postcode' },
      method: 'get',
      url: { href: 'http://localhost/postcode' }
    }

    await expect(handler(req, { data: 'string-error' }, [])).resolves.toBeUndefined()
    expect(airbrake.notify).toHaveBeenCalledWith({
      error: 'string-error',
      session: {
        route: '/postcode',
        method: 'get',
        url: 'http://localhost/postcode'
      }
    })
  })

  test('createNotifyMethod notifies without session when omitted', async () => {
    const server = createServerStub()
    const airbrake = {
      notify: jest.fn().mockResolvedValue({ id: 'notice-6' })
    }
    const notifyMethod = airbrakePlugin._private.createNotifyMethod(airbrake, server)
    const error = new Error('manual without session')

    await notifyMethod(error)

    expect(airbrake.notify).toHaveBeenCalledWith({ error })
    expect(server.log).toHaveBeenCalledWith(
      ['error'],
      expect.objectContaining({
        message: expect.stringContaining('Notify called: manual without session'),
        error
      })
    )
  })

  test('createNotifyMethod logs shared Airbrake failure output when notice has no id', async () => {
    const server = createServerStub()
    const airbrake = {
      notify: jest.fn().mockResolvedValue({ error: 'failed delivery' })
    }
    const notifyMethod = airbrakePlugin._private.createNotifyMethod(airbrake, server)

    await notifyMethod(new Error('manual failure path'))

    expect(hasErrorLog(server.log.mock.calls)).toBe(true)
  })
})
