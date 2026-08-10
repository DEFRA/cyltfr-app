let request, captchaResults

describe('error-session-data model', () => {
  beforeAll(() => {
    request = {
      method: 'post',
      server: {
        info: {
          uri: 'http://localhost:3000'
        }
      },
      path: '/postcode',
      headers: {
        host: 'localhost:3000',
        cookie: '',
        'user-agent': ''
      }
    }

    captchaResults = {
      token: 'token',
      tokenPostcode: 'NP18 3EZ',
      tokenSet: 1234567890,
      tokenValid: true,
      errorMessage: '',
    }
  })

  test('Returns session data with request and captchaCheckResults', () => {
    const sessionData = require('../error-session-data')
    const result = sessionData.airbrakeSessionData(request, { captchaCheckResults: captchaResults })
    expect(result.request).toBeDefined()
    expect(result.token).toBeDefined()
    expect(result.error).toBeUndefined()
  })

  test('Returns session data with request only', () => {
    const sessionData = require('../error-session-data')
    const result = sessionData.airbrakeSessionData(request)
    expect(result.request).toBeDefined()
    expect(result.token).toBeUndefined()
    expect(result.error).toBeUndefined()
  })

  test('Returns session data with captchaCheckResults only', () => {
    const sessionData = require('../error-session-data')
    const result = sessionData.airbrakeSessionData(undefined, { captchaCheckResults: captchaResults })
    expect(result.request).toBeUndefined()
    expect(result.token).toBeDefined()
    expect(result.error).toBeUndefined()
  })
})
