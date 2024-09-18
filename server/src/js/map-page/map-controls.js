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

  mapControlsConsts.openKeyBtn.classList.remove('hide')
}
