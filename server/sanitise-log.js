module.exports = function logSanitisedConfig (config, protectedProperties) {
  const sanitisedConfig = Object.fromEntries(
    Object.entries(config).map(([key, val]) => {
      const shouldRedact = protectedProperties.includes(key) && !config.isLocalEnv
      return [key, shouldRedact ? `[REDACTED:${String(val).length}]` : val]
    })
  )

  console.log('Server config', sanitisedConfig)
}
