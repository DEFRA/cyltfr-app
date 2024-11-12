const addressService = require('../address')
const util = require('../../util')
const address1 = require('./data/address1.json')
const address2 = require('./data/address2.json')
const config = require('../../config')
const simulatedData = require('../../routes/simulated/data/address-service.json')

let returnValue = {}
function setReturnValue (value) {
  returnValue = {
    header: {
      maxresults: 100,
      totalresults: value.length,
      offset: 0
    },
    results: value
  }
}

jest.mock('../../util')
jest.mock('../../config')

util.getJson = jest.fn(async () => {
  return returnValue
})

setReturnValue({})

describe('Address service', () => {
  test('capitaliseAddress function capitalises the first of each letter other than postcode which remains in capitals', async () => {
    const address = '28, NORTHFIELD CLOSE, NEWPORT, NP18 3EZ'
    expect(addressService.capitaliseAddress(address)).toEqual('28, Northfield Close, Newport, NP18 3EZ')
  })

  test('Calling find with a postcode calls the OS Api', async () => {
    setReturnValue(address1)
    await addressService.find('NP18 3EZ')
    expect(util.getJson).toHaveBeenCalled()
  })

  test('Calling find with a address1.json data returns the correct number of results', async () => {
    setReturnValue(address1)
    const result = await addressService.find('NP18 3EZ')
    expect(result.length).toEqual(2)
  })

  test('Calling find with a address2.json data returns the correct number of results', async () => {
    setReturnValue(address2)
    const result = await addressService.find('NP18 3EZ')
    const willow = result.find(item => item.uprn === '10093088549')
    const numberOne = result.find(item => item.uprn === '100050522998')
    const WILLOW_LOCATION_X = 459974.88
    expect(result.length).toEqual(2)
    expect(willow.x).toEqual(WILLOW_LOCATION_X)
    expect(willow.postcode).toEqual('DPA 4JL')
    expect(numberOne.postcode).toEqual('YO8 LPI')
  })

  test('Config file osPostcodeUrl does not have parameters in the url', async () => {
    expect(config.osPostcodeUrl).not.toMatch(/dataset=DPA/g)
    expect(config.osPostcodeUrl).not.toMatch(/postcode=/g)
  })
})

describe('simulatedFind function', () => {
  test('returns simulated data when file is not found', async () => {
    config.setConfigOptions({ simulatedDataPath: './server/routes/simulated/data/' })
    const inputPostcode = 'INVALID POSTCODE'
    const result = await addressService.simulatedFind(inputPostcode)
    expect(result).toEqual(simulatedData)
  })

  test('returns correct data when file is found', async () => {
    const inputPostcode = 'NP18 3EZ'
    config.setConfigOptions({ simulatedDataPath: './server/routes/simulated/data/' })
    const result = await addressService.simulatedFind(inputPostcode)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('uprn')
    expect(result[0]).toHaveProperty('postcode')
    expect(result[0].postcode).toEqual('NP18 3EZ')
    expect(result[0]).toHaveProperty('address')
    expect(result[0]).toHaveProperty('country_code')
    expect(result[0]).toHaveProperty('x')
    expect(result[0]).toHaveProperty('y')
  })
})
