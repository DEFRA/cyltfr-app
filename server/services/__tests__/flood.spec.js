const config = require('../../config')
const util = require('../../util')

jest.mock('../../util', () => ({
  getJson: jest.fn()
}))

jest.mock('../../routes/simulated/data/warnings-service.json', () => ({
  address: '',
  floods: [],
  severity: 5,
  message: 'There are currently no flood warnings or alerts in force at this location.'
}))

describe('flood service', () => {
  test('should export the real findWarnings function when simulateAddressService is false', async () => {
    config.simulateAddressService = false
    config.floodWarningsUrl = 'https://example.com'

    const mockWarningData = {
      address: '',
      floods: [],
      severity: 5,
      message: 'There are currently no flood warnings or alerts in force at this location.'
    }
    util.getJson.mockResolvedValue(mockWarningData)

    const flood = require('../flood')
    const location = 'TestLocation'
    const result = await flood.findWarnings(location)

    expect(util.getJson).toHaveBeenCalledWith('https://example.com/api/warnings?location=TestLocation', true)
    expect(result).toEqual(mockWarningData)
  })

  test('should export the simulateFindWarnings function when simulateAddressService is true', async () => {
    config.simulateAddressService = true

    const flood = require('../flood')
    const location = 'TestLocation'
    const result = await flood.findWarnings(location)

    expect(result).toEqual({
      address: '',
      floods: [],
      severity: 5,
      message: 'There are currently no flood warnings or alerts in force at this location.'
    })
  })
})
