import { mapControlsConsts } from './constants'

export function selectedOption () {
  const measurementsRadios = document.querySelector('input[name="measurements"]:checked')
  const currentPageURL = new URLSearchParams(document.location.search)
  const mapPageQuery = currentPageURL.get('map')
  const surfaceWaterContainer = document.getElementById('surfaceWaterContainer')
  const riversAndSeaContainer = document.getElementById('riversAndSeaContainer')
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
  if (!surfaceWaterContainer.classList.contains('hide') && !mapPageQuery) {
    if (mapControlsConsts.extentRadioSw.checked) return measurementsRadios.value
    const depthValue =
      getDepthValue(mapControlsConsts.depthRadio[0], mapControlsConsts.upTo30[0], mapControlsConsts.upTo60[0], mapControlsConsts.upTo90[0], mapControlsConsts.upTo20[0]) ||
      getDepthValue(mapControlsConsts.depthRadioCC[0], mapControlsConsts.upTo30Cc[0], mapControlsConsts.upTo60Cc[0], mapControlsConsts.upTo90Cc[0], mapControlsConsts.upTo20Cc[0])
    if (depthValue) return depthValue
  }

  // Check page for Rivers and the sea and no query in URL to show depth options
  if (!riversAndSeaContainer.classList.contains('hide') && !mapPageQuery) {
    if (mapControlsConsts.extentRadioRs.checked) return measurementsRadios.value
    const depthValue =
      getDepthValue(mapControlsConsts.depthRadio[1], mapControlsConsts.upTo30[1], mapControlsConsts.upTo60[1], mapControlsConsts.upTo90[1], mapControlsConsts.upTo20[1]) ||
      getDepthValue(mapControlsConsts.depthRadioCC[1], mapControlsConsts.upTo30Cc[1], mapControlsConsts.upTo60Cc[1], mapControlsConsts.upTo90Cc[1], mapControlsConsts.upTo20Cc[1])
    if (depthValue) return depthValue
  }

  // Check for Rivers and Sea or Reservoirs conditions
  if ((mapPageQuery === 'RiversAndSea' && mapControlsConsts.extentRadioRs.checked) ||
      (mapPageQuery === 'Reservoirs' && mapControlsConsts.reservoirsRadio.checked)) {
    return measurementsRadios.value
  }

  return measurementsRadios.value
}

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

export function openKey () {
  mapControlsConsts.keyDisplay.classList.remove('hide')
  mapControlsConsts.openKeyBtn.classList.add('hide')
  mapControlsConsts.scenarioSelectionDepth.classList.add('hide')
  mapControlsConsts.scenarioSelectionVelocity.classList.add('hide')
}

export function closeKey () {
  mapControlsConsts.keyDisplay.classList.add('hide')

  mapControlsConsts.openKeyBtn.classList.remove('hide')
}
