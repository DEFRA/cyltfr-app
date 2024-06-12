const joi = require('joi')

function readConfigFile () {
  const fileValues = require('../config/server.json')
  Object.keys(fileValues).forEach(function (key) {
    config[key] = fileValues[key]
  })
}

// Define config schema
const schema = joi.object().keys({
  env: joi.string().valid('dev', 'test', 'prod-green', 'prod-blue'),
  host: joi.string().hostname().required(),
  port: joi.number().integer().required(),
  db: joi.string().required()
})

const config = {
  env: process.env.NODE_ENV,
  host: process.env.RISK_SERVICE_HOST,
  port: process.env.PORT,
  db: process.env.DB_SERVER
}

// Validate config
let result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  // read from config file
  readConfigFile()
  result = schema.validate(config, {
    abortEarly: false
  })
}

// Throw if config is invalid
if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}

// Use the joi validated value
const value = result.value

// Add some helper props
value.isDev = value.env === 'dev'
value.isTest = value.env === 'test'
value.isProd = value.env.startsWith('prod-')

console.log('Server config', value)

module.exports = value
