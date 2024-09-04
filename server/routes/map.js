const config = require('../config')
const joi = require('joi')
const { ApplicationCredentialsManager } = require('@esri/arcgis-rest-request')
const osApi = require('../services/osapi')
const MapViewModel = require('../models/map-view')
const { defineBackLink } = require('../services/defineBackLink.js')

const appManager = ApplicationCredentialsManager.fromCredentials({
  clientId: config.esriClientID,
  clientSecret: config.esriClientSecret
})

module.exports = {
  method: 'GET',
  path: '/map',
  options: {
    description: 'Get the map page',
    handler: async (request, h) => {
      const { query } = request
      const { easting, northing } = query
      const address = request.yar.get('address')
      const path = request.path
      // TODO: add error checking
      const responses = await Promise.all([appManager.refreshToken(), osApi.osGetAccessToken()])
      const mapToken = responses[0]
      const osToken = responses[1]
      //
      const previousPage = request.yar.get('previousPage')
      const backLinkUri = defineBackLink(path, previousPage)

      return h.view('map', new MapViewModel(easting, northing, address, backLinkUri, mapToken, osToken.access_token, osToken.expires_in))
    },
    validate: {
      query: joi.object().keys({
        easting: joi.number(),
        northing: joi.number(),
        map: joi.string()
      }).required()
    }
  }
}
