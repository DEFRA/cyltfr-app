const address1 = require('./data/address1.json')
const address2 = require('./data/address2.json')
const simulatedData = require('../../routes/simulated/data/address-service.json')
const STATUS_CODES = require('http2').constants

describe('Address service', () => {
  let returnValue = {}
  let config
  let util
  let addressService

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
  beforeAll(() => {
    jest.resetModules()
    jest.isolateModules(() => {
      jest.mock('../../util')
      jest.mock('../../config')
      config = require('../../config')
      util = require('../../util')

      util.getJson = jest.fn(async () => {
        return returnValue
      })
      addressService = require('../address')
    })
    setReturnValue({})
  })

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
  let config
  let addressService

  beforeAll(() => {
    jest.resetModules()
    jest.isolateModules(() => {
      jest.mock('../../util')
      jest.mock('../../config')
      config = require('../../config')
      config.setConfigOptions({ simulatedDataPath: './server/routes/simulated/data/' })
      addressService = require('../address')
    })
  })

  test('returns simulated data when file is not found', async () => {
    const inputPostcode = 'INVALID POSTCODE'
    const result = await addressService.simulatedFind(inputPostcode)
    expect(result).toEqual(simulatedData)
  })

  test('returns correct data when file is found', async () => {
    const inputPostcode = 'NP18 3EZ'
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

describe('Address service module.exports.find', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  test('find is set to simulatedFind when simulateAddressService is true', async () => {
    jest.mock('../../config', () => ({ simulateAddressService: true }))
    const updatedAddressService = require('../address')

    expect(updatedAddressService.find).toBe(updatedAddressService.simulatedFind)
  })

  test('find is not set to simulatedFind when simulateAddressService is false', async () => {
    jest.mock('../../config', () => ({ simulateAddressService: false }))
    const updatedAddressService = require('../address')

    expect(updatedAddressService.find).not.toBe(updatedAddressService.simulatedFind)
  })
})

describe('Address service handling http errors from OSApi', () => {
  let mockWreck
  let addressService
  beforeAll(() => {
    jest.resetModules()
    jest.mock('@hapi/wreck')
    jest.unmock('../../util')
    mockWreck = require('@hapi/wreck')
    mockWreck.defaults.mockImplementation(() => mockWreck)
    mockWreck.get = jest.fn().mockResolvedValue({
      payload: {
        results: address1,
        header: {
          maxresults: 100,
          totalresults: 1
        }
      },
      res: { statusCode: STATUS_CODES.HTTP_STATUS_OK }
    })
    addressService = require('../address')
  })

  test('find works with mock wreck', async () => {
    mockWreck.get.mockResolvedValueOnce({
      payload: {
        results: address1,
        header: {
          maxresults: 100,
          totalresults: 1
        }
      },
      res: { statusCode: STATUS_CODES.HTTP_STATUS_OK }
    })

    expect(async () => {
      await addressService.find('DUMMY')
    }).not.toThrow()
  })

  test('find throws an error if not HTTP_STATUS_OK', async () => {
    mockWreck.get.mockResolvedValueOnce({
      payload: {
        results: address1,
        header: {
          maxresults: 100,
          totalresults: 1
        }
      },
      res: { statusCode: STATUS_CODES.HTTP_STATUS_TOO_MANY_REQUESTS }
    })

    await expect(addressService.find('DUMMY')).rejects.toThrow()
  })

  test('find does not throw an error if HTTP_STATUS_BAD_REQUEST and not found message indicated', async () => {
    const errObj = {
      statusCode: STATUS_CODES.HTTP_STATUS_BAD_REQUEST,
      statuscode: STATUS_CODES.HTTP_STATUS_BAD_REQUEST,
      message: 'Requested postcode must contain a minimum of the sector plus 1 digit of the district'
    }
    mockWreck.get.mockResolvedValueOnce({
      payload: {
        error: errObj,
        header: {
          maxresults: 100,
          totalresults: 1
        }
      },
      res: errObj,
      data: errObj
    })

    await expect(addressService.find('DUMMY')).resolves.toHaveLength(0)
  })

  test('returns non-Json data', async () => {
    mockWreck.get.mockResolvedValueOnce('<xml><blah>This is some non-json formatted data</blah></xml>')

    await expect(addressService.find('DUMMY')).rejects.toThrow()
  })
})
