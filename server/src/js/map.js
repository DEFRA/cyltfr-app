import Extent from '@arcgis/core/geometry/Extent.js'
import ArcMap from '@arcgis/core/Map.js'
import Basemap from '@arcgis/core/Basemap.js'
import MapView from '@arcgis/core/views/MapView.js'
import Point from '@arcgis/core/geometry/Point.js'
import SpatialReference from '@arcgis/core/geometry/SpatialReference.js'
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer.js'
import WebTileLayer from '@arcgis/core/layers/WebTileLayer.js'
import esriConfig from '@arcgis/core/config.js'

let map, callback, currentLayer, tokenFetchRunning
const TOKEN_PREFETCH_SECS = 30

async function refreshOsToken () {
  tokenFetchRunning = true
  const response = await fetch('/os-get-token')
  if (response.ok) {
    const tokenValues = await response.json()
    window.osToken = tokenValues.access_token
    tokenFetchRunning = false
    setTimeout(() => {
      refreshOsToken()
    }, (tokenValues.expires_in - TOKEN_PREFETCH_SECS) * 1000)
  }
}

export async function loadMap (point) {
  // Add the base layer map

  const { layer } = createBaseLayer()
  const layers = []

  // Create the vector layers
  createFeatureLayers(layers)

  map = new ArcMap({
    basemap: new Basemap({
      baseLayers: [layer]
    }),
    layers
  })

  const DEFAULT_X = 440000
  const DEFAULT_Y = 310000
  const centrePoint = new Point({
    x: point[0] || DEFAULT_X,
    y: point[1] || DEFAULT_Y,
    spatialReference: new SpatialReference({ wkid: 27700 })
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
    id: 'base-map',
    // urlTemplate: window.location.origin + '/os-maps-proxy?{level}/{col}/{row}.png',
    urlTemplate: 'https://api.os.uk/maps/raster/v1/zxy/Outdoor_27700/{level}/{col}/{row}.png',
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

  setTimeout(() => { refreshOsToken() }, (window.osTokenExpires - TOKEN_PREFETCH_SECS) * 1000)

  esriConfig.request.interceptors.push({
    urls: 'https://api.os.uk/',
    headers: { Authorization: `Bearer ${window.osToken}` },
    before: (params) => {
      if (params.requestOptions.headers) {
        params.requestOptions.headers.Authorization = `Bearer ${window.osToken}`
      }
    },
    error: (e) => {
      if ((e.name === 'request:server') && (!tokenFetchRunning)) {
        tokenFetchRunning = setTimeout(async () => {
          await refreshOsToken()
          layer.refresh()
        }, 0)
      }
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
