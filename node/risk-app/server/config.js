const joi = require('joi')
const config = require('../config/server.json')

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
  osNamesUrl: joi.string().uri().required(),
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

config.http_proxy = process.env.http_proxy

// Validate config
const result = schema.validate(config, {
  abortEarly: false
})

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

module.exports = value
