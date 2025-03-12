const STATUS_CODES = require('http2').constants
let wreck
let util
const MOCK_URL = 'http://localhost/'

beforeAll(async () => {
  jest.resetModules()
  jest.mock('@hapi/wreck')
  wreck = require('@hapi/wreck')
  wreck.defaults.mockImplementation(() => wreck)
  util = require('../util')
})

afterAll(async () => {
  jest.unmock('@hapi/wreck')
  jest.resetModules()
})

describe('util.js tests', () => {
  test('Normal get returns the payload', async () => {
    wreck.get.mockImplementationOnce(() => {
      return Promise.resolve({
        res: { statusCode: STATUS_CODES.HTTP_STATUS_OK },
        payload: 'Payload'
      })
    })

    const response = await util.get(MOCK_URL)

    expect(response).toEqual('Payload')
  })

  test('get with anything other than 200 throws an error', async () => {
    const errorResponse = {
      res: { statusCode: STATUS_CODES.HTTP_STATUS_BAD_REQUEST },
      payload: 'Payload'
    }
    wreck.get.mockImplementationOnce(() => {
      return Promise.resolve(errorResponse)
    })
    expect.assertions(1)
    try {
      await util.get(MOCK_URL)
    } catch (error) {
      expect(error.message).toEqual('Requested resource returned a non 200 status code')
    }
  })

  test('Normal getJson returns the payload', async () => {
    wreck.get.mockImplementationOnce(() => {
      return Promise.resolve({
        res: { statusCode: STATUS_CODES.HTTP_STATUS_OK },
        payload: 'Payload'
      })
    })

    const response = await util.getJson(MOCK_URL)

    expect(response).toEqual('Payload')
  })

  test('getJson with anything other than 200 throws an error', async () => {
    const errorResponse = {
      res: { statusCode: STATUS_CODES.HTTP_STATUS_BAD_REQUEST },
      payload: 'Payload'
    }
    wreck.get.mockImplementationOnce(() => {
      return Promise.resolve(errorResponse)
    })
    expect.assertions(1)
    try {
      await util.getJson(MOCK_URL)
    } catch (error) {
      expect(error.message).toEqual('Requested resource returned a non 200 status code')
    }
  })

  test('Normal post returns the payload', async () => {
    wreck.post.mockImplementationOnce(() => {
      return Promise.resolve({
        res: { statusCode: STATUS_CODES.HTTP_STATUS_OK },
        payload: 'Payload'
      })
    })

    const response = await util.post(MOCK_URL)

    expect(response).toEqual('Payload')
  })

  test('post with anything other than 200 throws an error', async () => {
    const errorResponse = {
      res: { statusCode: STATUS_CODES.HTTP_STATUS_BAD_REQUEST },
      payload: 'Payload'
    }
    wreck.post.mockImplementationOnce(() => {
      return Promise.resolve(errorResponse)
    })
    expect.assertions(1)
    try {
      await util.post(MOCK_URL)
    } catch (error) {
      expect(error.message).toEqual('Requested resource returned a non 200 status code')
    }
  })

  test('Normal postJson returns the payload', async () => {
    wreck.post.mockImplementationOnce(() => {
      return Promise.resolve({
        res: { statusCode: STATUS_CODES.HTTP_STATUS_OK },
        payload: 'Payload'
      })
    })

    const response = await util.postJson(MOCK_URL)

    expect(response).toEqual('Payload')
  })

  test('postJson with anything other than 200 throws an error', async () => {
    const errorResponse = {
      res: { statusCode: STATUS_CODES.HTTP_STATUS_BAD_REQUEST },
      payload: 'Payload'
    }
    wreck.post.mockImplementationOnce(() => {
      return Promise.resolve(errorResponse)
    })
    expect.assertions(1)
    try {
      await util.postJson(MOCK_URL)
    } catch (error) {
      expect(error.message).toEqual('Requested resource returned a non 200 status code')
    }
  })

  test('get includes User-Agent header in the request', async () => {
    const url = MOCK_URL
    const options = {}
    const response = { res: { statusCode: STATUS_CODES.HTTP_STATUS_OK }, payload: 'response' }

    wreck.get.mockResolvedValue(response)

    await util.get(url, options)

    expect(wreck.get).toHaveBeenCalledWith(url, expect.objectContaining({
      headers: expect.objectContaining({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      })
    }))
  })

  test('post includes User-Agent header in the request', async () => {
    const url = MOCK_URL
    const options = {}
    const response = { res: { statusCode: STATUS_CODES.HTTP_STATUS_OK }, payload: 'response' }

    wreck.post.mockResolvedValue(response)

    await util.post(url, options)

    expect(wreck.post).toHaveBeenCalledWith(url, expect.objectContaining({
      headers: expect.objectContaining({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      })
    }))
  })
})
