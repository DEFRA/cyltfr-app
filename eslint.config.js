'use strict'

module.exports = require('neostandard')({
  env: ['jest'],
  ignores: ['server/public/build/js/**', 'server/public/static/js/vendor/**'],
})
