const path = require('path')

module.exports = {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  devtool: 'source-map',
  entry: {
    capabilities: './server/src/js/map-page/capabilities.js',
    mapPage: './server/src/js/map-page/map-page.js',
    map: {
      dependOn: 'mapPage',
      import: './server/src/js/map.js'
    }
  },
  node: {
    global: true
  },
  output: {
    path: path.resolve(__dirname, 'server/public/build/js'),
    library: 'maps'
  }
}
