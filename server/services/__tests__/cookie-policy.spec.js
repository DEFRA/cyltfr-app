const {
  getCookiePolicy,
  removeAnalyticsCookies,
  buildUpdatedPolicy
} = require('../cookie-policy.js')

const GA_COOKIE = '_ga'
const GA_COOKIE_ID = '_ga_id'

describe('cookie-policy', () => {
  test('returns cookies policy from request state', () => {
    const request = {
      state: {
        cookies_policy: {
          analytics: false,
          confirmed: true
        }
      }
    }

    expect(getCookiePolicy(request)).toEqual({
      analytics: false,
      confirmed: true
    })
  })

  test('handles request with no state', () => {
    expect(getCookiePolicy({})).toBeUndefined()
  })

  test('removes only analytics cookies', () => {
    const request = {
      state: {
        [GA_COOKIE]: 'a',
        [GA_COOKIE_ID]: 'b',
        session_cookie: 'c'
      }
    }

    const h = {
      unstate: jest.fn()
    }

    removeAnalyticsCookies(request, h)

    expect(h.unstate).toHaveBeenCalledWith(GA_COOKIE)
    expect(h.unstate).toHaveBeenCalledWith(GA_COOKIE_ID)
    expect(h.unstate).not.toHaveBeenCalledWith('session_cookie')
  })

  test('remove analytics cookies handles request with no state', () => {
    const h = {
      unstate: jest.fn()
    }

    removeAnalyticsCookies({}, h)

    expect(h.unstate).not.toHaveBeenCalled()
  })

  test('builds updated policy', () => {
    const existing = {
      essential: true,
      analytics: true,
      customFlag: 'x'
    }

    expect(buildUpdatedPolicy(existing, false)).toEqual({
      essential: true,
      analytics: false,
      customFlag: 'x',
      confirmed: true
    })
  })

  test('builds updated policy when existing policy is undefined', () => {
    expect(buildUpdatedPolicy(undefined, false)).toEqual({
      analytics: false,
      confirmed: true
    })
  })
})
