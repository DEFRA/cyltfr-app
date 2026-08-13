const STATUS_CODES = require('http2').constants
const createServer = require('../../../server')
const { mockOptions, mockSearchOptions } = require('../../../test/mock')
const config = require('../../config')
const captchaCheck = require('../../services/captchacheck')
const addressService = require('../../services/address')
const floodService = require('../../services/flood')
let server, cookie

jest.mock('../../config')
jest.mock('../../services/flood')
jest.mock('../../services/address')
jest.mock('../../services/captchacheck')

beforeAll(async () => {
  server = await createServer()
  await server.initialize()
  const initial = mockOptions()

  const homepageresponse = await server.inject(initial)
  expect(homepageresponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  cookie = homepageresponse.headers['set-cookie'][0].split(';')[0]
})

afterAll(async () => {
  await server.stop()
})

describe('postcode page', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('should return a view with error message when redirected to with an error', async () => {
    const options = {
      method: 'GET',
      url: '/postcode?error=true',
      headers: {
        cookie
      }
    }
    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.result).toMatch('This postcode does not appear to exist')
  })

  test('should redirect to search page when postcode submitted', async () => {
    captchaCheck.captchaCheck.mockResolvedValue({ tokenValid: true })
    const { postOptions } = mockSearchOptions('YO18 8TB', cookie)
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(postResponse.headers.location).toMatch('/search#')

    const searchCookie = postResponse.headers['set-cookie'][0].split(';')[0]
    const getResponse = await server.inject({
      method: 'GET',
      url: '/search',
      headers: { cookie: searchCookie }
    })
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('should prefill postcode if one has been cached', async () => {
    captchaCheck.captchaCheck.mockResolvedValue({ tokenValid: true })

    const { postOptions } = mockSearchOptions('CV376YZ', cookie)
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)

    const sessionCookie = postResponse.headers['set-cookie'][0].split(';')[0]
    const getResponse = await server.inject({
      method: 'GET',
      url: '/postcode',
      headers: { cookie: sessionCookie }
    })
    expect(sessionCookie).toBeDefined()
    expect(getResponse.payload).toMatch(/value="CV37 6YZ"/)
  })

  test('should prefill postcode if one has been cached friendly captcha on', async () => {
    captchaCheck.captchaCheck.mockResolvedValue({ tokenValid: true })
    config.friendlyCaptchaEnabled = true

    const { postOptions } = mockSearchOptions('CV376YZ', cookie)
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)

    const sessionCookie = postResponse.headers['set-cookie'][0].split(';')[0]
    const getResponse = await server.inject({
      method: 'GET',
      url: '/postcode',
      headers: { cookie: sessionCookie }
    })
    expect(sessionCookie).toBeDefined()
    expect(getResponse.payload).toMatch(/value="CV37 6YZ"/)
  })

  test.each([
    { postcode: '', description: 'postcode is missing' },
    { postcode: 'INVALID', description: 'postcode is invalid' }
  ])('should return an error view when $description', async ({ postcode }) => {
    const mockPostcodeInfo = {
      postcode: '',
      isValidFormat: false
    }

    jest.fn().mockResolvedValue({ postcodeInfo: mockPostcodeInfo, addresses: [] })

    const { postOptions } = mockSearchOptions('', cookie)
    const response = await server.inject(postOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.result).toMatch(/Enter a full postcode in England/)
  })

  test('/search - Address service error', async () => {
    const { postOptions } = mockSearchOptions('CV376YZ', cookie)
    floodService.__updateReturnValue({})
    addressService.find.mockImplementationOnce(() => { throw new Error('An error') })

    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(postResponse.result).toMatch(/An error occurred while searching for that postcode/)
  })

  test('/search - Address service returns empty address array', async () => {
    const { postOptions } = mockSearchOptions('CV376YZ', cookie)
    floodService.__updateReturnValue({})
    addressService.find.mockImplementationOnce(() => { return Promise.resolve([]) })
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(postResponse.result).toMatch(/That postcode does not appear to exist/)
  })

  test('should return error view when captcha validation fails', async () => {
    const mockCaptchaCheck = {
      tokenValid: false,
      errorMessage: 'Captcha validation failed. Please try again.',
      error: {
        code: 'response_invalid',
        detail: '[12345]'
      }
    }

    const oldNotify = server.methods.notify
    server.methods.notify = jest.fn()
    captchaCheck.captchaCheck.mockResolvedValue(mockCaptchaCheck)

    const options = {
      method: 'POST',
      url: '/postcode',
      headers: {
        cookie
      },
      payload: {
        'frc-captcha-solution': 'invalid',
        postcode: 'YO18 8TB'
      }
    }
    const response = await server.inject(options)

    expect(server.methods.notify).toHaveBeenCalledWith('FriendlyCaptcha server check failed: response_invalid - [12345]', expect.any(Object))
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.result).toContain('Captcha validation failed. Please try again.')
    server.methods.notify = oldNotify
  })

  test('/search - Address service error', async () => {
    const { postOptions } = mockSearchOptions('CV376YZ', cookie)
    floodService.__updateReturnValue({})
    addressService.find.mockImplementationOnce(() => { throw new Error('An error') })

    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(postResponse.result).toMatch(/An error occurred while searching for that postcode/)
  })

  test('/search - Address service error does logging', async () => {
    const { postOptions } = mockSearchOptions('CV376YZ', cookie)
    floodService.__updateReturnValue({})
    addressService.find.mockImplementationOnce(() => { throw new Error('An error') })
    const onErrorHandler = jest.fn()
    server.events.on(
      { name: 'log', filter: 'error' },
      onErrorHandler
    )

    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(postResponse.result).toMatch(/An error occurred while searching for that postcode/)
    expect(onErrorHandler).toHaveBeenCalledTimes(1)
    server.events.removeListener('log', onErrorHandler)
  })

  test('/search - Address service returns empty address array', async () => {
    const { postOptions } = mockSearchOptions('CV376YZ', cookie)
    floodService.__updateReturnValue({})
    addressService.find.mockImplementationOnce(() => { return Promise.resolve([]) })
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(postResponse.result).toMatch(/That postcode does not appear to exist/)
  })

  test('returns an error when url query contains an error parameter', async () => {
    const getOptions = {
      method: 'GET',
      url: '/postcode?error=postcode_does_not_exist',
      headers: {
        cookie
      }
    }
    const response = await server.inject(getOptions)
    expect(response.result).toMatch(/This postcode does not appear to exist/)
  })

  describe('postcode page - captchabypass', () => {
    beforeEach(() => {
      config.friendlyCaptchaEnabled = true
      config.friendlyCaptchaBypass = 'test-bypass-code'
    })
    const testCases = [
      {
        description: 'should set captchabypass to true if query parameter matches config value',
        query: '?captchabypass=test-bypass-code',
        expected: true
      },
      {
        description: 'should set captchabypass to false if query parameter does not match config value',
        query: '?captchabypass=invalid-code',
        expected: false
      },
      {
        description: 'should not set captchabypass if query parameter is absent',
        query: '',
        expected: false
      }
    ]
    testCases.forEach(({ description, query, expected }) => {
      test(description, async () => {
        const options = {
          method: 'GET',
          url: `/postcode${query}`,
          headers: {
            cookie
          }
        }
        const response = await server.inject(options)
        expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
        const sessionCaptchaBypass = response.request.yar.get('captchabypass')
        expect(sessionCaptchaBypass).toEqual(expected)
      })
    })
  })
})
