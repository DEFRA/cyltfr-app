import { mapControlsConsts } from './constants'

export function selectedOption () {
  // The below const cannot be removed from the file otherwise it breaks reservoirs and rivers and the sea
  const measurementsRadios = document.querySelector('input[name="measurements"]:checked')
  const currentPageURL = new URLSearchParams(document.location.search)
  const mapPageQuery = currentPageURL.get('map')
  const keyTitleText = document.getElementById('mapKeyLabel')

  // The below is a placeholder ready to add the radio changes for climate change data
  if (keyTitleText.innerText.includes('Surface water')) {
    if (mapControlsConsts.extentRadioSw.checked) {
      return measurementsRadios.value
    }
    if (mapControlsConsts.depthRadio[0].checked) {
      if (mapControlsConsts.upTo30.checked) {
        return mapControlsConsts.upTo30.value
      }
      if (mapControlsConsts.upTo60.checked) {
        return mapControlsConsts.upTo60.value
      }
      if (mapControlsConsts.upTo90.checked) {
        return mapControlsConsts.upTo90.value
      }
      return mapControlsConsts.upTo20.value
    }
  } else if (mapPageQuery === 'RiversAndSea') {
    if (mapControlsConsts.extentRadioRs.checked) {
      return measurementsRadios.value
    }
  } else if (mapPageQuery === 'Reservoirs') {
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
