const joi = require('joi')
const boom = require('@hapi/boom')
const { postcodeRegex, redirectToHomeCounty } = require('../helpers')
const config = require('../config')
const SearchViewModel = require('../models/search-view')
const errors = require('../models/errors.json')
const { captchaCheck } = require('../services/captchacheck')

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
      let addresses
      let { postcode } = request.query
      if (!postcode) {
        postcode = request.yar.get('postcode')
        if (!postcode) {
          return h.redirect('/postcode')
        }
      }

      // Our Address service doesn't support NI addresses
      // but all NI postcodes start with BT so redirect to
      // "england-only" page if that's the case.
      if (postcode.toUpperCase().startsWith('BT')) {
        return redirectToHomeCounty(h, postcode, 'northern-ireland')
      }

      try {
        const captchaCheckResults = await captchaCheck('', postcode, request.yar)

        if (!captchaCheckResults.tokenValid) {
          return h.redirect('/postcode')
        }

        try {
          addresses = await request.server.methods.find(postcode)
        } catch {
          return h.redirect('/postcode?error=postcode_does_not_exist')
        }

        // Set addresses to session
        request.yar.set({
          addresses,
          postcode
        })

        if (!addresses || !addresses.length) {
          return h.view('search', new SearchViewModel(postcode))
        }
        let warnings
        try {
          warnings = await getWarnings(postcode, request)
        } catch {}
        const backLinkUri = '/postcode'
        return h.view('search', new SearchViewModel(postcode, addresses, null, warnings, backLinkUri))
      } catch (err) {
        return boom.badRequest(errors.addressByPostcode.message, err)
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
          postcode: joi.string().trim().regex(postcodeRegex).default('')
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/search',
    handler: async (request, h) => {
      let { postcode } = request.query
      if (!postcode) {
        postcode = request.yar.get('postcode')
      }
      const { address } = request.payload
      const addresses = request.yar.get('addresses')

      if (!Array.isArray(addresses)) {
        return h.redirect('/postcode#')
      }
      let errorMessage
      if (addresses.length <= 0) {
        errorMessage = 'Enter a valid postcode'
      }
      if (address < 0) {
        errorMessage = 'Select an address'
      }
      let warnings
      try {
        warnings = await getWarnings(postcode, request)
      } catch {}
      if (errorMessage) {
        const model = new SearchViewModel(postcode, addresses, errorMessage, warnings)

        return h.view('search', model)
      }

      const addressRecord = addresses[address]
      if (addressRecord.country_code !== 'E') {
        return redirectToHomeCounty(h, postcode, addressRecord.country_code)
      }
      // Set addresses to session
      request.yar.set({
        address: addressRecord
      })

      return h.redirect('/risk#')
    },
    options: {
      description: 'Post to the search page',
      validate: {
        query: joi.object().keys({
          postcode: joi.string().trim().regex(postcodeRegex).default('')
        }),
        payload: joi.object().keys({
          address: joi.number().required()
        })
      }
    }
  }
]
