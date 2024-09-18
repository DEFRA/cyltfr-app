const path = require('path')

module.exports = {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  devtool: 'source-map',
  entry: {
    mapPage: './server/src/js/map-page/map-page.js',
    mapPageOriginal: './server/src/js/map-page-original/map-page.js',
    map: {
      dependOn: ['mapPage', 'mapPageOriginal'],
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
