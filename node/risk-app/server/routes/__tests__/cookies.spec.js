const STATUS_CODES = require('http2').constants
const createServer = require('../../../server')
const defaultPostOptions = {
  method: 'POST',
  url: '/cookies',
  headers: {
    'Content-type': 'application/x-www-form-urlencoded'
  }
}
let server

beforeAll(async () => {
  server = await createServer()
  await server.initialize()
})

afterAll(async () => {
  await server.stop()
})

describe('cookies page', () => {
  test('can handle invalid cookies', async () => {
    const options = {
      method: 'GET',
      url: '/cookies',
      headers: {
        cookie: 'some-token=<token>'
      }
    }
    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK) // 200
  })

  test('returns correct content', async () => {
    const options = {
      method: 'GET',
      url: '/cookies'
    }
    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK) // 200
    expect(response.payload).toMatch(/We use cookies to make Check your long term flood risk work/g)
  })

  test('post cookie update', async () => {
    const options = defaultPostOptions
    options.payload = 'analytics=true'

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND) // 302
  })

  test('post async cookie update', async () => {
    const options = defaultPostOptions
    options.payload = 'analytics=true&async=true'
    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK) // 200
    expect(response.payload).toMatch(/ok/g)
  })

  test('post invalid cookie update', async () => {
    const options = defaultPostOptions
    options.payload = 'blah=blah'
    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK) // 200
  })
})
