const STATUS_CODES = require('http2').constants
const createServer = require('../../../server')
const config = require('../../config')

jest.mock('../../config')

describe('GET /rivers-and-sea with risk flag disabled', () => {
  let server

  beforeAll(async () => {
    config.setConfigOptions({ riskPageFlag: false })
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('throws an error if the risk page flag is not set, disallowing access to page', async () => {
    const mockRequest = {
      method: 'GET',
      url: '/rivers-and-sea'
    }
    const response = await server.inject(mockRequest)

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_NOT_FOUND)
  })
})
