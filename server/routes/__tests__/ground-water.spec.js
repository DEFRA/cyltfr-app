const STATUS_CODES = require('http2').constants
const createServer = require('../../../server')
const riskService = require('../../services/risk')
const { getByCoordinates } = require('../../services/risk')
const config = require('../../config')
const { mockOptions, mockSearchOptions } = require('../../../test/mock')
let defaultOptions = {
  method: 'GET',
  url: '/risk'
}

jest.mock('../../config')
jest.mock('../../services/flood')
jest.mock('../../services/address')
jest.mock('../../services/risk')

let server, cookie

function checkCookie (response) {
  if (response.headers['set-cookie']) {
    cookie = response.headers['set-cookie'][0].split(';')[0]
    defaultOptions.headers = { cookie }
  }
}

describe('GET /ground-water', () => {
  beforeAll(async () => {
    config.setConfigOptions({
      friendlyCaptchaEnabled: false
    })
    server = await createServer()
    await server.initialize()
  })

  beforeEach(async () => {
    defaultOptions = {
      method: 'GET',
      url: '/risk'
    }
    cookie = ''
    const initial = mockOptions()
    const homepageresponse = await server.inject(initial)
    expect(homepageresponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    checkCookie(homepageresponse)

    const { getOptions, postOptions } = mockSearchOptions('CV37 6YZ', cookie)
    let postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(postResponse.headers.location).toMatch(`/search?postcode=${encodeURIComponent('CV37 6YZ')}`)

    const getResponse = await server.inject(getOptions)
    checkCookie(getResponse)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    postOptions.url = `/search?postcode=${encodeURIComponent('CV37 6YZ')}`
    postOptions.payload = 'address=0'

    postResponse = await server.inject(postOptions)
    checkCookie(postResponse)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(postResponse.headers.location).toMatch('/risk')
  })

  afterAll(async () => {
    await server.stop()
  })

  afterEach(async () => {
    riskService.__resetReturnValue()
  })

  test('redirects to postcode page if user does not have an address set in session', async () => {
    // Get postcode page first to clear the previous address selection
    const mockRequest = {
      method: 'GET',
      url: '/postcode',
      headers: defaultOptions.headers
    }
    const response = await server.inject(mockRequest)

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)

    mockRequest.url = '/ground-water'
    const swResponse = await server.inject(mockRequest)
    expect(swResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(swResponse.headers.location).toBe('/postcode')
  })

  test('returns 200 OK and renders ground water page if user has an address set in session', async () => {
    const mockRequest = {
      method: 'GET',
      url: '/ground-water',
      headers: defaultOptions.headers
    }
    const response = await server.inject(mockRequest)

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.result).toContain('ground-water')
  })

  test('should show an error page if an error occurs', async () => {
    const mockRequest = {
      method: 'GET',
      url: '/ground-water',
      headers: defaultOptions.headers
    }
    getByCoordinates.mockImplementationOnce(() => {
      throw new Error()
    })
    const response = await server.inject(mockRequest)

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_SERVICE_UNAVAILABLE)
  })
})
