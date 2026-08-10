function airbrakeSessionData (request, info) {
  const sessionInfo = {}

  if (request) {
    sessionInfo.request = {
      method: request.method.toUpperCase(),
      uri: request.server.info.uri + request.path,
      headers: {
        host: request.headers.host,
        cookie: request.headers.cookie,
        'user-agent': request.headers['user-agent']
      },
      payload: request.payload
    }
  }

  if (info) {
    if (info.captchaCheckResults) {
      sessionInfo.token = {
        token: info.captchaCheckResults.token,
        tokenSet: info.captchaCheckResults.tokenSet,
        tokenDate: info.captchaCheckResults.tokenSet ? new Date(info.captchaCheckResults.tokenSet).toISOString() : undefined,
        tokenValid: info.captchaCheckResults.tokenValid,
        tokenPostcode: info.captchaCheckResults.tokenPostcode
      }

      if (info.captchaCheckResults.error) {
        sessionInfo.error = {
          name: info.captchaCheckResults.error?.name,
          code: info.captchaCheckResults.error?.code,
          message: info.captchaCheckResults.errorMessage,
          detail: info.captchaCheckResults.error?.detail
        }
      }
    }
    if (info.postcodeError) {
      sessionInfo.OSApi = info.postcodeError
    }
  }
  return sessionInfo
}

module.exports = { airbrakeSessionData }
