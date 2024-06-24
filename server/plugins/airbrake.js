'use strict'

const schema = require('./airbrake-schema.js')
const Airbrake = require('@airbrake/node')

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
    server.events.on({ name: 'request', channels: ['error', 'app'], filter: 'error' }, (req, event, tags) => {
      const error = event.error || event.data
      error.component = 'hapi'

      airbrake
        .notify({
          error,
          session: {
            route: req.route.path,
            method: req.method,
            url: req.url.href
          }
        })
        .then((notice) => {
          if (!notice.id) {
            server.log(['error'], { message: `Airbrake notification failed: ${notice.error}`, error: notice.error })
          }
        })
    })

    // Add server.method.notify to allow manual airbrake notification
    server.method(result.value.notify, (error) => {
      airbrake.notify(error, (err) => {
        if (err) {
          server.log(['error', 'info'], err)
        }
      })
    })
  },
  name: 'airbrake'
}
