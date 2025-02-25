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

describe('GET /surface-water', () => {
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

    mockRequest.url = '/surface-water'
    const swResponse = await server.inject(mockRequest)
    expect(swResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(swResponse.headers.location).toBe('/postcode')
  })

  test('returns 200 OK and renders surface water page if user has an address set in session', async () => {
    const mockRequest = {
      method: 'GET',
      url: '/surface-water',
      headers: defaultOptions.headers
    }
    const response = await server.inject(mockRequest)

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.result).toContain('surface-water')
  })

  test('returns 200 OK and renders surface water page with high risk', async () => {
    const mockRequest = {
      method: 'GET',
      url: '/surface-water',
      headers: defaultOptions.headers
    }
    riskService.__updateReturnValue({
      surfaceWaterRisk: 'High'
    })

    const response = await server.inject(mockRequest)

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.result).toContain('govuk-tag--high')
  })

  test('returns 200 OK and renders surface water page with medium risk', async () => {
    const mockRequest = {
      method: 'GET',
      url: '/surface-water',
      headers: defaultOptions.headers
    }
    riskService.__updateReturnValue({
      surfaceWaterRisk: 'Medium'
    })

    const response = await server.inject(mockRequest)

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.result).toContain('govuk-tag--medium')
  })

  test('returns 200 OK and renders surface water page with low risk', async () => {
    const mockRequest = {
      method: 'GET',
      url: '/surface-water',
      headers: defaultOptions.headers
    }
    riskService.__updateReturnValue({
      surfaceWaterRisk: 'Low'
    })

    const response = await server.inject(mockRequest)

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.result).toContain('govuk-tag--low')
  })

  test('returns 200 OK and renders surface water page with very low risk', async () => {
    const mockRequest = {
      method: 'GET',
      url: '/surface-water',
      headers: defaultOptions.headers
    }
    riskService.__updateReturnValue({
      surfaceWaterRisk: 'Very Low'
    })

    const response = await server.inject(mockRequest)

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.result).toContain('govuk-tag--very-low')
  })

  test('returns 200 OK and renders surface water page with lead local flood authority', async () => {
    const mockRequest = {
      method: 'GET',
      url: '/surface-water',
      headers: defaultOptions.headers
    }
    riskService.__updateReturnValue({
      leadLocalFloodAuthority: 'North Yorkshire'
    })

    const response = await server.inject(mockRequest)

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.result).toContain('Your lead local flood authority is <strong>North Yorkshire')
  })

  test('returns 200 OK and renders surface water page with llfa comments', async () => {
    const mockRequest = {
      method: 'GET',
      url: '/surface-water',
      headers: defaultOptions.headers
    }
    riskService.__updateReturnValue({
      leadLocalFloodAuthority: 'North Yorkshire',
      extraInfo: [{
        info: 'Proposed schemes',
        apply: 'llfa',
        riskoverride: null
      },
      {
        info: 'Flood action plan',
        apply: 'llfa',
        riskoverride: null
      }]
    })

    const response = await server.inject(mockRequest)

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.result).toContain('They have the following information about surface water flooding:')
  })

  test('should show an error page if an error occurs', async () => {
    const mockRequest = {
      method: 'GET',
      url: '/surface-water',
      headers: defaultOptions.headers
    }
    getByCoordinates.mockImplementationOnce(() => {
      throw new Error()
    })
    const response = await server.inject(mockRequest)

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_SERVICE_UNAVAILABLE)
  })

  test('risk address not in england', async () => {
    const initial = mockOptions()

    const homepageresponse = await server.inject(initial)
    expect(homepageresponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    const cookie = homepageresponse.headers['set-cookie'][0].split(';')[0]

    const { getOptions, postOptions } = mockSearchOptions('NP18 3EZ', cookie)
    let postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(postResponse.headers.location).toMatch(`/search?postcode=${encodeURIComponent('NP18 3EZ')}`)

    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    postOptions.url = `/search?postcode=${encodeURIComponent('NP18 3EZ')}`
    postOptions.payload = 'address=0'

    postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(postResponse.headers.location).toMatch('/england-only')

    const mockRequest = {
      method: 'GET',
      url: '/surface-water',
      headers: { cookie }
    }
    const response = await server.inject(mockRequest)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(response.headers.location).toMatch('/england-only')
  })
})
