function airbrakeSessionData (request, captchaCheckResults) {
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

  if (captchaCheckResults) {
    sessionInfo.token = {
      token: captchaCheckResults.token,
      tokenSet: captchaCheckResults.tokenSet,
      tokenDate: captchaCheckResults.tokenSet ? new Date(captchaCheckResults.tokenSet).toISOString() : undefined,
      tokenValid: captchaCheckResults.tokenValid,
      tokenPostcode: captchaCheckResults.tokenPostcode
    }

    if (captchaCheckResults.error) {
      sessionInfo.error = {
        name: captchaCheckResults.error?.name,
        code: captchaCheckResults.error?.code,
        message: captchaCheckResults.errorMessage,
        detail: captchaCheckResults.error?.detail
      }
    }
  }
  return sessionInfo
}

module.exports = { airbrakeSessionData }
