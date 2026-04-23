const joi = require('joi')
const boom = require('@hapi/boom')
const config = require('../config')
const SearchViewModel = require('../models/search-view')
const errors = require('../models/errors.json')
const redirectPath = '/postcode#'
const backLinkUri = '/postcode'
const { redirectToHomeCounty } = require('../helpers')
const { Postcode } = require('../services/postcode-normalisation')
const { captchaCheck } = require('../services/captchacheck')

const getWarnings = async (postcode, request) => {
  try {
    let warnings = await request.server.methods.floodService(postcode)
    if (warnings?.address === 'England') {
      warnings = {}
    }
    return warnings
  } catch (error) {
    if (request.server.methods.notify) {
      request.server.methods.notify(error)
    }
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
      const postcodeInfo = request.yar.get('postcodeInfo')

      if (!addresses || !postcodeInfo) {
        return h.redirect(redirectPath)
      }

      try {
        const captchaCheckResults = await captchaCheck('', postcodeInfo.postcode, request.yar)

        if (!captchaCheckResults.tokenValid) {
          return h.redirect(redirectPath)
        }

        // getWarnings doesnt throw an error so no need to catch it
        const warnings = await getWarnings(postcodeInfo.postcode, request)

        const previousAboutThisAddress = request.yar.get('aboutThisAddress')

        return h.view('search', new SearchViewModel(addresses[0].postcode, addresses, null, warnings, backLinkUri, postcodeInfo.otherRegion, { aboutThisAddress: previousAboutThisAddress }))
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
      const addresses = request.yar.get('addresses')
      const postcodeInfo = request.yar.get('postcodeInfo')
      let errorMessage
      let searchReasonErrorMessage

      if (!addresses || !postcodeInfo) {
        return h.redirect(redirectPath)
      }

      const { address, aboutThisAddress } = request.payload

      if (address < 0) {
        errorMessage = 'Select an address'
      }

      if (!aboutThisAddress) {
        searchReasonErrorMessage = 'Select an option for this address'
      }

      // throw for postcode mismatch when address is within addresses index range
      if (!await Postcode.compare(postcodeInfo.postcode, addresses[0].postcode)) {
        return h.redirect(redirectPath)
      }

      if (errorMessage || searchReasonErrorMessage) {
        // getWarnings doesnt throw an error so no need to catch it and its only used in errors anyway
        const warnings = await getWarnings(postcodeInfo.postcode, request)
        const model = new SearchViewModel(
          postcodeInfo.postcode,
          addresses,
          errorMessage,
          warnings,
          backLinkUri,
          postcodeInfo.otherRegion,
          {
            aboutThisAddress,
            searchReasonErrorMessage,
            selectedAddress: address
          }
        )
        return h.view('search', model)
      }

      // throw if address index is out of bounds
      if (!addresses[address]) {
        return h.redirect(redirectPath)
      }

      const addressRecord = addresses[address]
      request.yar.set({
        address: addressRecord,
        aboutThisAddress
      })
      if (addressRecord.country_code !== 'E') {
        return redirectToHomeCounty(h, postcodeInfo.postcode, addressRecord.country_code)
      }

      return h.redirect('/risk#')
    },
    options: {
      description: 'Post to the search page',
      validate: {
        query: joi.object().keys({
          postcode: joi.any()
        }),
        payload: joi.object().keys({
          address: joi.number().required(),
          aboutThisAddress: joi.string().valid('live', 'move', 'work', 'not-spec').allow('').optional()
        })
      }
    }
  }
]
