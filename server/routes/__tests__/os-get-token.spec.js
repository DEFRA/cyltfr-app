const STATUS_CODES = require('http2').constants
const createServer = require('../../../server')
const { mockOptions } = require('../../../test/mock')
const osApi = require('../../services/osapi')
let server, cookie

jest.mock('../../config')
jest.mock('../../services/flood')
jest.mock('../../services/address')
jest.mock('../../services/osapi')
jest.mock('@esri/arcgis-rest-request')

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

describe('/os-get-token page', () => {
  test('/os-get-token without map page visit returns error but still returns 200ok', async () => {
    const options = {
      method: 'GET',
      url: '/os-get-token'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK) // 200
    expect(response.result).toEqual({ error: 'Ordnance survey Token fetch failed. Map token expired.' })
  })

  test('/os-get-token with map page visit returns OS API token payload', async () => {
    const options = {
      method: 'GET',
      url: '/map',
      headers: {
        cookie
      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK) // 200

    options.url = '/os-get-token'
    const tokenResponse = await server.inject(options)
    expect(tokenResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK) // 200
  })

  test('catch with 400 error if there are any failures in OS API call', async () => {
    const options = {
      method: 'GET',
      url: '/map',
      headers: {
        cookie
      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK) // 200

    osApi.osGetAccessToken.mockImplementation(() => { throw new Error('osGetToken') })

    options.url = '/os-get-token'
    const tokenResponse = await server.inject(options)
    expect(tokenResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_SERVICE_UNAVAILABLE) // 503
  })
})
