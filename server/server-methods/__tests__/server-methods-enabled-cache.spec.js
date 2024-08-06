const STATUS_CODES = require('http2').constants
const createServer = require('../..')
const addressService = require('../../services/address')
const riskService = require('../../services/risk')
const floodService = require('../../services/flood')
const mockConfig = require('../../__mocks__/config')
const { mockOptions, mockSearchOptions } = require('../../../test/mock')
const defaultOptions = {
  method: 'GET',
  url: '/risk'
}

const x = 40.7128
const y = -74.0060
const radius = 15
const location = 'WA4 1AB'

jest.mock('../../services/flood')
jest.mock('../../services/address')
jest.mock('../../services/risk')
jest.mock('../../config')

mockConfig.setConfigOptions({ cacheEnabled: true })

describe('server methods', () => {
  let server, cookie

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
    const initial = mockOptions()

    const homepageresponse = await server.inject(initial)
    expect(homepageresponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    cookie = homepageresponse.headers['set-cookie'][0].split(';')[0]
  })

  beforeEach(async () => {
    riskService.__resetReturnValue()
    const { getOptions, postOptions } = mockSearchOptions('NP18 3EZ', cookie)
    let postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(postResponse.headers.location).toMatch(`/search?postcode=${encodeURIComponent('NP18 3EZ')}`)

    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    postOptions.url = `/search?postcode=${encodeURIComponent('NP18 3EZ')}`
    postOptions.payload = 'address=0'

    postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(postResponse.headers.location).toMatch('/risk')
    defaultOptions.headers = { cookie }
  })

  afterAll(async () => {
    await server.stop()
  })

  describe('cache enabled', () => {
    it('should return initial cached address', async () => {
      const response = await server.methods.find('CV37 6YZ')
      expect(response).toEqual([
        expect.objectContaining({
          uprn: '100070216073',
          postcode: 'CV37 6YZ',
          address: '11, BANCROFT PLACE, STRATFORD-UPON-AVON, CV37 6YZ',
          country: 'ENGLAND'
        })
      ])

      addressService.updateAddress('CV37 6YZ', [
        {
          uprn: '100070216073',
          postcode: 'CV37 6YZ',
          address: '12, BANCROFT PLACE, STRATFORD-UPON-AVON, CV37 6YZ',
          country: 'ENGLAND'
        }
      ])

      const changedResponse = await server.methods.find('CV37 6YZ')

      expect(changedResponse).toEqual([
        expect.objectContaining({
          uprn: '100070216073',
          postcode: 'CV37 6YZ',
          address: '11, BANCROFT PLACE, STRATFORD-UPON-AVON, CV37 6YZ',
          country: 'ENGLAND'
        })
      ])
    })

    it('should return original cached risk details', async () => {
      const response = await server.methods.riskService(x, y, radius)

      expect(response).toEqual(
        expect.objectContaining({
          extraInfo: null,
          floodAlertArea: [],
          floodWarningArea: [],
          inEngland: true,
          inFloodWarningArea: false,
          isGroundwaterArea: false,
          leadLocalFloodAuthority: 'Cheshire West and Chester',
          reservoirRisk: null,
          riverAndSeaRisk: null,
          surfaceWaterRisk: 'Very Low'
        })
      )

      riskService.__updateReturnValue({ leadLocalFloodAuthority: 'Wessex' })

      const changedResponse = await server.methods.riskService(x, y, radius)

      expect(changedResponse).toEqual(
        expect.objectContaining({
          extraInfo: null,
          floodAlertArea: [],
          floodWarningArea: [],
          inEngland: true,
          inFloodWarningArea: false,
          isGroundwaterArea: false,
          leadLocalFloodAuthority: 'Cheshire West and Chester',
          reservoirRisk: null,
          riverAndSeaRisk: null,
          surfaceWaterRisk: 'Very Low'
        })
      )
    })

    it('should return original cached flood service warnings', async () => {
      // Setting initial values
      floodService.__updateReturnValue({
        address: '',
        floods: [],
        severity: 5,
        message: 'There are currently no flood warnings or alerts in force at this location.'
      })
      const response = await server.methods.floodService(location)

      expect(response).toEqual(
        expect.objectContaining({
          address: '',
          floods: [],
          severity: 5,
          message: 'There are currently no flood warnings or alerts in force at this location.'
        })
      )
      floodService.__updateReturnValue({
        address: '',
        floods: [],
        severity: 4,
        message: 'There are currently no flood warnings or alerts in force at this location.'
      })

      const changedResponse = await server.methods.floodService(location)

      expect(changedResponse).toEqual(
        expect.objectContaining({
          address: '',
          floods: [],
          severity: 5,
          message: 'There are currently no flood warnings or alerts in force at this location.'
        })
      )
    })
  })
})
