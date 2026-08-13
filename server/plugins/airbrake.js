'use strict'

const schema = require('./airbrake-schema.js')
const Airbrake = require('@airbrake/node')

function logAirbrakeFailure (server, noticeError) {
  server.log(['error'], { message: `Airbrake notification failed: ${noticeError}`, error: noticeError })
}

async function notifyAirbrake (airbrake, notification, server) {
  try {
    const notice = await airbrake.notify(notification)
    if (!notice.id) {
      logAirbrakeFailure(server, notice.error)
    }
  } catch (error) {
    logAirbrakeFailure(server, error)
  }
}

function createRequestErrorHandler (airbrake, server) {
  return async (req, event, tags) => {
    const error = event.error || event.data
    if (error && typeof error === 'object') {
      error.component = 'hapi'
    }

    await notifyAirbrake(
      airbrake,
      {
        error,
        session: {
          route: req.route.path,
          method: req.method,
          url: req.url.href
        }
      },
      server
    )
  }
}

function createNotifyMethod (airbrake, server) {
  return async (error, session) => {
    const notification = session ? { error, session } : { error }
    let logMessage = ''
    if (session) {
      logMessage = JSON.stringify(session)
    }
    logMessage = `Notify called: ${error.message}: ${JSON.stringify(error)}\n${logMessage}`
    server.log(['error'], { message: logMessage, error })

    await notifyAirbrake(airbrake, notification, server)
  }
}

exports.plugin = {
  register: async (server, options) => {
    const result = schema.options.validate(options)
    if (result.error) {
      throw new Error(result.error)
    }

    const airbrake = new Airbrake.Notifier({
      host: result.value.host,
      projectId: result.value.appId,
      projectKey: result.value.key,
      environment: result.value.env
    })

    // airbrake.requestOptions.proxy = result.value.proxy ? result.value.proxy : null

    // notify airbrake on request error
    server.events.on(
      { name: 'request', channels: ['error', 'app'], filter: 'error' },
      createRequestErrorHandler(airbrake, server)
    )

    // Add server.method.notify to allow manual airbrake notification
    server.method(result.value.notify, createNotifyMethod(airbrake, server))
  },
  name: 'airbrake'
}

exports._private = {
  createNotifyMethod,
  createRequestErrorHandler,
  logAirbrakeFailure,
  notifyAirbrake
}
