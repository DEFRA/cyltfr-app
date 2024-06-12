const { HttpsProxyAgent } = require('https-proxy-agent')

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
  return thisWreck.get(url, options)
    .then(response => {
      if (response.res.statusCode !== 200) {
        throw new Error('Requested resource returned a non 200 status code', response)
      }
      return response.payload
    })
}

function post (url, options, ext = false) {
  const thisWreck = (ext && wreckExt) ? wreckExt : wreck
  return thisWreck.post(url, options)
    .then(response => {
      if (response.res.statusCode !== 200) {
        throw new Error('Requested resource returned a non 200 status code', response)
      }
      return response.payload
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
