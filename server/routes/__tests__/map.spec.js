const STATUS_CODES = require('http2').constants
const createServer = require('../../../server')
let server

jest.mock('@esri/arcgis-rest-request')

beforeAll(async () => {
  server = await createServer()
  await server.initialize()
})

afterAll(async () => {
  await server.stop()
})

describe('/Map page test', () => {
  test('Assert Map page', async () => {
    const options = {
      method: 'GET',
      url: '/map?easting=1&northing=1'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK) // 200
  })
})
