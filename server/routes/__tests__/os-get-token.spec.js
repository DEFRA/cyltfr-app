const STATUS_CODES = require('http2').constants
const createServer = require('../..')
const { mockOptions } = require('../../../test/mock')
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
  test('/os-get-token without map page visit', async () => {
    const options = {
      method: 'GET',
      url: '/os-get-token'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_BAD_REQUEST) // 400
  })

  test('/os-get-token with map page visit', async () => {
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
    expect(tokenResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_NO_CONTENT) // 204
  })
})
