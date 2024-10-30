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
      console.log('in depth')
      return mapControlsConsts.upTo20.value
    }
    if (mapControlsConsts.depthRadio[1].checked) {
      console.log('in cc')
      console.log('mapControlsConsts.upTo30Cc ', mapControlsConsts.upTo30Cc)
      console.log('mapControlsConsts.upTo30Cc.checked ', mapControlsConsts.upTo30Cc.checked)
      if (mapControlsConsts.upTo30Cc.checked) {
        console.log('in 30cc')
        return mapControlsConsts.upTo30Cc.value
      }
      if (mapControlsConsts.upTo60Cc.checked) {
        console.log('in 60cc')
        return mapControlsConsts.upTo60Cc.value
      }
      if (mapControlsConsts.upTo90Cc.checked) {
        console.log('in 90cc')
        return mapControlsConsts.upTo90Cc.value
      }
      console.log('outside cc')
      return mapControlsConsts.upTo20Cc.value
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
