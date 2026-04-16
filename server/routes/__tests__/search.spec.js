const STATUS_CODES = require('http2').constants
const createServer = require('../../../server')
const floodService = require('../../services/flood')
const DEFAULT_POSTCODE = 'CV376YZ'
const SEARCH_REDIRECT = '/search#'
const { mockOptions, mockSearchOptions } = require('../../../test/mock')
let server, cookie

jest.mock('../../config')
jest.mock('../../services/flood')
jest.mock('../../services/address')
jest.mock('../../services/risk')

beforeAll(async () => {
  server = await createServer()
  await server.initialize()
  const initial = mockOptions()

  const homepageresponse = await server.inject(initial)
  expect(homepageresponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  cookie = homepageresponse.headers['set-cookie'][0].split(';')[0]
})

afterAll(async () => {
  await server.stop()
})

describe('search page route', () => {
  test('/address - No banner warnings', async () => {
    const { getOptions, postOptions } = mockSearchOptions(DEFAULT_POSTCODE, cookie)
    const noFloodWarning = { }
    floodService.__updateReturnValue(noFloodWarning)
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(postResponse.headers.location).toMatch(SEARCH_REDIRECT)

    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(getResponse.payload).not.toMatch(/Warning<\/span>/g)
  })

  test('/address - flood warnings for unknown address', async () => {
    const { getOptions, postOptions } = mockSearchOptions(DEFAULT_POSTCODE, cookie)
    const noFloodWarning = floodService.__updateReturnValue({
      address: 'England',
      floods: [],
      severity: 2,
      message: 'There are currently one flood warning and 2 flood alerts in force at this location.'
    })
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(postResponse.headers.location).toMatch(SEARCH_REDIRECT)

    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    const warningMessageReg = new RegExp(noFloodWarning.message, 'g')
    expect(getResponse.payload).not.toMatch(warningMessageReg)
  })

  test('/search - No warning banner severity', async () => {
    const { getOptions, postOptions } = mockSearchOptions(DEFAULT_POSTCODE, cookie)
    const noFloodWarning = floodService.__updateReturnValue({
      address: 'Bognor Regis, PO22 9HY',
      floods: [],
      severity: 5,
      message: 'There are currently one flood warning and 2 flood alerts in force at this location.'
    })
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(postResponse.headers.location).toMatch(SEARCH_REDIRECT)

    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    const warningMessageReg = new RegExp(noFloodWarning.message, 'g')
    expect(getResponse.payload).not.toMatch(warningMessageReg)
  })

  test('/search - With banner warnings', async () => {
    const { getOptions, postOptions } = mockSearchOptions(DEFAULT_POSTCODE, cookie)
    const data = require('./data/banner-1.json')
    floodService.__updateReturnValue(data)
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(postResponse.headers.location).toMatch(SEARCH_REDIRECT)

    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    const warningMessageReg = new RegExp(data.message, 'g')
    expect(getResponse.payload).toMatch(warningMessageReg)
  })

  test('/search - Error', async () => {
    const { getOptions, postOptions } = mockSearchOptions(DEFAULT_POSTCODE, cookie)
    floodService.findWarnings.mockImplementationOnce(() => { throw new Error('An error') })
    const oldNotify = server.methods.notify
    let notifyCalled = false
    const newNotify = () => { notifyCalled = true }
    server.methods.notify = newNotify
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(postResponse.headers.location).toMatch(SEARCH_REDIRECT)

    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(notifyCalled).toBeTruthy()
    server.methods.notify = oldNotify
  })

  test('/search', async () => {
    const { getOptions, postOptions } = mockSearchOptions(DEFAULT_POSTCODE, cookie)
    floodService.__updateReturnValue({})
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(postResponse.headers.location).toMatch(SEARCH_REDIRECT)

    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/search - Stored postcode', async () => {
    const { getOptions, postOptions } = mockSearchOptions(DEFAULT_POSTCODE, cookie)
    floodService.__updateReturnValue({})
    const postResponse = await server.inject(postOptions)
    // "/search?postcode=CV376YZ#"
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(postResponse.headers.location).toMatch(SEARCH_REDIRECT)
    getOptions.url = '/search'
    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/search - No postcode', async () => {
    const { getOptions } = mockSearchOptions('invalid')
    getOptions.url = '/search'
    floodService.__updateReturnValue({})
    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
  })

  test('/search - Postcode selection out of range', async () => {
    const { getOptions, postOptions } = mockSearchOptions(DEFAULT_POSTCODE, cookie)
    floodService.__updateReturnValue({})
    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)

    postOptions.url = getOptions.url
    postOptions.payload = 'address=99&aboutThisAddress=lives-here'
    const tab2SelectResponse = await server.inject(postOptions)
    expect(tab2SelectResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(tab2SelectResponse.headers.location).toMatch('/postcode#')
  })

  test('/search - Multi-tab: stale address index after session overwritten by second tab', async () => {
    const tab1Postcode = 'W6 0WU'
    const { getOptions: tab1GetOptions, postOptions: tab1PostOptions } = mockSearchOptions(tab1Postcode, cookie)
    floodService.__updateReturnValue({})

    // Tab 1: search W6 0WU (8 addresses, valid indices 0-7)
    const tab1PostResponse = await server.inject(tab1PostOptions)
    expect(tab1PostResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(tab1PostResponse.headers.location).toMatch(SEARCH_REDIRECT)
    const tab1GetResponse = await server.inject(tab1GetOptions)
    expect(tab1GetResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)

    // Tab 2: search a different postcode — overwrites session addresses with BS20 6AQ (2 addresses)
    const tab2Postcode = 'BS20 6AQ'
    const { postOptions: tab2PostOptions } = mockSearchOptions(tab2Postcode, cookie)
    floodService.__updateReturnValue({})
    const tab2PostResponse = await server.inject(tab2PostOptions)
    expect(tab2PostResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(tab2PostResponse.headers.location).toMatch(SEARCH_REDIRECT)

    // Tab 1: selects address=7 — now out of range since session holds BS20 6AQ's 2 addresses
    tab1PostOptions.url = tab1GetOptions.url
    tab1PostOptions.payload = 'address=7&aboutThisAddress=lives-here'
    const tab1SelectResponse = await server.inject(tab1PostOptions)
    expect(tab1SelectResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(tab1SelectResponse.headers.location).toMatch('/postcode#')
  })

  test('/search - select an address', async () => {
    const { getOptions, postOptions } = mockSearchOptions(DEFAULT_POSTCODE, cookie)
    floodService.__updateReturnValue({})
    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    postOptions.url = getOptions.url
    postOptions.payload = 'address=0&aboutThisAddress=lives-here'
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(postResponse.headers.location).toMatch('/risk')
  })

  test('/search - no address selected', async () => {
    const { getOptions, postOptions } = mockSearchOptions(DEFAULT_POSTCODE, cookie)
    floodService.__updateReturnValue({})
    const postcodeResponse = await server.inject(postOptions)
    expect(postcodeResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    postOptions.url = getOptions.url
    postOptions.payload = 'address=-1&aboutThisAddress=lives-here'
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(postResponse.payload).toMatch('Select an address')
  })

  test('/search - no search reason selected', async () => {
    const { getOptions, postOptions } = mockSearchOptions(DEFAULT_POSTCODE, cookie)
    floodService.__updateReturnValue({})
    const postcodeResponse = await server.inject(postOptions)
    expect(postcodeResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    postOptions.url = getOptions.url
    postOptions.payload = 'address=0'
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(postResponse.payload).toMatch('Select an option for this address')
  })

  test('/search - no address and no search reason selected', async () => {
    const { getOptions, postOptions } = mockSearchOptions(DEFAULT_POSTCODE, cookie)
    floodService.__updateReturnValue({})
    const postcodeResponse = await server.inject(postOptions)
    expect(postcodeResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    postOptions.url = getOptions.url
    postOptions.payload = 'address=-1'
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(postResponse.payload).toMatch('Select an address')
    expect(postResponse.payload).toMatch('Select an option for this address')
  })

  test('/search - NI address to redirect to england-only', async () => {
    const { postOptions } = mockSearchOptions('BT84AA', cookie)
    floodService.__updateReturnValue({})
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(postResponse.headers.location).toMatch('/england-only?postcode=BT84AA&region=northern-ireland')
  })

  test('Accept & strip unknown query parameters', async () => {
    const options = {
      method: 'POST',
      url: '/postcode',
      headers: {
        cookie
      },
      payload: { postcode: DEFAULT_POSTCODE, a: 'b' }
    }
    floodService.__updateReturnValue({})
    const getResponse = await server.inject(options)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
  })
})
