const googleCookiesRegex = /^_ga$|^_ga_.*$|^_gid$|^_gat_.*$|^_dc_gtm_.*$/

function getCookiePolicy (request) {
  const { state = {} } = request
  return state.cookies_policy
}

function removeAnalyticsCookies (request, h) {
  const { state = {} } = request

  for (const cookieName of Object.keys(state)) {
    if (googleCookiesRegex.test(cookieName)) {
      h.unstate(cookieName)
    }
  }
}

function buildUpdatedPolicy (existingPolicy = {}, analytics) {
  return {
    ...existingPolicy,
    analytics,
    confirmed: true
  }
}

module.exports = {
  getCookiePolicy,
  removeAnalyticsCookies,
  buildUpdatedPolicy
}
