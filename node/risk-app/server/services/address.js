const util = require('../util')
const config = require('../config')
const { osPostcodeUrl, osSearchKey } = config

async function simulatedFind (_postcode) {
  const simulatedData = require('../routes/simulated/data/address-service.json')

  return simulatedData
}

async function find (postcode) {
  const uri = `${osPostcodeUrl}${postcode}&key=${osSearchKey}`
  const payload = await util.getJson(uri, true)

  if (!payload || !payload.results || !payload.results.length) {
    return []
  }

  const results = payload.results.map(item => item.DPA)

  return results
    .map(item => {
      return {
        uprn: item.UPRN,
        postcode: item.POSTCODE,
        address: item.ADDRESS,
        x: item.X_COORDINATE,
        y: item.Y_COORDINATE
      }
    })
}

function capitaliseAddress (address) {
  // Split the address into its components
  const components = address.split(', ')

  // Capitalise the first letter of each word except the last component (postcode)
  for (let i = 0; i < components.length - 1; i++) {
    const words = components[i].split(' ')
    for (let j = 0; j < words.length; j++) {
      words[j] = words[j].charAt(0).toUpperCase() + words[j].slice(1).toLowerCase()
    }
    components[i] = words.join(' ')
  }

  // Join the components back together
  const capitalisedAddress = components.join(', ')

  return capitalisedAddress
}

module.exports = {
  find,
  capitaliseAddress
}

if (config.simulateAddressService) {
  module.exports.find = simulatedFind
}
