const googleCookiesRegex = /^_ga$|^_ga_.*$|^_gid$|^_gat_.*$|^_dc_gtm_.*$/

function getCookiePolicy (request) {
  const { state = {} } = request
  return state?.cookies_policy
}

function getHostName (request) {
  const forwarded = request?.headers?.['X-Forwarded-Host']
  const host = forwarded || request?.info?.hostname

  if (!host) {
    return host
  }

  if (host.startsWith('[') && host.includes(']')) {
    return host.slice(1, host.indexOf(']'))
  }

  if (host.includes(':') && host.split(':').length > 2) {
    return host
  }

  return host.split(':')[0]
}

function removeAnalyticsCookies (request, h) {
  const { state = {} } = request
  let domainNames = new Set()

  for (const cookieName of Object.keys(state)) {
    if (googleCookiesRegex.test(cookieName)) {
      if (domainNames.size === 0) {
        domainNames = buildDeletableDomains(getHostName(request))
      }
      // Ask hapi to remove the cookie
      h.unstate(cookieName)

      // Also set the cookie headers for all possible domains as well, as they won't be cleared by the browser if the domain isn't correct.
      addCookieHeader(request, `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`)
      domainNames.forEach((domainName) => {
        addCookieHeader(request, `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domainName}`)
      })
    }
  }
}

function buildDeletableDomains (hostname) {
  const domains = new Set()

  if (!hostname) {
    return domains
  }

  if (hostname.startsWith('[') && hostname.includes(']')) {
    return domains
  }

  if (hostname.includes(':') && hostname.split(':').length > 2) {
    return domains
  }

  domains.add(hostname)
  domains.add('.' + hostname)

  const parts = hostname.split('.')

  for (let i = 1; i < parts.length - 1; i++) {
    domains.add('.' + parts.slice(i).join('.'))
  }

  return domains
}

function addCookieHeader (request, header) {
  const responseHeaders = request.response?.headers || {}

  if (Object.keys(responseHeaders).includes('set-cookie')) {
    const existing = responseHeaders['set-cookie']
    if (existing) {
      header = (Array.isArray(existing) ? existing : [existing]).concat(header)
    }
  }
  if (request.response?.header) {
    request.response.header('set-cookie', header)
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
