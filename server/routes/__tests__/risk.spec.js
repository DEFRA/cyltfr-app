const STATUS_CODES = require('http2').constants
const createServer = require('../..')
const riskService = require('../../services/risk')
const { mockOptions, mockSearchOptions } = require('../../../test/mock')
let defaultOptions = {
  method: 'GET',
  url: '/risk'
}
let server, cookie

jest.mock('../../config')
jest.mock('../../services/flood')
jest.mock('../../services/address')
jest.mock('../../services/risk')

beforeAll(async () => {
  server = await createServer()
  await server.initialize()
})

afterAll(async () => {
  await server.stop()
})

beforeEach(async () => {
  defaultOptions = {
    method: 'GET',
    url: '/risk'
  }
  const initial = mockOptions()

  const homepageresponse = await server.inject(initial)
  expect(homepageresponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  cookie = homepageresponse.headers['set-cookie'][0].split(';')[0]
  const { getOptions, postOptions } = mockSearchOptions('CV37 6YZ', cookie)
  let postResponse = await server.inject(postOptions)
  expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
  expect(postResponse.headers.location).toMatch(`/search?postcode=${encodeURIComponent('CV37 6YZ')}`)

  const getResponse = await server.inject(getOptions)
  expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  postOptions.url = `/search?postcode=${encodeURIComponent('CV37 6YZ')}`
  postOptions.payload = 'address=0'

  postResponse = await server.inject(postOptions)
  expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
  expect(postResponse.headers.location).toMatch('/risk')
  defaultOptions.headers = { cookie }
})

afterEach(async () => {
  riskService.__resetReturnValue()
})

describe('Risk page test', () => {
  test('print risk-summary page for reservoir risk and surface water', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: true,
      floodAlertArea: ['AnyArea'],
      floodWarningArea: [],
      reservoirDryRisk: [
        {
          reservoirName: 'Agden',
          location: 'SK2610092300',
          riskDesignation: 'High-risk',
          undertaker: 'Yorkshire Water Services Ltd',
          leadLocalFloodAuthority: 'Sheffield',
          comments: 'If you have questions about local emergency plans for this reservoir you should contact the named Local Authority'
        }
      ],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirWetRisk: [{
        reservoirName: 'Draycote Water',
        location: '445110, 270060',
        riskDesignation: 'High Risk',
        undertaker: 'Severn Trent Water Authority',
        leadLocalFloodAuthority: 'Warwickshire',
        environmentAgencyArea: 'Environment Agency - Staffordshire, Warwickshire and West Midlands',
        comments: 'If you have questions about local emergency plans for this reservoir you should contact the named Local Authority'
      }],
      riverAndSeaRisk: { probabilityForBand: 'Low' },
      surfaceWaterRisk: 'High',
      extraInfo: null
    })

    const response = await server.inject(defaultOptions)
    const { payload } = response
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(payload).toMatch(/There is a risk of flooding from reservoirs in this area./g)
    expect(payload).toMatch(/Flooding is possible when groundwater levels are high/g)
  })

  test('print risk-summary page for low reservoir risk and low surface water', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: false,
      floodAlertArea: ['AnyArea'],
      floodWarningArea: [],
      reservoirDryRisk: null,
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirWetRisk: null,
      riverAndSeaRisk: { probabilityForBand: 'Low' },
      surfaceWaterRisk: 'Low',
      extraInfo: null
    })

    const response = await server.inject(defaultOptions)
    const { payload } = response
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(payload).toMatch(/Flooding from reservoirs is unlikely in this area/g)
    expect(payload).toMatch(/Flooding from groundwater is unlikely in this area/g)
  })

  test('/risk - Risk service error', async () => {
    riskService.getByCoordinates.mockImplementationOnce((_x, _y, _radius) => {
      return Promise.reject(new Error('Error calling risk'))
    })

    const response = await server.inject(defaultOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_SERVICE_UNAVAILABLE)
  })

  test('/risk - riverAndSeaRisk error', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: {
        error: 'Internal Error'
      },
      surfaceWaterRisk: 'Very Low',
      extraInfo: null
    })
    const response = await server.inject(defaultOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_SERVICE_UNAVAILABLE)
  })

  test('/risk - surfaceWaterRisk error', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: null,
      surfaceWaterRisk: {
        error: 'Internal Error'
      },
      extraInfo: null
    })
    const response = await server.inject(defaultOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_SERVICE_UNAVAILABLE)
  })

  test('/risk reservoirDryRisk error', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirDryRisk: {
        error: 'Internal Error'
      },
      riverAndSeaRisk: { probabilityForBand: 'Low' },
      surfaceWaterRisk: null,
      extraInfo: null
    })
    const response = await server.inject(defaultOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_SERVICE_UNAVAILABLE)
  })

  test('/risk reservoirWetRisk error', async () => {
    riskService.__updateReturnValue({
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirWetRisk: {
        error: 'Internal Error'
      },
      riverAndSeaRisk: { probabilityForBand: 'Low' },
      surfaceWaterRisk: null,
      extraInfo: null
    })
    const response = await server.inject(defaultOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_SERVICE_UNAVAILABLE)
  })

  test('/risk leadLocalFloodAuthority error', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: {
        error: 'Internal Error'
      },
      reservoirRisk: null,
      riverAndSeaRisk: { probabilityForBand: 'Low' },
      surfaceWaterRisk: null,
      extraInfo: null
    })
    const response = await server.inject(defaultOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_SERVICE_UNAVAILABLE)
  })

  /**
   * Tests `/risk 1` to `/risk 10` exercise different
   * branches of code in the file `server/models/risk-view.js`
   */
  test('/risk 1', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: null,
      surfaceWaterRisk: 'Very Low',
      extraInfo: null
    })
    const response = await server.inject(defaultOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/risk 2', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: null,
      surfaceWaterRisk: 'Very Low',
      extraInfo: null
    })
    const response = await server.inject(defaultOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/risk 3', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: { probabilityForBand: 'Low' },
      surfaceWaterRisk: 'Very Low',
      extraInfo: null
    })
    const response = await server.inject(defaultOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/risk 4', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: null,
      surfaceWaterRisk: null,
      extraInfo: null
    })
    const response = await server.inject(defaultOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/risk 5', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: [{
        reservoirName: 'Draycote Water',
        location: '445110, 270060',
        riskDesignation: 'High Risk',
        undertaker: 'Severn Trent Water Authority',
        leadLocalFloodAuthority: 'Warwickshire',
        environmentAgencyArea: 'Environment Agency - Staffordshire, Warwickshire and West Midlands',
        comments: 'If you have questions about local emergency plans for this reservoir you should contact the named Local Authority'
      }],
      riverAndSeaRisk: null,
      surfaceWaterRisk: null,
      extraInfo: null
    })
    const response = await server.inject(defaultOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/risk 6', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: { probabilityForBand: 'High' },
      surfaceWaterRisk: 'Very Low',
      extraInfo: null
    })
    const response = await server.inject(defaultOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/risk 7', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: { probabilityForBand: 'Medium' },
      surfaceWaterRisk: 'Very Low',
      extraInfo: null
    })
    const response = await server.inject(defaultOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/risk 8', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: null,
      surfaceWaterRisk: 'High',
      extraInfo: null
    })
    const response = await server.inject(defaultOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/risk 9', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: null,
      surfaceWaterRisk: 'Medium',
      extraInfo: null
    })
    const response = await server.inject(defaultOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/risk 10', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: { probabilityForBand: 'Low' },
      surfaceWaterRisk: null,
      extraInfo: null
    })
    const response = await server.inject(defaultOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('should include text specifically for high flood risk', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: true,
      floodAlertArea: ['064FAG99SElondon'],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Croydon',
      reservoirRisk: null,
      riverAndSeaRisk: { probabilityForBand: 'Very Low' },
      surfaceWaterRisk: 'High',
      extraInfo: null
    })
    const response = await server.inject(defaultOptions)
    const { payload } = response
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(payload).toMatch(/High<span class="govuk-visually-hidden"> within a scale of very low, low, medium and high./g)
  })

  test('should include text specifically for medium flood risk', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: true,
      floodAlertArea: ['064FAG99SElondon'],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Croydon',
      reservoirRisk: null,
      riverAndSeaRisk: { probabilityForBand: 'Very Low' },
      surfaceWaterRisk: 'Medium',
      extraInfo: null
    })
    const response = await server.inject(defaultOptions)
    const { payload } = response
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(payload).toMatch(/Medium<span class="govuk-visually-hidden"> within a scale of very low, low, medium and high./g)
  })

  test('should include text specifically for low flood risk', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: true,
      floodAlertArea: ['064FAG99SElondon'],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Suffolk',
      reservoirRisk: null,
      riverAndSeaRisk: { probabilityForBand: 'Very Low' },
      surfaceWaterRisk: 'Low',
      extraInfo: null
    })
    const response = await server.inject(defaultOptions)
    const { payload } = response
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    console.log(payload)
    expect(payload).toMatch(/Low<span class="govuk-visually-hidden"> within a scale of very low, low, medium and high./g)
  })

  test('should include text specifically for very low flood risk', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: true,
      floodAlertArea: ['064FAG99SElondon'],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Hertfordshire',
      reservoirRisk: null,
      riverAndSeaRisk: { probabilityForBand: 'Low' },
      surfaceWaterRisk: 'Very Low',
      extraInfo: null
    })
    const response = await server.inject(defaultOptions)
    const { payload } = response
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(payload).toMatch(/Very low<span class="govuk-visually-hidden"> within a scale of very low, low, medium and high./g)
  })

  test('/risk with holding comments', async () => {
    riskService.__updateReturnValue({
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Bath and North East Somerset',
      reservoirDryRisk: null,
      reservoirWetRisk: null,
      riverAndSeaRisk: null,
      surfaceWaterRisk: 'High',
      extraInfo: [{
        info: '',
        apply: 'holding',
        riskoverride: 'High'
      },
      {
        info: '',
        apply: 'holding',
        riskoverride: 'Do not override'
      },
      {
        info: 'There are improvements to the flood defences in this area, we expect the flood liklihood in this area to change on 1 April 2020',
        apply: 'holding',
        riskoverride: 'Do not override'
      },
      {
        info: 'Some improvements to the flood defences in this area, we expect the flood liklihood in this area to change on 1 April 2020',
        apply: 'holding',
        riskoverride: 'Do not override'
      },
      {
        info: 'Proposed schemes',
        apply: 'llfa',
        riskoverride: null
      },
      {
        info: 'Flood action plan',
        apply: 'llfa',
        riskoverride: null
      }]
    })
    const response = await server.inject(defaultOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('risk address not in england', async () => {
    const initial = mockOptions()

    const homepageresponse = await server.inject(initial)
    expect(homepageresponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    const cookie = homepageresponse.headers['set-cookie'][0].split(';')[0]

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
    expect(postResponse.headers.location).toMatch('/england-only')
    defaultOptions.headers = { cookie }

    const response = await server.inject(defaultOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(response.headers.location).toMatch('/england-only')
  })
})
