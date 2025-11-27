module.exports = function logSanitisedConfig (config, protectedProperties) {
  if (!config.isLocalEnv) {
    console.log('Server config', config)
  } else {
    const sanitisedConfig = Object.fromEntries(
      Object.entries(config).map(([key, val]) => {
        const shouldRedact = protectedProperties.includes(key)
        return [key, shouldRedact ? `[REDACTED:${String(val).length}]` : val]
      })
    )

    console.log('Server config', sanitisedConfig)
  }
}
