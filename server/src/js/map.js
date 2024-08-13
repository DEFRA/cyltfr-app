import Extent from '@arcgis/core/geometry/Extent.js'
import ArcMap from '@arcgis/core/Map.js'
import MapView from '@arcgis/core/views/MapView.js'
import Point from '@arcgis/core/geometry/Point.js'
import SpatialReference from '@arcgis/core/geometry/SpatialReference.js'
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer.js'
import WebTileLayer from '@arcgis/core/layers/WebTileLayer.js'

let map, callback, currentLayer

const config = {
  projection: new SpatialReference({ wkid: 27700 }),
  OSGetCapabilities: 'os-get-capabilities',
  OSWMTS: 'os-maps-proxy',
  OSAttribution: "&#169; Crown copyright and database rights {{year}} <a class='govuk-link' href='http://www.ordnancesurvey.co.uk'>OS</a> AC0000807064. Use of this mapping data is subject to terms and conditions",
  OSLayer: 'Outdoor_27700',
  OSMatrixSet: 'EPSG:27700',
  GSWMSGetCapabilities: 'gwc-proxy?SERVICE=WMS&VERSION=1.1.1&REQUEST=getcapabilities&TILED=true',
  GSWMS: 'gwc-proxy?'
}

export async function loadMap (point) {
  // Add the base layer map
  const { layer } = createBaseLayer()
  const layers = []
  layers.push(layer)

  // Create the vector layers
  createFeatureLayers(layers)

  map = new ArcMap({
    layers
  })

  const DEFAULT_X = 440000
  const DEFAULT_Y = 310000
  const centrePoint = new Point({
    x: point[0] || DEFAULT_X,
    y: point[1] || DEFAULT_Y,
    spatialReference: config.projection
  })

  const mapView = new MapView({
    container: 'map',
    map,
    zoom: 7,
    center: centrePoint,
    constraints: {
      minZoom: 0,
      maxZoom: 9,
      rotationEnabled: false
    }
  })

  mapView.when(function () {
    // MapView is now ready for display and can be used. Here we will
    // use goTo to view a particular location at a given zoom level and center
    mapView.ui.move('zoom', 'bottom-left')
  })

  if (callback) {
    callback()
  }
}

function createFeatureLayers (layers) {
  // For the moment, uses existing maps.json file with new URL parameter
  const categories = window.mapCategories.categories
  for (const layer of categories) {
    const maps = layer.maps
    for (const featureMap of maps) {
      if (featureMap.url) {
        layers.push(new VectorTileLayer({
          id: featureMap.ref,
          url: featureMap.url,
          apiKey: window.mapToken,
          visible: false
        }))
      }
    }
  }
}

function createBaseLayer () {
  const bng = new SpatialReference({ wkid: 27700 })

  const extent = new Extent({
    xmin: -238375.0,
    ymin: 0.0,
    xmax: 900000.0,
    ymax: 1376256.0,
    spatialReference: bng
  })

  const layer = new WebTileLayer({
    // initial commit, using OS Proxy but needs to be reviewed or maybe use OAuth2.0 instead
    id: 'base-map',
    urlTemplate: window.location.origin + '/os-maps-proxy?{level}/{col}/{row}.png',
    fullExtent: extent,
    spatialReference: bng,
    tileInfo: {
      lods: [
        { level: 0, resolution: 896.0, scale: 3386450 },
        { level: 1, resolution: 448.0, scale: 1693225 },
        { level: 2, resolution: 224.0, scale: 846612 },
        { level: 3, resolution: 112.0, scale: 423306 },
        { level: 4, resolution: 56.0, scale: 211653 },
        { level: 5, resolution: 28.0, scale: 105827 },
        { level: 6, resolution: 14.0, scale: 52913 },
        { level: 7, resolution: 7.0, scale: 26457 },
        { level: 8, resolution: 3.5, scale: 13228 },
        { level: 9, resolution: 1.75, scale: 6614 }
      ],
      origin: new Point({
        x: -238375.0,
        y: 1376256.0,
        spatialReference: bng
      }),
      spatialReference: bng
    }
  })
  return { layer }
}

export function showMap (layerReference, hasLocation) {
  map.allLayers.forEach(function (layer) {
    const layerName = layer.id
    if (layerName !== 'base-map') {
      currentLayer = layerName === layerReference ? layer : currentLayer
      if (layerName === layerReference) {
        layer.visible = true
      } else {
        layer.visible = false
      }
    }
  })
}

export function onReady (fn) {
  callback = fn
}
