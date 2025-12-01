import ArcMap from '@arcgis/core/Map.js'
import Basemap from '@arcgis/core/Basemap.js'
import MapView from '@arcgis/core/views/MapView.js'
import Point from '@arcgis/core/geometry/Point.js'
import SpatialReference from '@arcgis/core/geometry/SpatialReference.js'
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer.js'
import esriConfig from '@arcgis/core/config.js'
import Graphic from '@arcgis/core/Graphic.js'

let map, callback, currentLayer, tokenFetchRunning
const TOKEN_PREFETCH_SECS = 30
const currentPageURL = new URLSearchParams(document.location.search)
const mapPageQuery = currentPageURL.get('map')
const initialZoomLevel = mapPageQuery === null ? 3 : 7

async function refreshOsToken () {
  tokenFetchRunning = true
  const response = await fetch('/os-get-token')
  tokenFetchRunning = false
  const formattedResponse = await response.json()
  if (formattedResponse.error) {
    throw new Error('os-get-token failed')
  } else {
    window.mapConfig.osToken = formattedResponse.access_token
    setTimeout(() => {
      refreshOsToken()
    }, (formattedResponse.expires_in - TOKEN_PREFETCH_SECS) * 1000)
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
    zoom: initialZoomLevel,
    center: centrePoint,
    constraints: {
      minZoom: 0,
      maxZoom: 15,
      rotationEnabled: false
    }
  })

  const markerPoint = new Point({
    x: point[0],
    y: point[1],
    spatialReference: { wkid: 27700 }
  })

  const markerSymbol = {
    type: 'picture-marker',
    url: '/assets/images/pointer-icon.png',
    width: '40px',
    height: '40px',
    yoffset: 12
  }

  const markerGraphic = new Graphic({
    geometry: markerPoint,
    symbol: markerSymbol
  })

  mapView.graphics.add(markerGraphic)

  const markerCheckbox = document.getElementById('selected-address-checkbox')
  markerCheckbox.addEventListener('change', function () {
    if (markerCheckbox.checked) {
      mapView.graphics.add(markerGraphic)
    } else {
      mapView.graphics.remove(markerGraphic)
    }
  })

  mapView.when(function () {
    // MapView is now ready for display and can be used. Here we will
    // use goTo to view a particular location at a given zoom level and center
    mapView.ui.move('zoom', 'bottom-right')
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
        const vectorTileLayer = new VectorTileLayer({
          id: featureMap.ref,
          url: featureMap.url,
          apiKey: window.mapConfig.mapToken,
          opacity: window.mapConfig.mapTransparency,
          visible: false
        })
        if (featureMap.styleOverride) {
          vectorTileLayer.load().then((vl) => {
            vl.currentStyleInfo.style = featureMap.styleOverride
          })
        }
        layers.push(vectorTileLayer)
      }
    }
  }
}

function createBaseLayer () {
  const layer = new VectorTileLayer({
    id: 'base-map',
    url: window.mapConfig.osMapUrl
  })

  setTimeout(() => { refreshOsToken() }, (window.mapConfig.osTokenExpiry - TOKEN_PREFETCH_SECS) * 1000)

  esriConfig.request.interceptors.push({
    urls: window.mapConfig.osMapHost,
    headers: { Authorization: `Bearer ${window.mapConfig.osToken}` },
    before: (params) => {
      if (params.requestOptions.headers) {
        params.requestOptions.headers.Authorization = `Bearer ${window.mapConfig.osToken}`
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
