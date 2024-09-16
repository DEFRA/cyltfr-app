import { mapControlsConsts } from './constants'

export function selectedOption () {
  // The below const cannot be removed from the file otherwise it breaks reservoirs and rivers and the sea
  const measurementsRadios = document.querySelector('input[name="measurements"]:checked')

  if (mapControlsConsts.extentRadioSw.checked) {
    return measurementsRadios.value
  }
  return measurementsRadios.value
}

export function openKey () {
  mapControlsConsts.keyDisplay.classList.remove('hide')
  mapControlsConsts.openKeyBtn.classList.add('hide')
  mapControlsConsts.scenarioSelectionDepth.classList.add('hide')
  mapControlsConsts.scenarioSelectionVelocity.classList.add('hide')
}

export function closeKey () {
  mapControlsConsts.keyDisplay.classList.add('hide')

  if (mapControlsConsts.depthRadio.checked) {
    mapControlsConsts.scenarioBarDepth.classList.remove('hide')
    mapControlsConsts.scenarioSelectionDepth.classList.remove('hide')
    mapControlsConsts.scenarioSelectionDepth.style.top = null
  }

  if (mapControlsConsts.velocityRadio.checked) {
    mapControlsConsts.scenarioBarVelocity.classList.remove('hide')
    mapControlsConsts.scenarioSelectionVelocity.classList.remove('hide')
    mapControlsConsts.scenarioSelectionVelocity.style.top = null
  }

  const depthDisplay = window.getComputedStyle(mapControlsConsts.scenarioBarDepth).display
  const velocityDisplay = window.getComputedStyle(mapControlsConsts.scenarioBarVelocity).display

  mapControlsConsts.openKeyBtn.classList.remove('hide')

  if (depthDisplay === 'block' || velocityDisplay === 'block') {
    mapControlsConsts.osLogo.classList.add('os-logo-position-change')
  } else {
    mapControlsConsts.osLogo.classList.remove('os-logo-position-change')
  }
}
