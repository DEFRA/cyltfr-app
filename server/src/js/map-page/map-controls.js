import { mapControlsConsts } from './constants'

export function selectedOption () {
  // The below const cannot be removed from the file otherwise it breaks reservoirs and rivers and the sea
  const measurementsRadios = document.querySelector('input[name="measurements"]:checked')
  const currentPageURL = new URLSearchParams(document.location.search)
  const mapPageQuery = currentPageURL.get('map')

  // The below is a placeholder ready to add the radio changes for climate change data
  if (mapPageQuery === 'SurfaceWater') {
    if (mapControlsConsts.extentRadioSw.checked) {
      return measurementsRadios.value
    }
  } else if (mapPageQuery === 'RiversAndSea') {
    if (mapControlsConsts.extentRadioRs.checked) {
      return measurementsRadios.value
    }
  } else {
    if (mapControlsConsts.reservoirsRadio.checked) {
      return measurementsRadios.value
    }
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
