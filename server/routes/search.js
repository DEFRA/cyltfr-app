const joi = require('joi')
const boom = require('@hapi/boom')
const { redirectToHomeCounty } = require('../helpers')
const config = require('../config')
const SearchViewModel = require('../models/search-view')
const errors = require('../models/errors.json')
const { captchaCheck } = require('../services/captchacheck')
const { Postcode } = require('../services/postcode-normalisation')

const getWarnings = async (postcode, request) => {
  try {
    let warnings = await request.server.methods.floodService(postcode)
    if (warnings?.address === 'England') {
      warnings = {}
    }
    return warnings
  } catch (error) {
    if (request.server.methods.notify) request.server.methods.notify(error)
    request.log('error', error)
  }
}

module.exports = [
  {
    method: 'GET',
    path: '/search',
    handler: async (request, h) => {
      request.yar.set('previousPage', request.path)
      const addresses = request.yar.get('addresses')
      let postcodeInfo = request.yar.get('postcodeInfo')

      if (!postcodeInfo?.postcode) {
        postcodeInfo = await Postcode.normalise(request.query.postcode)
        if (!postcodeInfo.postcode) {
          return h.redirect('/postcode')
        }
      }

      if (!postcodeInfo.isEngland) {
        return redirectToHomeCounty(h, postcodeInfo.postcode, postcodeInfo.region)
      }

      try {
        const captchaCheckResults = await captchaCheck('', postcodeInfo.postcode, request.yar)

        if (!captchaCheckResults.tokenValid) {
          return h.redirect('/postcode')
        }

        if (!addresses || !addresses.length) {
          return h.view('search', new SearchViewModel(postcodeInfo.postcode))
        }
        let warnings
        try {
          warnings = await getWarnings(postcodeInfo.postcode, request)
        } catch {}
        const backLinkUri = '/postcode'
        return h.view('search', new SearchViewModel(addresses[0].postcode, addresses, null, warnings, backLinkUri))
      } catch (err) {
        return boom.serverUnavailable(errors.addressByPostcode.message, err)
      }
    },
    options: {
      description: 'Get the search page',
      plugins: {
        'hapi-rate-limit': {
          enabled: config.rateLimitEnabled
        }
      },
      validate: {
        query: joi.object().keys({
          postcode: joi.any()
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/search',
    handler: async (request, h) => {
      const redirectPath = '/postcode#'
      const addresses = request.yar.get('addresses')
      let postcodeInfo = request.yar.get('postcodeInfo')

      if (!postcodeInfo.postcode) {
        postcodeInfo = Postcode.normalise(request.yar.get('postcode'))
      }
      const { address } = request.payload

      if (!Array.isArray(addresses)) {
        return h.redirect(redirectPath)
      }

      let errorMessage
      if (addresses.length <= 0) {
        errorMessage = 'Enter a valid postcode'
      }
      if (address < 0) {
        errorMessage = 'Select an address'
      }

      // throw for postcode mismatch when address is within addresses index range
      if (addresses?.length > 0 && !Postcode.compare(postcodeInfo.postcode, addresses[0].postcode)) {
        return h.redirect(redirectPath)
      }

      let warnings
      try {
        warnings = await getWarnings(postcodeInfo.postcode, request)
      } catch {}
      if (errorMessage) {
        const model = new SearchViewModel(postcodeInfo.postcode, addresses, errorMessage, warnings)

        return h.view('search', model)
      }

      // throw if address index is out of bounds
      if (!addresses[address]) {
        return h.redirect(redirectPath)
      }

      const addressRecord = addresses[address]
      request.yar.set({
        address: addressRecord
      })
      if (addressRecord.country_code !== 'E') {
        return redirectToHomeCounty(h, postcodeInfo.postcode, addressRecord.country_code)
      }
      // Set addresses to session
      return h.redirect('/risk#')
    },
    options: {
      description: 'Post to the search page',
      validate: {
        query: joi.object().keys({
          postcode: joi.any()
        }),
        payload: joi.object().keys({
          address: joi.number().required()
        })
      }
    }
  }
]
