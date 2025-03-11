const { HttpsProxyAgent } = require('https-proxy-agent')
const STATUS_CODES = require('http2').constants
const FETCH_ERROR_MSG = 'Requested resource returned a non 200 status code'

const config = require('./config')
const wreck = require('@hapi/wreck').defaults({
  // timeout: config.httpTimeoutMs
})
let wreckExt

if (config.http_proxy) {
  wreckExt = require('@hapi/wreck').defaults({
    timeout: config.httpTimeoutMs,
    agent: new HttpsProxyAgent(config.http_proxy)
  })
}

const { performance } = require('node:perf_hooks')
const get = (url, options = {}, ext = false) => {
  const thisWreck = (ext && wreckExt) ? wreckExt : wreck
  const startTick = performance.now()
  // Header with UA added for AWS WAF as it is required
  options.headers = {
    ...options.headers,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
  }

  return thisWreck.get(url, options)
    .then(response => {
      if (config.performanceLogging) {
        console.log('Response received from url in %d ms : %s', performance.now() - startTick, url)
      }
      if (response.res.statusCode !== STATUS_CODES.HTTP_STATUS_OK) {
        throw new Error(FETCH_ERROR_MSG, response)
      }
      return response.payload
    })
    .catch(error => {
      if (config.performanceLogging) {
        console.log('Error received from url in %d ms : %s', performance.now() - startTick, url)
        console.log(error)
      }
      throw error
    })
}

const post = (url, options = {}, ext = false) => {
  const thisWreck = (ext && wreckExt) ? wreckExt : wreck
  const startTick = performance.now()
  // Header with UA added for AWS WAF as it is required
  options.headers = {
    ...options.headers,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
  }

  return thisWreck.post(url, options)
    .then(response => {
      if (config.performanceLogging) {
        console.log('Response received from url in %d ms : %s', performance.now() - startTick, url)
      }
      if (response.res.statusCode !== STATUS_CODES.HTTP_STATUS_OK) {
        throw new Error(FETCH_ERROR_MSG, response)
      }
      return response.payload
    })
    .catch(error => {
      if (config.performanceLogging) {
        console.log('Error received from url in %d ms : %s', performance.now() - startTick, url)
        console.log(error)
      }
      throw error
    })
}

function getJson (url, ext = false) {
  return get(url, { json: true }, ext)
}

function postJson (url, ext = false) {
  return post(url, { json: true }, ext)
}

module.exports = {
  get,
  getJson,
  post,
  postJson
}
