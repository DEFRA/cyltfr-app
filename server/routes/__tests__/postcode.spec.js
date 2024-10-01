const STATUS_CODES = require('http2').constants
const createServer = require('../../../server')
const { mockOptions, mockSearchOptions } = require('../../../test/mock')
const config = require('../../config')
let server, cookie

jest.mock('../../config')
jest.mock('../../services/flood')
jest.mock('../../services/address')

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
    const { postOptions } = mockSearchOptions('NP18 3EZ', cookie)
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(postResponse.headers.location).toMatch(`/search?postcode=${encodeURIComponent('NP18 3EZ')}`)
  })

  test.each([
    { postcode: '', description: 'postcode is missing' },
    { postcode: 'INVALID', description: 'postcode is invalid' }
  ])('should return an error view when postcode missing or invalid', async ({ postcode }) => {
    const options = {
      method: 'POST',
      url: '/postcode',
      headers: {
        cookie
      },
      payload: {
        postcode
      }
    }
    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.result).toMatch('Enter a full postcode in England')
  })

  describe('postcode page - captchabypass', () => {
    beforeEach(() => {
      config.friendlyCaptchaEnabled = true
      config.friendlyCaptchaBypass = 'test-bypass-code'
    })
    test('should set captchabypass to true if query parameter matches config value', async () => {
      const options = {
        method: 'GET',
        url: '/postcode?captchabypass=test-bypass-code',
        headers: {
          cookie
        }
      }
      const response = await server.inject(options)
      expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
      const sessionCaptchaBypass = response.request.yar.get('captchabypass')
      expect(sessionCaptchaBypass).toEqual(true)
    })

    test('should set captchabypass to false if query parameter does not match config value', async () => {
      const options = {
        method: 'GET',
        url: '/postcode?captchabypass=invalid-code',
        headers: {
          cookie
        }
      }
      const response = await server.inject(options)
      expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
      const sessionCaptchaBypass = response.request.yar.get('captchabypass')
      expect(sessionCaptchaBypass).toEqual(false)
    })
  })
})
