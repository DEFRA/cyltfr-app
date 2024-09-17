import { scenarioDisplayUpdate, handleScroll, handleArrowClick } from '../map-page/scenario-bars.js'
import { openKey, closeKey, showOrHideAdvancedToggleText, toggleAdvancedOptions, handleRadioChange, selectedOption } from '../map-page/map-controls.js'
import { adjustPosition } from '../map-page/screen-size-adjustments.js'
import { mapPageConsts } from '../map-page/constants.js'

class MapController {
  constructor (categories) {
    this._categories = categories
  }

  /**
 * setCurrent
 * @param {string} ref The ref of either a category or map. If a category ref is passed, the first map in that category is used.
 */
  setCurrent (ref) {
  // Work out the current category and map
    let category, map, defaultCategory, defaultMap
    for (let i = 0; i < this._categories.length; i++) {
      category = this._categories[i]
      if (i === 0) {
        defaultCategory = category
      }

      if (category.ref === ref) {
        this.currMap = category.maps[0]
        this.currCategory = category
        return
      }

      for (let j = 0; j < category.maps.length; j++) {
        map = category.maps[j]
        if (i === 0 && j === 0) {
          defaultMap = map
        }

        if (map.ref === ref) {
          this.currMap = map
          this.currCategory = category
          return
        }
      }
    }

    this.currMap = defaultMap
    this.currCategory = defaultCategory
  }
}

function mapPage () {
  getInitialKeyOptions()

  function getParameterByName (name) {
    name = name.replace(/[[]/, '\\[').replace(/\]/, '\\]')
    const regex = new RegExp(`[\\?&]${name}=([^&#]*)`)
    const results = regex.exec(window.location.search)
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
  }
  const measurements = document.querySelectorAll('.govuk-radios__inputs')
  const map = document.getElementById('map')
  const body = document.body

  const easting = parseInt(getParameterByName('easting'), 10)
  const northing = parseInt(getParameterByName('northing'), 10)
  const hasLocation = !!easting
  const stateCheck = setInterval(() => {
    if (document.readyState === 'complete') {
      clearInterval(stateCheck)
      mapPageConsts.maps.loadMap((hasLocation && [easting, northing]))
    }
  }, 100)

  // This function updates the map to the radio button you select (extent, depth, velocity)
  function setCurrent (ref) {
    const mapController = new MapController(window.mapCategories.categories)
    mapController.setCurrent(ref)
    const selectedAddressCheckbox = document.getElementById('selected-address-checkbox')
    const showFloodingCheckbox = document.getElementById('display-layers-checkbox')
    const mapReferenceValue = selectedOption()

    if (showFloodingCheckbox.checked) {
      mapPageConsts.maps.showMap(`${mapReferenceValue}`, selectedAddressCheckbox.checked)
    } else {
      mapPageConsts.maps.showMap(`${mapReferenceValue}DONOTDISPLAY`, selectedAddressCheckbox.checked)
    }
  }

  // Default to the first category/map
  mapPageConsts.maps.onReady(function () {
    measurements.forEach(function (measurement) {
      if (
        measurement.name === 'measurements' ||
        measurement.name === 'scenarios-depth' ||
        measurement.name === 'scenarios-velocity' ||
        measurement.name === 'map-toggle'
      ) {
        measurement.addEventListener('change', function (event) {
          event.preventDefault()
          setCurrent(event.target.value)
        })
      }
    })

    setCurrent(getParameterByName('map'))
  })

  mapPageConsts.advancedToggle.addEventListener('click', function (event) {
    event.stopPropagation()
    if (window.innerWidth <= mapPageConsts.deviceScreenWidth) {
      openKey()
    }
    toggleAdvancedOptions()
    selectedOption()
    setCurrent()
  })

  // ensures mouse cursor returns to default if feature was at edge of map
  map.addEventListener('mouseleave', function () {
    body.style.cursor = 'default'
  })
}

document.addEventListener('click', function (event) {
  if (mapPageConsts.keyDisplay.style.display === 'block' && !mapPageConsts.keyDisplay.contains(event.target)) {
    closeKey()
  }
})

document.addEventListener('DOMContentLoaded', function () {
  mapPageConsts.scenarioRadioButtons.forEach(function (radio) {
    radio.addEventListener('change', function () {
      const label = document.querySelector(`label[for="${this.id}"]`)
      if (label) {
        label.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    })
  })

  showOrHideAdvancedToggleText()
})

mapPageConsts.exitMapBtn.addEventListener('click', function () {
  const backLink = mapPageConsts.exitMapBtn.getAttribute('data-backlink')

  window.location.href = backLink
})

mapPageConsts.scenarioRadioButtons.forEach(function (radio) {
  if (radio.id.includes('depth')) {
    radio.addEventListener('change', function () {
      scenarioDisplayUpdate('depth')
    })
  } else {
    radio.addEventListener('change', function () {
      scenarioDisplayUpdate('velocity')
    })
  }
})

mapPageConsts.riskMeasurementRadio.forEach(function (radio) {
  let eventType
  let extentType

  if (radio.id.includes('sw-extent')) {
    eventType = 'extent'
    extentType = mapPageConsts.surfaceWater
  } else if (radio.id.includes('sw-depth')) {
    eventType = 'depth'
  } else if (radio.id.includes('sw-velocity')) {
    eventType = 'velocity'
  } else if (radio.id.includes('reservoirs')) {
    eventType = 'extent'
    extentType = 'reservoirs'
  } else if (radio.id.includes('rs-radio')) {
    eventType = 'extent'
    extentType = mapPageConsts.riversAndTheSea
  } else {
    console.log('No type selected.')
  }

  if (eventType) {
    radio.addEventListener('change', function () {
      handleRadioChange(eventType, extentType)
    })
  }
})

mapPageConsts.closeKeyBtn.addEventListener('click', closeKey)
mapPageConsts.openKeyBtn.addEventListener('click', function (event) {
  event.stopPropagation()
  openKey()
})

handleArrowClick(mapPageConsts.rightArrow, mapPageConsts.rightMove)
handleArrowClick(mapPageConsts.leftArrow, mapPageConsts.leftMove)

handleScroll(mapPageConsts.scenarioSelectionDepth, [mapPageConsts.rightArrow[0], mapPageConsts.leftArrow[0]])
handleScroll(mapPageConsts.scenarioSelectionVelocity, [mapPageConsts.rightArrow[1], mapPageConsts.leftArrow[1]])

const searchParams = new URLSearchParams(window.location.search)
const currentMapPage = searchParams.get('map')

function getInitialKeyOptions () {
  if (currentMapPage === 'SurfaceWater') {
    surfaceWaterInitialOptions()
  } else if (currentMapPage === 'RiversOrSea') {
    riversAndTheSeaInitialOptions()
  } else if (currentMapPage === 'Reservoirs') {
    reservoirsInitialOptions()
  } else {
    mapPageConsts.advancedToggle.classList.add('hide')
    mapPageConsts.selectedAddressInput.classList.add('hide')
  }
}

function surfaceWaterInitialOptions () {
  mapPageConsts.velocityContainer.classList.add('hide')
  mapPageConsts.rsContainer.classList.add('hide')
  mapPageConsts.reservoirsContainer.classList.add('hide')
}

function riversAndTheSeaInitialOptions () {
  mapPageConsts.swContainer.classList.add('hide')
  mapPageConsts.extentInfoSw.classList.add(mapPageConsts.extentDesc)
  mapPageConsts.rsContainer.classList.add(mapPageConsts.keyContainer)
  mapPageConsts.rsRadio.checked = true
  mapPageConsts.extentInfoRs.classList.remove(mapPageConsts.extentDesc)
  mapPageConsts.reservoirsContainer.classList.add('hide')
  mapPageConsts.boundaryContainer.classList.add('hide')
}

function reservoirsInitialOptions () {
  mapPageConsts.swContainer.classList.add('hide')
  mapPageConsts.extentInfoSw.classList.add(mapPageConsts.extentDesc)
  mapPageConsts.rsContainer.classList.add('hide')
  mapPageConsts.reservoirsContainer.classList.add(mapPageConsts.keyContainer)
  mapPageConsts.reservoirsRadio.checked = true
  mapPageConsts.extentInfoReservoirs.classList.remove(mapPageConsts.extentDesc)
  mapPageConsts.boundaryContainer.classList.add('hide')
}

window.onresize = adjustPosition
mapPage()
