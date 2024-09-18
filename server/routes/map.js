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
      let view = 'map'
      const { query } = request
      const { easting, northing } = query
      const address = request.yar.get('address')
      const path = request.path
      const mapUrl = new URL(config.osMapsUrl)
      const responses = await Promise.all([appManager.refreshToken(), osApi.osGetAccessToken()])
      const HOUR = 60 * 60 * 1000
      const mapTokenExpiry = Date.now() + (HOUR * 2)
      request.yar.set('mapTokenExpiry', mapTokenExpiry)
      const mapConfig = {
        mapToken: responses[0],
        osToken: responses[1].access_token,
        osTokenExpiry: responses[1].expires_in,
        osMapUrl: config.osMapsUrl,
        osMapHost: `${mapUrl.protocol}//${mapUrl.host}/`
      }
      //
      const previousPage = request.yar.get('previousPage')
      const backLinkUri = defineBackLink(path, previousPage)

      if (query.map === 'SurfaceWater') {
        view = 'map-surface-water'
      }

      return h.view(view, new MapViewModel(easting, northing, address, backLinkUri, mapConfig))
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
