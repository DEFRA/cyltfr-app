const hapi = require('@hapi/hapi')
const config = require('./config')
const cache = require('./cache')

async function createServer () {
  // Create the hapi server
  const server = hapi.server({
    host: config.host,
    port: config.port,
    routes: {
      validate: {
        options: {
          abortEarly: false,
          stripUnknown: true
        }
      },
      security: true
    },
    router: {
      stripTrailingSlash: true
    },
    cache
  })

  const validate = async (request, username, password, h) => {
    let isValid = false
    let credentials = null
    if ((username === 'admin') && (password === config.checkerPassword)) {
      isValid = true
      credentials = { name: 'admin' }
    }
    return { isValid, credentials }
  }
  // Register the plugins
  await server.register(require('@hapi/basic'))
  server.auth.strategy('simple', 'basic', {
    validate,
    unauthorizedAttributes: { realm: 'Enter your credentials' }
  })

  await server.register(require('@hapi/h2o2'))
  await server.register(require('@hapi/inert'))
  await server.register(require('./plugins/views'))
  await server.register(require('./plugins/router'))
  await server.register(require('./plugins/rate-limit'))
  await server.register(require('./plugins/error-pages'))
  await server.register(require('./plugins/full-url'))
  await server.register(require('./plugins/logging'))
  await server.register(require('./plugins/session'))
  await server.register(require('./plugins/cookies'))
  await server.register(require('blipp'))

  // Register the server methods
  const serverMethods = require('./server-methods/server-methods')

  for (const method of serverMethods) {
    server.method(method.name, method.method, method.options)
  }

  if (config.errbit.postErrors) {
    await server.register({
      plugin: require('./plugins/airbrake'),
      options: config.errbit.options
    })
  }
  return server
}

module.exports = createServer
