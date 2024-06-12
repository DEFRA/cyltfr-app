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
  port: joi.number().required(),
  geoserverUrl: joi.string().uri().required(),
  serviceUrl: joi.string().uri().required(),
  simulateAddressService: joi.boolean().default(false),
  httpTimeoutMs: joi.number().required().min(0).max(30000),
  analyticsAccount: joi.string().default(''),
  G4AnalyticsAccount: joi.string().default(''),
  GTagManagerId: joi.string().default(''),
  floodWarningsUrl: joi.string().uri().required(),
  floodRiskUrl: joi.string().uri().required(),
  osPostcodeUrl: joi.string().uri().required(),
  osGetCapabilitiesUrl: joi.string().required().allow(''),
  osMapsUrl: joi.string().uri().required(),
  osSearchKey: joi.string().required().allow(''),
  osMapsKey: joi.string().required().allow(''),
  http_proxy: joi.string(),
  rateLimitEnabled: joi.boolean().default(false),
  rateLimitRequests: joi.number().integer().when('rateLimitEnabled', { is: true, then: joi.required() }),
  rateLimitExpiresIn: joi.number().integer().when('rateLimitEnabled', { is: true, then: joi.required() }),
  rateLimitWhitelist: joi.array().items(joi.string().required()).default([]),
  redisCacheEnabled: joi.boolean().default(false),
  redisCacheHost: joi.string().hostname().when('redisCacheEnabled', { is: true, then: joi.required() }),
  redisCachePort: joi.number().integer().when('redisCacheEnabled', { is: true, then: joi.required() }),
  cookiePassword: joi.string().min(32).required(),
  friendlyCaptchaEnabled: joi.boolean().default(false),
  friendlyCaptchaSiteKey: joi.string().when('friendlyCaptchaEnabled', { is: true, then: joi.required() }),
  friendlyCaptchaSecretKey: joi.string().when('friendlyCaptchaEnabled', { is: true, then: joi.required() }),
  friendlyCaptchaUrl: joi.string().when('friendlyCaptchaEnabled', { is: true, then: joi.required() }),
  friendlyCaptchaBypass: joi.string().default(''),
  sessionTimeout: joi.number().default(10),
  riskPageFlag: joi.boolean().default(false),
  cacheEnabled: joi.boolean().default(true),
  errbit: joi.object().required().keys({
    postErrors: joi.boolean().required(),
    options: {
      env: joi.string().required(),
      key: joi.string().required(),
      host: joi.string().required(),
      proxy: joi.string().allow('')
    }
  })
})

const names = {
  env: 'NODE_ENV',
  host: 'RISK_APP_HOST',
  port: 'PORT',
  geoserverUrl: 'GEOSERVER_URL',
  serviceUrl: 'SERVICE_URL',
  simulateAddressService: 'SIMULATE_ADDRESS_SERVICE',
  httpTimeoutMs: 'HTTP_TIMEOUT_MS',
  G4AnalyticsAccount: 'G4_ANALYTICS_ACCOUNT',
  GTagManagerId: 'GTAG_MANAGER_ID',
  floodWarningsUrl: 'FLOOD_WARNINGS_URL',
  floodRiskUrl: 'FLOOD_RISK_URL',
  osPostcodeUrl: 'OS_POSTCODE_URL',
  osGetCapabilitiesUrl: 'OS_CAPABILITIES_URL',
  osMapsUrl: 'OS_MAPS_URL',
  osSearchKey: 'OS_SEARCH_KEY',
  osMapsKey: 'OS_MAPS_KEY',
  http_proxy: 'HTTP_PROXY',
  rateLimitEnabled: 'RATE_LIMIT_ENABLED',
  rateLimitRequests: 'RATE_LIMIT_REQUESTS',
  rateLimitExpiresIn: 'RATE_LIMIT_EXPIRES_IN',
  rateLimitWhitelist: 'RATE_LIMIT_WHITELIST',
  redisCacheEnabled: 'REDIS_CACHE_ENABLED',
  redisCacheHost: 'REDIS_CACHE_HOST',
  redisCachePort: 'REDIS_CACHE_PORT',
  cookiePassword: 'COOKIE_PASSWORD',
  friendlyCaptchaEnabled: 'FRIENDLY_CAPTCHA_ENABLED',
  friendlyCaptchaSiteKey: 'FRIENDLY_CAPTCHA_SITE_KEY',
  friendlyCaptchaSecretKey: 'FRIENDLY_CAPTCHA_SECRET_KEY',
  friendlyCaptchaUrl: 'FRIENDLY_CAPTCHA_URL',
  friendlyCaptchaBypass: 'FRIENDLY_CAPTCHA_BYPASS',
  sessionTimeout: 'SESSION_TIMEOUT',
  riskPageFlag: 'RISK_PAGE_FLAG',
  cacheEnabled: 'CACHE_ENABLED',
  errbitpostErrors: 'ERRBIT_POST_ERRORS',
  errbitenv: 'ERRBIT_ENV',
  errbitkey: 'ERRBIT_KEY',
  errbithost: 'ERRBIT_HOST',
  errbitproxy: 'ERRBIT_PROXY'
}

const config = {}

Object.keys(names).forEach((key) => {
  config[key] = process.env[names[key]]
})

// This needs changing after the move to env vars. This is a bit untidy.
if (config.errbitpostErrors) {
  config.errbit = {
    postErrors: config.errbitpostErrors,
    options: {
      env: config.errbitenv,
      key: config.errbitkey,
      host: config.errbithost,
      proxy: config.errbitproxy
    }
  }
}
delete config.errbitpostErrors
delete config.errbitenv
delete config.errbitkey
delete config.errbithost
delete config.errbitproxy
//

config.rateLimitWhitelist = config.rateLimitWhitelist ? config.rateLimitWhitelist.split(',') : []

// Validate config
let result = schema.validate(config, {
  abortEarly: false
})

// Remove this after the move to env vars
if (result.error) {
  // read from config file
  readConfigFile()
  result = schema.validate(config, {
    abortEarly: false
  })
}
//

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

value.names = names

module.exports = value
