const config = require('../config')
const joi = require('joi')
const { ApplicationCredentialsManager } = require('@esri/arcgis-rest-request')
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
      const mapToken = await appManager.refreshToken()
      const previousPage = request.yar.get('previousPage')
      const backLinkUri = defineBackLink(path, previousPage)

      return h.view('map', new MapViewModel(easting, northing, address, backLinkUri, mapToken))
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
