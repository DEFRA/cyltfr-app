const STATUS_CODES = require('http2').constants
const createServer = require('../../../server')
const floodService = require('../../services/flood')
const addressService = require('../../services/address')
const DEFAULT_POSTCODE = 'CV37 6YZ'
const SEARCH_REDIRECT = '/search?postcode='
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

  test('/search - Invalid postcode - fails regexp', async () => {
    const { getOptions } = mockSearchOptions('invalid', cookie)
    floodService.__updateReturnValue({})
    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_BAD_REQUEST)
  })

  test('/search - Invalid postcode - passes regexp', async () => {
    const { getOptions } = mockSearchOptions('XX11 1XX', cookie)
    floodService.__updateReturnValue({})
    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
  })

  test('/search - Address service error', async () => {
    const { getOptions } = mockSearchOptions(DEFAULT_POSTCODE, cookie)
    floodService.__updateReturnValue({})
    addressService.find.mockImplementationOnce(() => { throw new Error('An error') })
    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(getResponse.headers.location).toMatch('/postcode?error=postcode_does_not_exist')
  })

  test('/search - Address service returns empty address array', async () => {
    const { getOptions } = mockSearchOptions(DEFAULT_POSTCODE, cookie)
    floodService.__updateReturnValue({})
    addressService.find.mockImplementationOnce(() => { return Promise.resolve([]) })
    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/search - Address service returns empty address array with POST', async () => {
    const { getOptions, postOptions } = mockSearchOptions(DEFAULT_POSTCODE, cookie)
    floodService.__updateReturnValue({})
    addressService.find.mockImplementationOnce(() => { return Promise.resolve([]) })
    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    postOptions.url = getOptions.url
    postOptions.payload = 'address=-1'
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/search - Address service returns empty address array with POST and selection', async () => {
    const { getOptions, postOptions } = mockSearchOptions(DEFAULT_POSTCODE, cookie)
    floodService.__updateReturnValue({})
    addressService.find.mockImplementationOnce(() => { return Promise.resolve([]) })
    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    postOptions.url = getOptions.url
    postOptions.payload = 'address=0'
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('/search - select an address', async () => {
    const { getOptions, postOptions } = mockSearchOptions(DEFAULT_POSTCODE, cookie)
    floodService.__updateReturnValue({})
    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    postOptions.url = getOptions.url
    postOptions.payload = 'address=0'
    const postResponse = await server.inject(postOptions)
    expect(postResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(postResponse.headers.location).toMatch('/risk')
  })

  test('/search - NI address to redirect to england-only', async () => {
    const { getOptions } = mockSearchOptions('BT11BT', cookie)
    floodService.__updateReturnValue({})
    const getResponse = await server.inject(getOptions)
    expect(getResponse.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(getResponse.headers.location).toMatch('/england-only')
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
