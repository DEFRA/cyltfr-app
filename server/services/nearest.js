const util = require('../util')
const config = require('../config')
const { osSearchKey } = config

// https://labs.os.uk/public/os-data-hub-examples/os-places-api/geosearch-example-nearest#openlayers
// https://api.os.uk/search/places/v1

const osNearestUrl = 'https://api.os.uk/search/places/v1/nearest?'

async function findNearest (easting, northing) {
  const uri = `${osNearestUrl}point=${easting},${northing}&srs=BNG&key=${osSearchKey}&dataset=DPA`
  const payload = await util.getJson(uri, true)

  if (!payload.results || payload.results.length === 0) {
    return null
  }

  const result = payload.results[0].DPA || payload.results[0].LPI
  return {
    postcode: result.POSTCODE || result.POSTCODE_LOCATOR || null,
    street: result.THOROUGHFARE_NAME || result.STREET_DESCRIPTION || null,
    address: result.ADDRESS || null
  }
}

module.exports = { findNearest }
