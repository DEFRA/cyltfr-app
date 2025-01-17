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
  const mapPages = [
    { map: 'SurfaceWater' },
    { map: 'RiversOrSea' },
    { map: 'Reservoirs' }
  ]

  test.each(mapPages)('Assert Map pages', async ({ map }) => {
    const options = {
      method: 'GET',
      url: `/map?easting=1&northing=1&map=${map}`
    }

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK) // 200
  })
})
