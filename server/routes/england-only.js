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
      isWales: ['wales', 'W'].includes(request.query.region),
      isScotland: ['scotland', 'S'].includes(request.query.region),
      isNorthernIreland: ['northern-ireland', 'N'].includes(request.query.region),
      isChannelIslands: ['channel-islands', 'L'].includes(request.query.region),
      isIsleOfMan: ['isle-of-man', 'M'].includes(request.query.region),
      isOutsideLandBoundaries: ['outside-land-boundaries', 'J'].includes(request.query.region),
      backLinkUri
    }

    return h.view('england-only', model)
  },
  options: {
    description: 'Get the england only page',
    validate: {
      query: joi.object().keys({
        region: joi.string().allow('', 'wales', 'northern-ireland', 'scotland', 'channel-islands', 'isle-of-man', 'outside-land-boundaries'),
        premises: joi.string().allow(''),
        postcode: joi.string().allow('')
      }).required()
    }
  }
}
