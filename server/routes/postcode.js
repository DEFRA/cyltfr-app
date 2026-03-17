const config = require('../config')
const joi = require('joi')
const PostcodeViewModel = require('../models/postcode-view')
const { redirectToHomeCounty } = require('../helpers')
const { captchaCheck } = require('../services/captchacheck')
const { airbrakeSessionData } = require('../models/error-session-data')
const { Postcode } = require('../services/postcode-normalisation')

module.exports = [
  {
    method: 'GET',
    path: '/postcode',
    handler: (request, h) => {
      const postcode = Postcode.formatForDisplay(request.yar.get('postcodeInfo')?.postcode)
      request.yar.set('address', null)
      request.yar.set('addresses', null)
      request.yar.set('postcodeInfo', null)
      request.yar.set('previousPage', request.path)
      const error = request.query.error
      const backLinkUri = config.floodRiskUrl

      if (error) {
        const errorMessage = 'This postcode does not appear to exist'
        const model = new PostcodeViewModel(null, errorMessage, config.sessionTimeout)
        return h.view('postcode', model)
      }

      if (config.friendlyCaptchaEnabled) {
        if ('captchabypass' in request.query) {
          // set captchabypass flag
          request.yar.set('captchabypass', (request.query.captchabypass === config.friendlyCaptchaBypass))
          console.log('Captcha Bypass set to : %s', request.yar.get('captchabypass'))
        }
        return h.view('postcode', new PostcodeViewModel(postcode, null, config.sessionTimeout))
      }
      return h.view('postcode', new PostcodeViewModel(postcode, null, null, backLinkUri))
    },
    options: {
      description: 'Get the postcode page'
    }
  },
  {
    method: 'POST',
    path: '/postcode',
    handler: async (request, h) => {
      let postcodeInfo, addresses
      try {
        ({ postcodeInfo, addresses } = await Postcode.normalise(request.payload.postcode, request.server.methods.find))
      } catch {
        return h.redirect('/postcode?error=postcode_does_not_exist')
      }

      if (!postcodeInfo.postcode || !postcodeInfo.isValid) {
        const errorMessage = 'Enter a full postcode in England'
        const model = new PostcodeViewModel(postcodeInfo.postcode, errorMessage, config.sessionTimeout)
        return h.view('postcode', model)
      }

      // valid postcode but not england — redirect to regional info page
      if (postcodeInfo.isEngland === false) {
        return redirectToHomeCounty(h, postcodeInfo.postcode, postcodeInfo.region)
      }

      const captchaCheckResults = await captchaCheck(request.payload['frc-captcha-response'], postcodeInfo.postcode, request.yar, request.server)
      if (captchaCheckResults.tokenValid) {
        request.yar.set('postcodeInfo', postcodeInfo)
        request.yar.set('addresses', addresses)
        // Include a # in the redirected URL, or the browser will jump to any previous url fragment (like #main-content)
        // See https://www.rfc-editor.org/rfc/rfc9110.html#field.location
        return h.redirect('/search#')
      } else {
        const sessionInfo = airbrakeSessionData(request, captchaCheckResults)

        request.server.methods.notify(`FriendlyCaptcha server check failed: ${sessionInfo.error.code} - ${sessionInfo.error.detail}`, { sessionInfo })

        const model = new PostcodeViewModel(postcodeInfo.postcode, captchaCheckResults.errorMessage, config.sessionTimeout)
        return h.view('postcode', model)
      }
    },
    options: {
      description: 'Post to the postcode page',
      validate: {
        payload: joi.object().keys({
          postcode: joi.any(),
          'frc-captcha-response': joi.string()
        }).required()
      }
    }
  }
]
