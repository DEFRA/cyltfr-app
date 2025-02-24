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
      const browserInfo = request.headers['user-agent']
      const unsupportedBrowsers = ['MSIE', 'Trident', 'iOS']

      if (unsupportedBrowsers.some(browser => browserInfo.includes(browser))) {
        return h.view('unsupported-browser')
      }
      const { query } = request
      const { easting, northing } = query
      const address = request.yar.get('address')
      const path = request.path
      const mapUrl = new URL(config.osMapsUrl)
      const responses = await Promise.all([appManager.refreshToken(), osApi.osGetAccessToken()])
      const mapTokenExpiryTime = config.osTokenExpiryTime
      const mapTokenExpiry = Date.now() + mapTokenExpiryTime
      request.yar.set('mapTokenExpiry', mapTokenExpiry)
      const mapConfig = {
        mapToken: responses[0],
        osToken: responses[1].access_token,
        osTokenExpiry: responses[1].expires_in,
        osMapUrl: config.osMapsUrl,
        mapTransparency: config.mapTransparency,
        osMapHost: `${mapUrl.protocol}//${mapUrl.host}/`
      }
      //
      const previousPage = request.yar.get('previousPage')
      const backLinkUri = defineBackLink(path, previousPage)

      if (query.map === 'SurfaceWater') {
        view = 'map-surface-water'
      }
      if (query.map === 'RiversOrSea') {
        view = 'map-rivers-and-sea'
      }
      if (query.map === 'Reservoirs') {
        view = 'map-reservoirs'
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
