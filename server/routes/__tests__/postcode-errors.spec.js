const STATUS_CODES = require('http2').constants
const { mockOptions, mockSearchOptions } = require('../../../test/mock')
const ENGLAND_ONLY_URL = '/england-only'
const mockResults = {
  BT387BG: require('../../services/__tests__/data/BT387BG.json'),
  DN75BN: require('../../services/__tests__/data/DN75BN.json'),
  G38AG: require('../../services/__tests__/data/G38AG.json'),
  NP183EZ: require('../../services/__tests__/data/NP183EZ.json')
}

let server, cookie

// Mock dependencies
jest.mock('@airbrake/node')
jest.mock('../../config')
jest.mock('../../services/flood')
jest.mock('../../services/captchacheck')
jest.mock('../../util')

function setupMockUtil (results, statuscode, error) {
  const util = require('../../util')
  if (results) {
    util.getJson.mockResolvedValue({
      results,
      header: {
        maxresults: 100,
        totalresults: 1
      }
    })
  } else {
    util.getJson.mockRejectedValue(error)
  }
}

beforeAll(async () => {
  const createServer = require('../../../server')

  server = await createServer()
  await server.initialize()
  const initial = mockOptions()
  const captchaCheck = require('../../services/captchacheck')
  const floodService = require('../../services/flood')
  floodService.__updateReturnValue({})
  captchaCheck.captchaCheck.mockResolvedValue({ tokenValid: true })

  const homepageresponse = await server.inject(initial)
  expect(homepageresponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  cookie = homepageresponse.headers['set-cookie'][0].split(';')[0]
})

afterAll(async () => {
  await server.stop()
})

describe('OSApi calls', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test.each([
    { postcode: 'BT38 7BG', description: 'Northern Ireland', match: 'region=northern-ireland' },
    { postcode: 'DN7 5BN', description: 'England', match: '' },
    { postcode: 'G3 8AG', description: 'Scotland', match: 'region=scotland' },
    { postcode: 'NP18 3EZ', description: 'Wales', match: 'region=wales' }
  ])('should return an error view when $description', async ({ postcode, match }) => {
    const { postOptions } = mockSearchOptions(postcode, cookie)
    setupMockUtil(mockResults[postcode.replace(' ', '')], STATUS_CODES.HTTP_STATUS_OK)
    const response = await server.inject(postOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    if (match) {
      expect(response.headers.location).toMatch(ENGLAND_ONLY_URL)
      expect(response.headers.location).toMatch(match)
    }
  })

  test.each([
    { postcode: 'BT38 7BG', description: 'Northern Ireland' },
    { postcode: 'DN7 5BN', description: 'England' },
    { postcode: 'G3 8AG', description: 'Scotland' },
    { postcode: 'NP18 3EZ', description: 'Wales' }
  ])('OSApi throws an error when searching $description', async ({ postcode }) => {
    const { postOptions } = mockSearchOptions(postcode, cookie)
    server.methods.notify = jest.fn()
    setupMockUtil(null, null, new Error('Error in OSApi call'))
    const response = await server.inject(postOptions)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(server.methods.notify).toHaveBeenCalledWith('OSApi postcode search raised an error: undefined', expect.any(Object))
  })
})
