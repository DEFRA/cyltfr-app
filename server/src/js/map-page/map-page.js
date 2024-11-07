import { openKey, closeKey, selectedOption, scenarioDisplayUpdate } from './map-controls.js'
import { mapPageConsts } from './constants.js'

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

  // This function updates the map to the radio button you select (extent, depth, depth CC)
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
        measurement.name === 'scenarios-depth-cc' ||
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

  // Function to update tech map visible options
  mapPageConsts.techMapOptions.forEach((optionBtn) => {
    const techMapMapping = {
      0: 'Surface water',
      1: 'Rivers and the sea',
      2: 'Reservoirs'
    }
    optionBtn.addEventListener('click', () => {
      // Reset visibility of all options and keys
      mapPageConsts.techMapOptions.forEach((option) => option.classList.remove('hide'))
      mapPageConsts.techMapKeys.forEach((key) => key.classList.add('hide'))

      // Find index based on button text and update visibility, also update tiles with change of radio
      for (const [index, text] of Object.entries(techMapMapping)) {
        if (optionBtn.innerHTML.includes(text)) {
          mapPageConsts.techMapOptions[index].classList.add('hide')
          mapPageConsts.techMapKeys[index].classList.remove('hide')
          updateRadioOnOptionChange(text)
          setCurrent(selectedOption())
          hideDescriptions()
          showSelectedDescription()
          break
        }
      }
    })
  })

  // ensures mouse cursor returns to default if feature was at edge of map
  map.addEventListener('mouseleave', function () {
    body.style.cursor = 'default'
  })
}

// Close key when clicking on map when on device
document.addEventListener('click', function (event) {
  if (mapPageConsts.keyDisplay.style.display === 'block' && !mapPageConsts.keyDisplay.contains(event.target)) {
    closeKey()
  }
})

const currentPageURL = new URLSearchParams(document.location.search)
const mapPageQuery = currentPageURL.get('map')
// Show or hide depth scenario bars and relevant description containers
mapPageConsts.riskMeasurementRadio.forEach(function (radio) {
  radio.addEventListener('change', () => {
    hideDescriptions()
    showSelectedDescription()
  })
})

// Assign value to exit map button depending on page
mapPageConsts.exitMapBtn.addEventListener('click', function () {
  const backLink = mapPageConsts.exitMapBtn.getAttribute('data-backlink')
  window.location.href = backLink
})

// Close and open key assignments
mapPageConsts.closeKeyBtn.addEventListener('click', closeKey)
mapPageConsts.openKeyBtn.addEventListener('click', function (event) {
  event.stopPropagation()
  openKey()
})

// Resetting all desc and scenario bars to hide
const hideDescriptions = function () {
  mapPageConsts.extentDescCcContainer[0].classList.add('hide')
  mapPageConsts.extentDescContainer[0].classList.add('hide')
  mapPageConsts.extentDescCcContainer[1].classList.add('hide')
  mapPageConsts.extentDescContainer[1].classList.add('hide')
  if (!mapPageQuery) {
    mapPageConsts.depthDescCcContainer[0].classList.add('hide')
    mapPageConsts.depthDescContainer[0].classList.add('hide')
    mapPageConsts.depthDescCcContainer[1].classList.add('hide')
    mapPageConsts.depthDescContainer[1].classList.add('hide')
    mapPageConsts.depthScenarioBarCc[0].classList.add('hide')
    mapPageConsts.depthScenarioBar[0].classList.add('hide')
    mapPageConsts.depthScenarioBarCc[1].classList.add('hide')
    mapPageConsts.depthScenarioBar[1].classList.add('hide')
  }
}

// Showing descriptions and scenario bars
const showSelectedDescription = function () {
  if (mapPageConsts.extentRadioCC[0].checked) {
    mapPageConsts.extentDescCcContainer[0].classList.remove('hide')
  }
  if (mapPageConsts.extentRadio[0].checked) {
    mapPageConsts.extentDescContainer[0].classList.remove('hide')
  }
  if (mapPageConsts.extentRadioCC[1].checked) {
    mapPageConsts.extentDescCcContainer[1].classList.remove('hide')
  }
  if (mapPageConsts.extentRadio[1].checked) {
    mapPageConsts.extentDescContainer[1].classList.remove('hide')
  }
  if (!mapPageQuery) {
    // Surface water scenario bars
    if (mapPageConsts.depthRadio[0].checked) {
      mapPageConsts.depthDescContainer[0].classList.remove('hide')
      mapPageConsts.depthScenarioBar[0].classList.remove('hide')
    }
    if (mapPageConsts.depthRadioCC[0].checked) {
      mapPageConsts.depthDescCcContainer[0].classList.remove('hide')
      mapPageConsts.depthScenarioBarCc[0].classList.remove('hide')
    }
    // Rivers and sea scenario bars
    if (mapPageConsts.depthRadio[1].checked) {
      mapPageConsts.depthDescContainer[1].classList.remove('hide')
      mapPageConsts.depthScenarioBar[1].classList.remove('hide')
    }
    if (mapPageConsts.depthRadioCC[1].checked) {
      mapPageConsts.depthDescCcContainer[1].classList.remove('hide')
      mapPageConsts.depthScenarioBarCc[1].classList.remove('hide')
    }
  }
}

// Get depth scenario API names
mapPageConsts.scenarioRadioButtons.forEach(function (radio) {
  if (radio.id.includes('-cc')) {
    radio.addEventListener('change', function () {
      scenarioDisplayUpdate('depth-cc')
    })
  } else {
    radio.addEventListener('change', function () {
      scenarioDisplayUpdate('depth')
    })
  }
})

// Tech map should show key options selectors but not select address checkbox
if (!mapPageConsts.params.includes('map=')) {
  mapPageConsts.rsAndResOptions.classList.remove('hide')
  mapPageConsts.selectedAddressCheckbox.classList.add('hide')
}

const updateRadioOnOptionChange = function (text) {
  if (text === 'Surface water') {
    mapPageConsts.extentRadioSw.checked = true
  }
  if (text === 'Rivers and the sea') {
    mapPageConsts.extentRadioRs.checked = true
  }
  if (text === 'Reservoirs') {
    mapPageConsts.reservoirsExtent.checked = true
  }
}

mapPage()
