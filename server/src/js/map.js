import Extent from '@arcgis/core/geometry/Extent.js'
import ArcMap from '@arcgis/core/Map.js'
import Basemap from '@arcgis/core/Basemap.js'
import MapView from '@arcgis/core/views/MapView.js'
import Point from '@arcgis/core/geometry/Point.js'
import SpatialReference from '@arcgis/core/geometry/SpatialReference.js'
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer.js'
import WebTileLayer from '@arcgis/core/layers/WebTileLayer.js'
import esriConfig from '@arcgis/core/config.js'
import Graphic from '@arcgis/core/Graphic.js'

let map, callback, currentLayer, tokenFetchRunning
const TOKEN_PREFETCH_SECS = 30
const currentPageURL = new URLSearchParams(document.location.search)
const mapPageQuery = currentPageURL.get('map')
const initialZoomLevel = mapPageQuery === null ? 1 : 7

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
      maxZoom: 9,
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
        layers.push(new VectorTileLayer({
          id: featureMap.ref,
          url: featureMap.url,
          apiKey: window.mapConfig.mapToken,
          opacity: window.mapConfig.mapTransparency,
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
    urlTemplate: window.mapConfig.osMapUrl + '{level}/{col}/{row}.png',
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
