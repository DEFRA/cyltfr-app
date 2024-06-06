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

describe('managing flood risk page', () => {
  test('gets redirected to the govuk page', async () => {
    const options = {
      method: 'GET',
      url: '/managing-flood-risk'
    }
    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_MOVED_PERMANENTLY) // 301
    expect(response.headers.location).toEqual('https://www.gov.uk/prepare-for-flooding')
  })
})
