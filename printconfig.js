// Temporary tool to convert from json config values to environment variables

const config = require('./server/config')

config.errbitpostErrors = config.errbit.postErrors
config.errbitenv = config.errbit.options.env
config.errbitkey = config.errbit.options.key
config.errbithost = config.errbit.options.host
config.errbitproxy = config.errbit.options.proxy
config.rateLimitWhitelist = config.rateLimitWhitelist.join(',')

console.log('For .env file')
console.log('=======================================')

Object.keys(config.names).forEach((key) => {
  if (config[key]) { console.log('%s=%s', config.names[key], config[key]) }
})

console.log('=======================================')
console.log('For JSON definition of environment')
console.log('=======================================')

Object.keys(config.names).forEach((key) => {
  if (config[key]) {
    console.log('{')
    console.log('  "name": "%s"', config.names[key])
    console.log('  "value": "%s"', config[key])
    console.log(']')
  }
})

console.log('=======================================')
