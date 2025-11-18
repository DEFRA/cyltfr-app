// the 'names' from config.js that should be redacted when logging
const protectedProperties = [
  'osSearchKey',
  'osMapsKey',
  'osMapsSecret',
  'friendlyCaptchaSiteKey',
  'friendlyCaptchaSecretKey',
  'friendlyCaptchaBypass',
  'cookiePassword',
  'esriClientID',
  'esriClientSecret',
  'errbitkey'
]

module.exports = function logSanitisedConfig (sourceConfig) {
  const sanitisedConfig = Object.entries(sourceConfig).reduce((sanitised, [key, val]) => {
    const shouldRedact = protectedProperties.includes(key) && !sourceConfig.isLocalEnv
    sanitised[key] = shouldRedact ? `[REDACTED:${String(val).length}]` : val
    return sanitised
  }, {})

  console.log('Server config', sanitisedConfig)
}
