const config = require('../config')
const joi = require('joi')
const { postcodeRegex, redirectToHomeCounty } = require('../helpers')
const PostcodeViewModel = require('../models/postcode-view')
const { captchaCheck } = require('../services/captchacheck')

module.exports = [
  {
    method: 'GET',
    path: '/postcode',
    handler: (request, h) => {
      request.yar.set('address', null)
      request.yar.set('postcode', null)
      const error = request.query.error
      request.yar.set('previousPage', request.path)
      const backLinkUri = config.floodRiskUrl

      if (error) {
        const errorMessage = 'This postcode does not appear to exist'
        const model = new PostcodeViewModel(null, errorMessage, config.sessionTimeout)
        return h.view('postcode', model)
      }

      if (config.friendlyCaptchaEnabled) {
        if (Object.prototype.hasOwnProperty.call(request.query, 'captchabypass')) {
          // if value passed doesn't equal config value, clear out the session setting.
          request.yar.set('captchabypass', (request.query.captchabypass === config.friendlyCaptchaBypass))
          console.log('Captcha Bypass set to : %s', request.yar.get('captchabypass'))
          // if it does equal config value then set the captchabypass session setting.
        }
        return h.view('postcode', new PostcodeViewModel(null, null, config.sessionTimeout))
      }
      return h.view('postcode', new PostcodeViewModel(null, null, null, backLinkUri))
    },
    options: {
      description: 'Get the postcode page'
    }
  },
  {
    method: 'POST',
    path: '/postcode',
    handler: async (request, h) => {
      const { postcode } = request.payload

      if (!postcode || !postcode.match(postcodeRegex)) {
        const errorMessage = 'Enter a full postcode in England'
        const model = new PostcodeViewModel(postcode, errorMessage, config.sessionTimeout)
        return h.view('postcode', model)
      }

      // Our Address service doesn't support NI addresses
      // but all NI postcodes start with BT so redirect to
      // "england-only" page if that's the case.
      if (postcode.toUpperCase().startsWith('BT')) {
        return redirectToHomeCounty(h, postcode, 'northern-ireland')
      }

      const captchaCheckResults = await captchaCheck(request.payload['frc-captcha-solution'], postcode, request.yar, request.server)
      if (captchaCheckResults.tokenValid) {
        // Include a # in the redirected URL, or the browser will jump to any previous url fragment (like #main-content)
        // See https://www.rfc-editor.org/rfc/rfc9110.html#field.location
        return h.redirect(`/search?postcode=${encodeURIComponent(postcode)}#`)
      } else {
        // check what error was returned
        const model = new PostcodeViewModel(postcode, captchaCheckResults.errorMessage, config.sessionTimeout)
        return h.view('postcode', model)
      }
    },
    options: {
      description: 'Post to the postcode page',
      validate: {
        payload: joi.object().keys({
          postcode: joi.string().trim().required().allow(''),
          'frc-captcha-solution': joi.string()
        }).required()
      }
    }
  }
]
