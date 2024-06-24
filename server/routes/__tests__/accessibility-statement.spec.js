const STATUS_CODES = require('http2').constants
const createServer = require('../../../server')
let server

beforeAll(async () => {
  server = await createServer()
  await server.initialize()
})

afterAll(async () => {
  await server.stop()
})

describe('/Accessibility statement test', () => {
  test('Assert Accessibility statement page', async () => {
    const options = {
      method: 'GET',
      url: '/accessibility-statement',
      headers: {

      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK) // 200
    expect(response.payload).toMatch(/<p class="govuk-body">\n\s\s\s\s\s\s\s\sThe website has the following content which is out of scope of the accessibility regulations:\n\s\s\s\s\s\s<\/p>\n\s\s\s\s\s\s<ul class="govuk-list govuk-list--bullet">\n\s\s\s\s\s\s\s\s<li>maps<\/li>\n\s\s\s\s\s\s\s\s<li>third party content which is out of our control, for example a corporate logo on the map the website uses\n\s\s\s\s\s\s\s\s<\/li>\n\s\s\s\s\s\s\s\s<li>PDF content that was published before 23 September 2018<\/li>\n\s\s\s\s\s\s<\/ul>/g)
  })
})
