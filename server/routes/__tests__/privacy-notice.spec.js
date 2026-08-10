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

describe('/Privacy notice test', () => {
  test('Assert Privacy page', async () => {
    const options = {
      method: 'GET',
      url: '/privacy-notice',
      headers: {

      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK) // 200
    expect(response.payload).toMatch(/<h1 class="govuk-heading-xl">Privacy notice<\/h1>/g)
    expect(response.payload).toMatch(/<h2 class="govuk-heading-l">Who we are<\/h2>/g)
    expect(response.payload).toMatch(/<h2 class="govuk-heading-l">What personal data we collect<\/h2>/g)
    expect(response.payload).toMatch(/<h3 class="govuk-heading-m">Cookies<\/h3>/g)
    expect(response.payload).toMatch(/<h3 class="govuk-heading-m">Friendly Captcha<\/h3>/g)
  })
})
