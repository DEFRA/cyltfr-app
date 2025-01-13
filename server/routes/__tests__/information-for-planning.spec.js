const STATUS_CODES = require('http2').constants
const createServer = require('../../../server')
let server

beforeAll(async () => {
  server = await createServer()
  await server.initialize()
})

afterAll(async () => {
  await server.stop()
})

describe('information for planning page', () => {
  test('gets the information for planning page with an OK', async () => {
    const options = {
      method: 'GET',
      url: '/information-for-planning'
    }
    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })
})
