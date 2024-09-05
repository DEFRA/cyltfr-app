const config = require('../config')
const { Headers } = require('node-fetch')
const fetch = require('node-fetch')

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
  osGetAccessToken
}
