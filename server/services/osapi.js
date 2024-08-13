const config = require('../config')
const { osMapsUrl, osMapsKey, osGetCapabilitiesUrl } = config
const { Headers } = require('node-fetch')
const fetch = require('node-fetch')

async function osGetCapabilities () {
  const url = `${osMapsUrl}?key=${osMapsKey}&${osGetCapabilitiesUrl}`
  const response = await fetch(url, {
    method: 'GET'
  })

  // replace secret key in capabilities
  const regex = new RegExp(osMapsKey, 'g')
  const payload = (await response.text()).replace(regex, '***')
  return payload
}

async function osGetAccessToken () {
  const authorisation = `${config.osMapsKey}:${config.osMapsSecret}`
  const headers = new Headers()
  headers.append('Authorization', 'Basic ' + Buffer.from(authorisation).toString('base64'))
  headers.append('Content-Type', 'application/x-www-form-urlencoded')
  const response = await fetch(config.osTokenEndpoint, {
    method: 'POST',
    headers,
    body: 'grant_type=client_credentials'
  })
  const data = await response.json()
  return data
}

module.exports = {
  osGetCapabilities,
  osGetAccessToken
}
