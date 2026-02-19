const { sessionTimeout, friendlyCaptchaSecretKey, friendlyCaptchaUrl, friendlyCaptchaEnabled } = require('../config')
const errors = require('../models/errors.json')
const util = require('../util')
const sessionTimeoutInMs = sessionTimeout * 60 * 1000

async function validateCaptcha (token) {
  // If we need to verify the token, do this here.
  const uri = `${friendlyCaptchaUrl}`
  const requestData = {
    response: token
  }
  const options = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-Key': friendlyCaptchaSecretKey
    },
    json: true,
    payload: requestData
  }

  try {
    const apiResponse = await util.post(uri, options, true)
    if (!apiResponse?.success) {
      const err = new Error('FriendlyCaptcha server check failed')
      err.name = 'FriendlyCaptchaError'
      err.code = apiResponse?.error?.error_code || 'unknown_error'
      err.detail = apiResponse?.error?.detail || 'Unknown error'
      throw err
    }
  } catch (error) {
    // Fail open for network errors
    if (error?.name === 'FriendlyCaptchaError') {
      throw error
    }
    return true
  }
  return true
}

function clearStoredValues (yar) {
  yar.set({
    token: undefined,
    tokenPostcode: undefined,
    tokenSet: undefined,
    tokenValid: false
  })
}

function storeResults (results, yar) {
  yar.set({
    token: results.token,
    tokenPostcode: results.tokenPostcode,
    tokenSet: results.tokenSet,
    tokenValid: results.tokenValid
  })
}

function tokenExpired (yar) {
  const lastTokenSet = yar.get('tokenSet')
  if (Number.isInteger(lastTokenSet)) {
    if ((sessionTimeoutInMs + lastTokenSet) > Date.now()) {
      return false
    }
  }
  return true
}

function comparePostcode (postcode, yarStoredPostcode) {
  const formattedPostcode = postcode.split(' ').join('').toUpperCase()
  const formattedYarPostcode = yarStoredPostcode.split(' ').join('').toUpperCase()
  return formattedPostcode === formattedYarPostcode
}

async function captchaCheck (token, postcode, yar) {
  // For testing purposes set FRIENDLY_CAPTCHA_FORCE_FAIL to true in .env
  if (process.env.FRIENDLY_CAPTCHA_FORCE_FAIL === 'true') {
    // Generate a token based on the current time epoch converted to base 36
    const BASE_STRING_CONVERSION = 36
    token = Math.floor(Date.now()).toString(BASE_STRING_CONVERSION)
  }

  const results = {
    token,
    tokenPostcode: postcode,
    tokenSet: Date.now(),
    tokenValid: false,
    errorMessage: ''
  }

  if (!friendlyCaptchaEnabled) {
    results.tokenValid = true
    return results
  }

  if (yar.get('captchabypass')) {
    results.tokenValid = true
    storeResults(results, yar)
    return results
  }

  if (invalidTokenState(token)) {
    return invalidToken(results, yar)
  }

  const storedToken = yar.get('token')

  if (matchesStoredToken(token, storedToken)) {
    return validateStoredToken(results, postcode, yar)
  }

  if (token) {
    // call out and check token
    clearStoredValues(yar)

    try {
      await validateCaptcha(token)
      results.tokenValid = true
    } catch (error) {
      results.errorMessage = errors.friendlyCaptchaError.message
      results.error = error
    }
    storeResults(results, yar)
    return results
  } else {
    results.errorMessage = errors.friendlyCaptchaError.message
    clearStoredValues(yar)
    return results
  }
}

function invalidTokenState (token) {
  return token && [
    'undefined', '.FETCHING', '.UNSTARTED',
    '.UNFINISHED', '.ERROR', '.EXPIRED'
  ].includes(token)
}

function invalidToken (results, yar) {
  clearStoredValues(yar)
  results.errorMessage =
    'You cannot continue until Friendly Captcha has checked that you\'re not a robot'
  return results
}

function errorAndClear (results, yar) {
  clearStoredValues(yar)
  results.errorMessage = errors.friendlyCaptchaError.message
  return results
}

function matchesStoredToken (token, storedToken) {
  return (token && token === storedToken) ||
         (storedToken && !token)
}

function validateStoredToken (results, postcode, yar) {
  if (!comparePostcode(postcode, yar.get('tokenPostcode'))) {
    return errorAndClear(results, yar)
  }

  if (tokenExpired(yar)) {
    return errorAndClear(results, yar)
  }

  results.tokenValid = yar.get('tokenValid')
  results.tokenSet = yar.get('tokenSet')

  return results
}

module.exports = {
  captchaCheck
}
