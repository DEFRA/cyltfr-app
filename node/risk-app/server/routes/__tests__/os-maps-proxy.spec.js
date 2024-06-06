const STATUS_CODES = require('http2').constants
const createServer = require('../../../server')
const util = require('../../util')
let server
const options = {
  method: 'GET',
  url: '/os-maps-proxy?layer=Road_27700&style=default&tilematrixset=EPSG%3A27700&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix=EPSG%3A27700%3A8&TileCol=636&TileRow=1374'
}

jest.mock('../../util')
jest.mock('../../config')

beforeAll(async () => {
  server = await createServer()
  await server.initialize()
})

afterAll(async () => {
  await server.stop()
})

describe('/os-maps-proxy test', () => {
  test('/os-maps-proxy standard call', async () => {
    util.get.mockResolvedValue('Response')
    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK) // 200
  })

  test('/os-maps-proxy error call', async () => {
    const oldNotify = server.methods.notify
    let notifyCalled = false
    const newNotify = () => { notifyCalled = true }
    server.methods.notify = newNotify
    util.get.mockImplementation(() => {
      const fakeResponse = { FakeResponse: true }
      throw new Error('Error during call', fakeResponse)
    })
    const response = await server.inject(options)
    server.methods.notify = oldNotify
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_BAD_REQUEST) // 400
    expect(notifyCalled).toEqual(true)
  })

  test('/os-maps-proxy error call no notify', async () => {
    const oldNotify = server.methods.notify
    server.methods.notify = null
    util.get.mockImplementation(() => {
      const fakeResponse = { FakeResponse: true }
      throw new Error('Error during call', fakeResponse)
    })
    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_BAD_REQUEST) // 400
    server.methods.notify = oldNotify
  })
})
