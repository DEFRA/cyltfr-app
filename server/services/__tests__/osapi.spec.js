const osapi = require('../osapi')
const fetch = require('node-fetch')

jest.mock('node-fetch')

describe('OSApi service', () => {
  test('Calls and gets a token', async () => {
    fetch.setFetchData({ access_token: 'testdata' })
    const result = await osapi.osGetAccessToken()

    expect(result).toEqual(expect.objectContaining({
      access_token: 'testdata'
    }))
  })
})
