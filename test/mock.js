const config = require('../server/config')
const mockOptions = () => {
  let options
  if (config.friendlyCaptchaEnabled && config.friendlyCaptchaBypass) {
    options = {
      method: 'GET',
      url: `/postcode?captchabypass=${encodeURIComponent(config.friendlyCaptchaBypass)}`
    }
  } else {
    options = {
      method: 'GET',
      url: '/postcode'
    }
  }
  return options
}

const mockSearchOptions = (postcode, cookie) => {
  const postPostcode = postcode.replace(' ', '+')
  const postOptions = {
    method: 'POST',
    url: '/postcode',
    payload: `postcode=${postPostcode}`,
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    }
  }
  const getOptions = {
    method: 'GET',
    url: `/search?postcode=${encodeURIComponent(postcode)}`
  }
  if (cookie) {
    postOptions.headers.cookie = cookie
    getOptions.headers = {
      cookie
    }
  }
  return { postOptions, getOptions }
}

module.exports = { mockOptions, mockSearchOptions }
