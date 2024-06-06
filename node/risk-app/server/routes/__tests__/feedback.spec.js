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

describe('/Feedback test', () => {
  test('/feedback', async () => {
    const options = {
      method: 'GET',
      url: '/feedback'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK) // 200
  })
  test('/feedback - With referrer header', async () => {
    const options = {
      method: 'GET',
      url: '/feedback',
      headers: { referer: 'https://en.wikipedia.org/wiki/Main_Page' }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK) // 200
  })
  test('/feedback - With no agent', async () => {
    const options = {
      method: 'GET',
      url: '/feedback',
      headers: {
        referer: 'https://en.wikipedia.org/wiki/Main_Page',
        'user-agent': ''
      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK) // 200
  })
})
