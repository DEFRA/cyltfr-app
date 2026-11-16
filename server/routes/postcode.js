const config = require('../config')
const joi = require('joi')
const PostcodeViewModel = require('../models/postcode-view')
const { redirectToHomeCounty } = require('../helpers')
const { captchaCheck } = require('../services/captchacheck')
const { airbrakeSessionData } = require('../models/error-session-data')
const { Postcode } = require('../services/postcode-normalisation')
const errors = require('../models/errors.json')

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
          request.yar.set('captchabypass', ((request.query.captchabypass === config.friendlyCaptchaBypass) && !!config.friendlyCaptchaBypass))
          console.log('Captcha Bypass set to : %s', request.yar.get('captchabypass'))
        }
        return h.view('postcode', new PostcodeViewModel(postcode, null, config.sessionTimeout, null, request.yar.get('captchabypass')))
      }
      return h.view('postcode', new PostcodeViewModel(postcode, null, null, backLinkUri, request.yar.get('captchabypass')))
    },
    options: {
      description: 'Get the postcode page'
    }
  },
  {
    method: 'POST',
    path: '/postcode',
    handler: async (request, h) => {
      const testPostcode = Postcode.findPostcodeInString(request.payload.postcode)
      const { postcodeInfo, addresses, error, anyFound } = await Postcode.normalise(testPostcode, request.server.methods.find)

      if (error) {
        const sessionInfo = airbrakeSessionData(request, { postcodeError: error })
        if (request.server.methods.notify) {
          request.server.methods.notify(`OSApi postcode search raised an error: ${error?.data?.payload?.error?.statuscode}`, { sessionInfo })
        }
        const errorMessage = errors.addressByPostcode.message
        const model = new PostcodeViewModel(postcodeInfo.postcode, errorMessage, config.sessionTimeout)
        return h.view('postcode', model)
      }
      if (!postcodeInfo.postcode || !postcodeInfo.isValidFormat) {
        const errorMessage = errors.postcodeInvalid.message
        const model = new PostcodeViewModel(postcodeInfo.postcode, errorMessage, config.sessionTimeout)
        return h.view('postcode', model)
      }
      if (!anyFound) {
        const errorMessage = errors.addressNotFound.message
        const model = new PostcodeViewModel(postcodeInfo.postcode, errorMessage, config.sessionTimeout)
        return h.view('postcode', model)
      }

      // valid postcode but not england — redirect to regional info page
      if ((postcodeInfo.isEngland === false)) {
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
        const sessionInfo = airbrakeSessionData(request, { captchaCheckResults })

        if (request.server.methods.notify) {
          request.server.methods.notify(`FriendlyCaptcha server check failed: ${sessionInfo.error?.code} - ${sessionInfo.error?.detail}`, { sessionInfo })
        }
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
