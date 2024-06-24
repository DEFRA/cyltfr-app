module.exports = [
  {
    method: 'GET',
    path: '/robots.txt',
    handler: {
      file: 'server/public/static/robots.txt'
    },
    options: {
      description: 'Get the robots.txt'
    }
  },
  {
    method: 'GET',
    path: '/assets/govuk-frontend.min.js',
    handler: {
      file: 'node_modules/govuk-frontend/dist/govuk/govuk-frontend.min.js'
    },
    options: {
      description: 'Get the GDS govuk-frontend.min.js asset'
    }
  },
  {
    method: 'GET',
    path: '/assets/govuk-frontend.min.js.map',
    handler: {
      file: 'node_modules/govuk-frontend/dist/govuk/govuk-frontend.min.js.map'
    },
    options: {
      description: 'Get the GDS govuk-frontend.min.js.map asset'
    }
  },
  {
    method: 'GET',
    path: '/assets/{path*}',
    handler: {
      directory: {
        path: [
          'server/public/static',
          'server/public/build',
          'node_modules/govuk-frontend/dist/govuk/assets',
          'node_modules/nunjucks/browser'
        ]
      }
    },
    options: {
      description: 'Get public assets'
    }
  },
  {
    method: 'GET',
    path: '/ol/ol.css',
    handler: {
      file: 'node_modules/ol/ol.css'
    },
    options: {
      description: 'Get the openlayers css file'
    }
  }
]
