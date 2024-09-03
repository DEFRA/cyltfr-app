const joi = require('joi')

module.exports = {
  method: 'GET',
  path: '/england-only',
  handler: async (request, h) => {
    let postcodeIn = request.query.postcode
    const address = request.yar.get('address')
    if ((address) && ('postcode' in address)) {
      postcodeIn = address.postcode
    }
    if (!postcodeIn) {
      return h.redirect('/postcode')
    }
    const backLinkUri = '/postcode'
    const model = {
      isWales: request.query.region === 'wales',
      isScotland: request.query.region === 'scotland',
      isNorthernIreland: request.query.region === 'northern-ireland',
      backLinkUri
    }

    return h.view('england-only', model)
  },
  options: {
    description: 'Get the england only page',
    validate: {
      query: joi.object().keys({
        region: joi.string().allow('', 'wales', 'northern-ireland', 'scotland'),
        premises: joi.string().allow(''),
        postcode: joi.string().allow('')
      }).required()
    }
  }
}
