import { Map as OlMap, View } from 'ol'
import proj4 from 'proj4'
import { get as getProjection } from 'ol/proj.js'
import { register } from 'ol/proj/proj4'
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS.js'
import WMSCapabilities from 'ol/format/WMSCapabilities.js'
import WMTSCapabilities from 'ol/format/WMTSCapabilities.js'
import TileLayer from 'ol/layer/Tile.js'
import TileWMS from 'ol/source/TileWMS.js'
import WMTSTileGrid from 'ol/tilegrid/WMTS.js'
import VectorSource from 'ol/source/Vector.js'
import VectorLayer from 'ol/layer/Vector.js'
import Feature from 'ol/Feature.js'
import Circle from 'ol/geom/Circle.js'
import Style from 'ol/style/Style.js'
import Fill from 'ol/style/Fill.js'
import Stroke from 'ol/style/Stroke.js'
import Point from 'ol/geom/Point.js'
import Icon from 'ol/style/Icon.js'
import { defaults as interactionDefaults } from 'ol/interaction/defaults'
import { defaults as defaultControls } from 'ol/control.js'

let map, callback, currentLayer
let maxResolution = 1000

const SURFACE_WATER_RADIUS_METRE = 15
const SURFACE_WATER_MAX_RESOLUTION = 20
const DEFAULT_MAP_CENTRE = [440000, 310000]
const MAP_EXTENT = [0, 0, 800000, 1400000]
const TILE_SIZE = [250, 250]
const DEFAULT_ZOOM_ADDRESS = 9
const DEFAULT_ZOOM_WHOLE_MAP = 0
const config = {
  projection: {
    ref: 'EPSG:27700',
    proj4: '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs',
    extent: MAP_EXTENT
  },
  OSGetCapabilities: 'os-get-capabilities',
  OSWMTS: 'os-maps-proxy',
  OSAttribution: "&#169; Crown copyright and database rights {{year}} <a class='govuk-link' href='http://www.ordnancesurvey.co.uk'>OS</a> AC0000807064. Use of this mapping data is subject to terms and conditions",
  OSLayer: 'Outdoor_27700',
  OSMatrixSet: 'EPSG:27700',
  GSWMSGetCapabilities: 'gwc-proxy?SERVICE=WMS&VERSION=1.1.1&REQUEST=getcapabilities&TILED=true',
  GSWMS: 'gwc-proxy?'
}

export async function loadMap (point) {
  proj4.defs(config.projection.ref, config.projection.proj4)
  register(proj4)

  const projection = getProjection(config.projection.ref)

  projection.setExtent(config.projection.extent)

  // load capabilities from OS and GSWSM

  const responses = await Promise.all([fetch(config.OSGetCapabilities), fetch(config.GSWMSGetCapabilities)])
  const OS = await responses[0].text()
  const WMS = await responses[1].text()

  const { layer, source } = createBaseLayer(OS)

  const layers = []
  // add the base map layer
  layers.push(layer)

  createFeatureLayers(WMS, source.tileGrid.getResolutions(), layers)

  if (point) {
    const centreLayer = createCentreLayer(point)
    const radiusLayer = createRadiusLayer(point)
    layers.push(centreLayer, radiusLayer)
  }

  const resolutions = source.tileGrid.getResolutions().slice(0, 10)
  const controls = mapControls()

  map = new OlMap({
    controls,
    interactions: interactionDefaults({
      altShiftDragRotate: false,
      pinchRotate: false
    }),
    layers,
    pixelRatio: 1,
    target: 'map',
    view: new View({
      resolutions,
      projection,
      center: point || DEFAULT_MAP_CENTRE,
      zoom: point ? DEFAULT_ZOOM_ADDRESS : DEFAULT_ZOOM_WHOLE_MAP,
      extent: config.projection.extent
    })
  })

  map.on('pointermove', onPointerMove)

  fixUpDetails()

  if (callback) {
    callback()
  }
}

function mapControls () {
  function newElement (tagName, props) {
    const retval = document.createElementNS('http://www.w3.org/2000/svg', tagName)
    if (props) {
      for (const name in props) {
        if (Object.hasOwn(props, name)) {
          retval.setAttribute(name, props[name])
        }
      }
    }
    return retval
  }
  const zoomIn = newElement('svg', { width: 20, height: 20 })
  zoomIn.appendChild(newElement('rect', { x: 3, y: 9, width: 14, height: 2 }))
  zoomIn.appendChild(newElement('rect', { x: 9, y: 3, width: 2, height: 14 }))
  const zoomOut = newElement('svg', { width: '20', height: '20' })
  zoomOut.appendChild(newElement('rect', { x: '3', y: '9', width: '14', height: '2' }))
  const controls = defaultControls({
    attributionOptions: { collapsible: true },
    zoomOptions: {
      zoomInLabel: zoomIn,
      zoomOutLabel: zoomOut
    }
  })

  return controls
}

function fixUpDetails () {
  // Add aria-label to Zoom in and Zoom out buttons
  function addAriaLabel (classname, label) {
    const elements = document.getElementsByClassName(classname)
    for (const element of elements) {
      element.setAttribute('aria-label', label)
    }
  }
  addAriaLabel('ol-zoom-in', 'Zoom into map')
  addAriaLabel('ol-zoom-out', 'Zoom out of map')
}

function createFeatureLayers (WMS, resolutions, layers) {
  const wmsparser = new WMSCapabilities()
  const wmsResult = wmsparser.read(WMS)

  // I can't find a better way of doing this for a tileWMS source, WMTS souce has
  // optionsFromCapabilities function which does some of the work for you, but it looks
  // like that function just does this anyway, although i think the WMTS version does a lot more with setting up matrixSet and things
  for (const layer of wmsResult.Capability.Layer.Layer) {
    const WmsSource = new TileWMS({
      url: config.GSWMS,
      params: {
        LAYERS: layer.Name,
        TILED: true,
        VERSION: wmsResult.version
      },
      tileGrid: new WMTSTileGrid({
        extent: layer.BoundingBox[0].extent,
        resolutions,
        tileSize: TILE_SIZE
      })
    })

    if (isSurfaceWaterLayer(layer.Name)) {
      maxResolution = SURFACE_WATER_MAX_RESOLUTION
    }

    layers.push(new TileLayer({
      ref: layer.Name,
      source: WmsSource,
      opacity: 0.7,
      visible: false,
      maxResolution
    }))
  }
}

function createBaseLayer (OS) {
  const parser = new WMTSCapabilities()
  const result = parser.read(OS)

  const options = optionsFromCapabilities(result, {
    layer: config.OSLayer,
    matrixSet: config.OSMatrixSet,
    crossOrigin: 'anonymous'
  })

  const source = new WMTS(options)
  source.setUrl(config.OSWMTS)

  const layer = new TileLayer({
    ref: config.OSLayer,
    source
  })
  return { layer, source }
}

function onPointerMove (e) {
  if (e.dragging) {
    return
  }

  const currentLayerRef = currentLayer?.get('ref')
  const $body = document.getElementsByTagName('body')[0]
  if ((currentLayerRef === 'risk:1-ROFRS' || currentLayerRef === 'risk:6-SW-Extent') || !(currentLayerRef !== 'risk:1-ROFRS' && currentLayerRef !== 'risk:6-SW-Extent' && currentLayerRef !== 'risk:2-FWLRSF')) {
    $body.style.cursor = 'pointer'
  } else {
    $body.style.cursor = 'default'
  }
}

function createCentreLayer (point) {
  return new VectorLayer({
    ref: 'pointMarker',
    className: 'pointMarker',
    visible: true,
    source: new VectorSource({
      features: [new Feature({
        geometry: new Point(point)
      })]
    }),
    style: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: 'assets/images/icon-location.png'
      })
    })
  })
}

function createRadiusLayer (point) {
  return new VectorLayer({
    ref: 'radiusMarker',
    className: 'radiusMarker',
    visible: false,
    source: new VectorSource({
      features: [new Feature({
        geometry: new Circle(point, SURFACE_WATER_RADIUS_METRE)
      })]
    }),
    style: new Style({
      fill: new Fill({
        color: 'rgba(237, 231, 46, 0.6)'
      }),
      stroke: new Stroke({
        color: 'rgba(237, 231, 46, 1)',
        width: 2
      })
    })
  })
}

function isSurfaceWaterLayer (layerName) {
  return layerName.substr(7, 2) === 'SW'
}

export function showMap (layerReference, hasLocation) {
  map.getLayers().forEach(function (layer) {
    const layerName = layer.get('ref')
    if (layerName !== config.OSLayer) {
      currentLayer = layerName === layerReference ? layer : currentLayer
      layer.setVisible(layerName === layerReference)
    }

    if (layerName === 'pointMarker' && hasLocation) {
      layer.setVisible(true)
      layer.setZIndex(1)
    }
    if (layerName === 'radiusMarker' && hasLocation && isSurfaceWaterLayer(layerReference)) {
      layer.setVisible(true)
      layer.setZIndex(0)
    }
  })

  // The below toggles whether the zoom buttons are disabled. They are placed within this function
  // as the map object was not accessible outside of it.
  const zoomControls = {
    zoomIn: document.querySelector('.ol-zoom-in'),
    zoomOut: document.querySelector('.ol-zoom-out')
  }
  const disableThresholds = {
    zoomInMax: 8,
    zoomInEnable: 10,
    zoomOutMax: 2,
    zoomOutEnable: 0
  }
  const disableClass = 'zoom-disabled'

  zoomControls.zoomIn.addEventListener('click', () => {
    disableZoomIn()
  })

  zoomControls.zoomOut.addEventListener('click', () => {
    disableZoomOut()
  })

  function disableZoomIn () {
    if (map.getView().getZoom() >= disableThresholds.zoomInMax) {
      zoomControls.zoomIn.classList.add(disableClass)
    }
    if (map.getView().getZoom() > disableThresholds.zoomOutEnable) {
      zoomControls.zoomOut.classList.remove(disableClass)
    }
  }

  function disableZoomOut () {
    if (map.getView().getZoom() < disableThresholds.zoomOutMax) {
      zoomControls.zoomOut.classList.add(disableClass)
    }
    if (map.getView().getZoom() < disableThresholds.zoomInEnable) {
      zoomControls.zoomIn.classList.remove(disableClass)
    }
  }

  function initialZoomState () {
    const zoom = map.getView().getZoom()
    zoomControls.zoomIn.classList.toggle(disableClass, zoom >= 8)
    zoomControls.zoomOut.classList.toggle(disableClass, zoom <= 2)
  }

  initialZoomState()
}

export function updateSize () {
  map.updateSize()
}

export function panTo (point, zoom) {
  const view = map.getView()
  view.setCenter(point)
  view.setZoom(zoom)
}

export function onReady (fn) {
  callback = fn
}
