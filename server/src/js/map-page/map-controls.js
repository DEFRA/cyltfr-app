import { mapControlsConsts } from './constants'

export function selectedOption () {
  const measurementsRadios = document.querySelector('input[name="measurements"]:checked')
  const currentPageURL = new URLSearchParams(document.location.search)
  const mapPageQuery = currentPageURL.get('map')
  const keyTitleText = document.getElementById('mapKeyLabel')

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
  if (keyTitleText.innerText.includes('Surface water') && !mapPageQuery) {
    if (mapControlsConsts.extentRadioSw.checked) return measurementsRadios.value
    const depthValue =
      getDepthValue(mapControlsConsts.depthRadio[0], mapControlsConsts.upTo30, mapControlsConsts.upTo60, mapControlsConsts.upTo90, mapControlsConsts.upTo20) ||
      getDepthValue(mapControlsConsts.depthRadio[1], mapControlsConsts.upTo30Cc, mapControlsConsts.upTo60Cc, mapControlsConsts.upTo90Cc, mapControlsConsts.upTo20Cc)
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
