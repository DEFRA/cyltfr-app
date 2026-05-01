const util = require('../util')
const config = require('../config')
const { osPostcodeUrl, osSearchKey } = config
const fs = require('fs/promises')
const path = require('path')

async function simulatedFind (inputPostcode) {
  const simulatedData = require('../routes/simulated/data/address-service.json')
  let output
  try {
    const postcode = inputPostcode.toUpperCase()
    const part1 = postcode.split(' ')[0]
    const filename = path.join(config.simulatedDataPath, part1, postcode + '.json')
    const filedata = JSON.parse(await fs.readFile(filename))
    output = filedata.results.map(item => item.DPA ? item.DPA : item.LPI).map(item => {
      return {
        uprn: item.UPRN,
        postcode: item.POSTCODE ? item.POSTCODE : item.POSTCODE_LOCATOR,
        address: item.ADDRESS,
        country_code: item.COUNTRY_CODE,
        x: item.X_COORDINATE,
        y: item.Y_COORDINATE
      }
    })
  } catch {
    output = simulatedData
  }

  return output
}

async function callOsApi (postcode, offset = 0) {
  const uri = `${osPostcodeUrl}lr=EN&fq=logical_status_code:1 logical_status_code:6&postcode=${postcode}&key=${osSearchKey}&dataset=DPA&offset=${offset}&maxresults=100`
  const payload = await util.getJson(uri, true)

  return payload
}

function processPayload (results, payload) {
  const allItems = payload.results?.map(item => item.DPA ? item.DPA : item.LPI).filter(item => item.POSTAL_ADDRESS_CODE !== 'N') || []
  allItems.forEach((item) => {
    if (!(results.find(result => result.UPRN === item.UPRN))) {
      results.push(item)
    }
  })
}

function checkIfErrorIsActuallyNoResults (error) {
  let retVal = false
  if ((error.data.payload.error.statuscode === 400) && (error.data.payload.error.message.includes('Requested postcode must contain a minimum of the sector plus 1 digit of the district'))) {
    retVal = true
  }
  return retVal
}

async function find (postcode) {
  const results = []
  let offset = 0
  let maxresults = 0
  let totalresults = 1

  while (totalresults > (maxresults + offset)) {
    offset += maxresults
    try {
      const payload = await callOsApi(postcode, offset)
      processPayload(results, payload)
      maxresults = payload.header.maxresults
      totalresults = payload.header.totalresults
    } catch (error) {
      if (checkIfErrorIsActuallyNoResults(error)) {
        processPayload(results, {})
        maxresults = 0
        totalresults = 0
      } else {
        throw error
      }
    }
  }

  return results
    .map(item => {
      return {
        uprn: item.UPRN,
        postcode: item.POSTCODE ? item.POSTCODE : item.POSTCODE_LOCATOR,
        address: item.ADDRESS,
        country_code: item.COUNTRY_CODE,
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
  simulatedFind,
  capitaliseAddress
}

if (config.simulateAddressService) {
  module.exports.find = simulatedFind
}
