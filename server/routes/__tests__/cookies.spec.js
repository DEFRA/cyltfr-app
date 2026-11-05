const STATUS_CODES = require('http2').constants
const createServer = require('../../../server')
const GA_COOKIE = '_ga'
const GA_COOKIE_ID = '_ga_id'
const analyticsCookieHeader = `${GA_COOKIE}=test-ga-cookie; ${GA_COOKIE_ID}=test-session-cookie`
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

  test('post cookie rejection clears analytics cookies', async () => {
    const options = {
      ...defaultPostOptions,
      payload: 'analytics=false',
      headers: {
        ...defaultPostOptions.headers,
        cookie: analyticsCookieHeader
      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND) // 302
    expect(response.headers['set-cookie'].join(' ')).toMatch(new RegExp(`${GA_COOKIE}=`))
    expect(response.headers['set-cookie'].join(' ')).toMatch(new RegExp(`${GA_COOKIE_ID}=`))
  })

  test('view response expires stale analytics cookies when rejected policy already set', async () => {
    const rejectResponse = await server.inject({
      ...defaultPostOptions,
      payload: 'analytics=false',
      headers: {
        ...defaultPostOptions.headers,
        cookie: analyticsCookieHeader
      }
    })

    const cookiesPolicySetCookie = rejectResponse.headers['set-cookie']
      .find((cookieHeader) => cookieHeader.startsWith('cookies_policy='))
      .split(';')[0]

    const viewResponse = await server.inject({
      method: 'GET',
      url: '/cookies',
      headers: {
        cookie: `${cookiesPolicySetCookie}; ${analyticsCookieHeader}`
      }
    })

    expect(viewResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK) // 200
    expect(viewResponse.headers['set-cookie'].join(' ')).toMatch(new RegExp(`${GA_COOKIE}=`))
    expect(viewResponse.headers['set-cookie'].join(' ')).toMatch(new RegExp(`${GA_COOKIE_ID}=`))
  })

  test('post invalid cookie update', async () => {
    const options = defaultPostOptions
    options.payload = 'blah=blah'
    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK) // 200
  })
})
