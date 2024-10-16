const { HttpsProxyAgent } = require('https-proxy-agent')
const { performance } = require('node:perf_hooks')

const config = require('./config')
const wreck = require('@hapi/wreck').defaults({
  timeout: config.httpTimeoutMs
})
let wreckExt

if (config.http_proxy) {
  wreckExt = require('@hapi/wreck').defaults({
    timeout: config.httpTimeoutMs,
    agent: new HttpsProxyAgent(config.http_proxy)
  })
}
function get (url, options, ext = false) {
  const thisWreck = (ext && wreckExt) ? wreckExt : wreck
  const startTick = performance.now()
  return thisWreck.get(url, options)
    .then(response => {
      console.log('Response received from url in %d ms : %s', performance.now() - startTick, url)
      if (response.res.statusCode !== 200) {
        throw new Error('Requested resource returned a non 200 status code', response)
      }
      return response.payload
    })
    .catch(error => {
      console.log('Error received from url in %d ms : %s', performance.now() - startTick, url)
      console.log(error)
      throw error
    })
}

function post (url, options, ext = false) {
  const thisWreck = (ext && wreckExt) ? wreckExt : wreck
  const startTick = performance.now()
  return thisWreck.post(url, options)
    .then(response => {
      console.log('Response received from url in %d ms : %s', performance.now() - startTick, url)
      if (response.res.statusCode !== 200) {
        throw new Error('Requested resource returned a non 200 status code', response)
      }
      return response.payload
    })
    .catch(error => {
      console.log('Error received from url in %d ms : %s', performance.now() - startTick, url)
      console.log(error)
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
