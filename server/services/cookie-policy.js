const googleCookiesRegex = /^_ga$|^_ga_.*$|^_gid$|^_gat_.*$|^_dc_gtm_.*$/

function getCookiePolicy (request) {
  const { state = {} } = request
  return state.cookies_policy
}

function getCookieDomain (hostname) {
  const names = hostname?.split('.')
  if (names) names.shift()
  return ('.' + names?.join('.'))
}

function removeAnalyticsCookies (request, h) {
  const { state = {} } = request

  for (const cookieName of Object.keys(state)) {
    if (googleCookiesRegex.test(cookieName)) {
      h.unstate(cookieName, {
        isHttpOnly: false,
        isSameSite: 'Lax',
        path: '/',
        domain: getCookieDomain(request?.info?.hostname)
      })
    }
  }
}

function buildUpdatedPolicy (existingPolicy, analytics) {
  const safeExistingPolicy = existingPolicy ?? {}

  return {
    ...safeExistingPolicy,
    analytics,
    confirmed: true
  }
}

module.exports = {
  getCookiePolicy,
  removeAnalyticsCookies,
  buildUpdatedPolicy
}
