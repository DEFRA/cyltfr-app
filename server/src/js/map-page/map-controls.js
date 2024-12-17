import { mapControlsConsts } from './constants'

// Function that returns the name value of the maps.json required to get the correct query and update the map tiles
export function selectedOption () {
  const measurementsRadios = document.querySelector('input[name="measurements"]:checked')
  // Helper function to check depth conditions and return corresponding values
  const getDepthValue = (depthRadio, upTo30, upTo60, upTo90, defaultValue) => {
    if (depthRadio.checked) {
      if (upTo30.checked) return upTo30.value
      if (upTo60.checked) return upTo60.value
      if (upTo90.checked) return upTo90.value
      return defaultValue.value
    }
  }

  // Check page for Surface water and no query in URL to show depth options
  if (!mapControlsConsts.mapPageQuery) {
    if (!mapControlsConsts.surfaceWaterContainer.classList.contains('hide')) {
      if (mapControlsConsts.extentRadioSw.checked) return measurementsRadios.value
      const depthValue =
        getDepthValue(mapControlsConsts.depthRadio[0], mapControlsConsts.upTo30[0], mapControlsConsts.upTo60[0], mapControlsConsts.upTo90[0], mapControlsConsts.upTo20[0]) ||
        getDepthValue(mapControlsConsts.depthRadioCC[0], mapControlsConsts.upTo30Cc[0], mapControlsConsts.upTo60Cc[0], mapControlsConsts.upTo90Cc[0], mapControlsConsts.upTo20Cc[0])
      if (depthValue) return depthValue
    }
  }

  // Check page for Rivers and the sea and no query in URL to show depth options
  if (!mapControlsConsts.mapPageQuery) {
    if (!mapControlsConsts.riversAndSeaContainer.classList.contains('hide')) {
      if (mapControlsConsts.extentRadioRs.checked) return measurementsRadios.value
      const depthValue =
        getDepthValue(mapControlsConsts.depthRadio[1], mapControlsConsts.upTo30[1], mapControlsConsts.upTo60[1], mapControlsConsts.upTo90[1], mapControlsConsts.upTo20[1]) ||
        getDepthValue(mapControlsConsts.depthRadioCC[1], mapControlsConsts.upTo30Cc[1], mapControlsConsts.upTo60Cc[1], mapControlsConsts.upTo90Cc[1], mapControlsConsts.upTo20Cc[1])
      if (depthValue) return depthValue
    }
  }

  // Check for Rivers and Sea or Reservoirs conditions
  if ((mapControlsConsts.mapPageQuery === 'RiversOrSea' && mapControlsConsts.extentRadioRs.checked) ||
      (mapControlsConsts.mapPageQuery === 'Reservoirs' && mapControlsConsts.reservoirsExtent.checked)) {
    return measurementsRadios.value
  }

  return measurementsRadios.value
}

// Function to update the display of the scenarios
export function scenarioDisplayUpdate (scenarioBar) {
  const scenariosRadios = document.querySelectorAll(`input[name="scenarios-${scenarioBar}"]`)
  scenariosRadios.forEach(radio => {
    const parent = radio.parentNode
    const scenarioHeading = parent.querySelector('.scenario-heading')
    if (radio.checked) {
      parent.style.borderBottom = '7px solid rgb(29, 112, 184)'
      scenarioHeading.style.textDecoration = 'none'
    } else {
      parent.style.borderBottom = 'none'
      scenarioHeading.style.textDecoration = 'underline'
      scenarioHeading.style.textDecorationThickness = '2px'
    }
  })
}

// Function to update the map interface once the open key button is pressed on a device
export function openKey () {
  mapControlsConsts.keyDisplay.classList.remove('hide')
  mapControlsConsts.openKeyBtn.classList.add('hide')
}

// Function to close the key display on a device
export function closeKey () {
  mapControlsConsts.keyDisplay.classList.add('hide')
  mapControlsConsts.openKeyBtn.classList.remove('hide')
}
