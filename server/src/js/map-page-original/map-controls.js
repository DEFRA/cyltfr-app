import { mapControlsConsts } from '../map-page/constants'

export function selectedOption () {
  // The below const cannot be removed from the file otherwise it breaks reservoirs and rivers and the sea
  const measurementsRadios = document.querySelector('input[name="measurements"]:checked')

  if (mapControlsConsts.extentRadioSw.checked) {
    return measurementsRadios.value
  }
  if (mapControlsConsts.extentRadioReservoirs.checked) {
    return measurementsRadios.value
  }
  if (mapControlsConsts.depthRadio.checked) {
    if (mapControlsConsts.mediumRadioDepth.checked) {
      return mapControlsConsts.mediumRadioDepth.value
    }
    if (mapControlsConsts.lowRadioDepth.checked) {
      return mapControlsConsts.lowRadioDepth.value
    }
    return mapControlsConsts.scenariosRadiosDepth.value
  }
  if (mapControlsConsts.velocityRadio.checked) {
    if (mapControlsConsts.mediumRadioVelocity.checked) {
      return mapControlsConsts.mediumRadioVelocity.value
    }
    if (mapControlsConsts.lowRadioVelocity.checked) {
      return mapControlsConsts.lowRadioVelocity.value
    }
    return mapControlsConsts.scenariosRadiosVelocity.value
  }
  return measurementsRadios.value
}

export function handleRadioChange (selected, type) {
  if (selected === 'depth') {
    depthRadioChanges()
  }
  if (selected === 'velocity') {
    velocityRadioChanges()
  }

  if (selected === 'extent') {
    if (type === 'reservoirs') {
      extentReservoirChanges()
    }
    if (type === mapControlsConsts.riversAndTheSea) {
      extentRiversAndTheSeaChanges()
    }
    if (type === mapControlsConsts.surfaceWater) {
      extentSurfaceWaterChanges()
    }
    mapControlsConsts.bottomCopyrightContainer.classList.remove('hide')
    mapControlsConsts.topCopyrightContainer.classList.add('hide')
  }
}

const searchParams = new URLSearchParams(window.location.search)
const currentMapPage = searchParams.get('map')

export function toggleAdvancedOptions () {
  if (window.innerWidth <= mapControlsConsts.deviceScreenWidth) {
    mapControlsConsts.keyDisplay.classList.remove('hide')
    mapControlsConsts.scenarioSelectionDepth.classList.add('hide')
    showOrHideAdvancedToggleText()
  }

  if (mapControlsConsts.advancedButtonText.textContent.includes('Show')) {
    mapControlsConsts.advancedButtonText.textContent = 'Hide advanced options'
    mapControlsConsts.advancedButtonImage.setAttribute('d', 'M20.515 15.126 12 19.856l-8.515-4.73-.971 1.748 9 5a1 1 0 0 0 .971 0l9-5zM16 4h6v2h-6zm5.484 7.125-9.022-5a1 1 0 0 0-.968-.001l-8.978 4.96a1 1 0 0 0-.003 1.749l9.022 5.04a.995.995 0 0 0 .973.001l8.978-5a1 1 0 0 0-.002-1.749z')
    mapControlsConsts.velocityContainer.classList.remove('hide')
    mapControlsConsts.swContainer.classList.remove('hide')
    mapControlsConsts.rsContainer.classList.remove('hide')
    mapControlsConsts.rsContainer.classList.add(mapControlsConsts.keyAdvOptionsContainer)
    mapControlsConsts.rsContainer.classList.remove(mapControlsConsts.keyContainer)
    mapControlsConsts.reservoirsContainer.classList.remove('hide')
    mapControlsConsts.reservoirsContainer.classList.add(mapControlsConsts.keyAdvOptionsContainer)
    mapControlsConsts.reservoirsContainer.classList.remove(mapControlsConsts.keyContainer)
  } else {
    if (currentMapPage === 'SurfaceWater') {
      mapControlsConsts.swContainer.classList.remove('hide')
      mapControlsConsts.velocityContainer.classList.add('hide')
      mapControlsConsts.rsContainer.classList.add('hide')
      mapControlsConsts.reservoirsContainer.classList.add('hide')
      mapControlsConsts.swExtentRadio.checked = true
      handleRadioChange('extent', mapControlsConsts.surfaceWater)
    }
    if (currentMapPage === 'RiversOrSea') {
      mapControlsConsts.swContainer.classList.add('hide')
      mapControlsConsts.velocityContainer.classList.add('hide')
      mapControlsConsts.rsContainer.classList.add(mapControlsConsts.keyContainer)
      mapControlsConsts.rsContainer.classList.remove(mapControlsConsts.keyAdvOptionsContainer)
      mapControlsConsts.rsExtentRadio.checked = true
      mapControlsConsts.reservoirsContainer.classList.add('hide')
      handleRadioChange('extent', mapControlsConsts.riversAndTheSea)
    }
    if (currentMapPage === 'Reservoirs') {
      mapControlsConsts.swContainer.classList.add('hide')
      mapControlsConsts.velocityContainer.classList.add('hide')
      mapControlsConsts.rsContainer.classList.add('hide')
      mapControlsConsts.reservoirsContainer.classList.add(mapControlsConsts.keyContainer)
      mapControlsConsts.reservoirsContainer.classList.remove(mapControlsConsts.keyAdvOptionsContainer)
      mapControlsConsts.reservoirsRadio.checked = true
      handleRadioChange('extent', 'reservoirs')
    }
    selectedOption()
    mapControlsConsts.advancedButtonText.textContent = 'Show advanced options'
    mapControlsConsts.advancedButtonImage.setAttribute('d', 'm3.485 15.126-.971 1.748 9 5a1 1 0 0 0 .971 0l9-5-.971-1.748L12 19.856ZM20 8V6h2V4h-2V2h-2v2h-2v2h2v2zM2.513 12.833l9.022 5.04a.995.995 0 0 0 .973.001l8.978-5a1 1 0 0 0-.002-1.749l-9.022-5a1 1 0 0 0-.968-.001l-8.978 4.96a1 1 0 0 0-.003 1.749z')
  }
}

export function showOrHideAdvancedToggleText () {
  if (window.innerWidth <= mapControlsConsts.deviceScreenWidth) {
    mapControlsConsts.advancedToggleText.classList.remove('hide')
  }
  if (window.innerWidth <= mapControlsConsts.advancedToggleCutoff && mapControlsConsts.keyDisplay.style.display === 'block') {
    mapControlsConsts.advancedToggleText.classList.add('hide')
  }
}

export function openKey () {
  mapControlsConsts.keyDisplay.classList.remove('hide')
  mapControlsConsts.openKeyBtn.classList.add('hide')
  mapControlsConsts.scenarioSelectionDepth.classList.add('hide')
  mapControlsConsts.scenarioSelectionVelocity.classList.add('hide')
  showOrHideAdvancedToggleText()
}

export function closeKey () {
  mapControlsConsts.keyDisplay.classList.add('hide')
  if (searchParams) {
    mapControlsConsts.advancedToggle.classList.add(mapControlsConsts.keyAdvButtonDisplay)
  }

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

  if (window.innerWidth <= mapControlsConsts.deviceScreenWidth) {
    mapControlsConsts.advancedToggleText.classList.remove('hide')
  }
}

function depthRadioChanges () {
  mapControlsConsts.extentInfoRs.classList.add(mapControlsConsts.extentDesc)
  mapControlsConsts.extentInfoReservoirs.classList.add(mapControlsConsts.extentDesc)
  mapControlsConsts.extentInfoSw.classList.add(mapControlsConsts.extentDesc)
  mapControlsConsts.depthInfo.classList.remove('hide')
  mapControlsConsts.velocityInfo.classList.add('hide')
  mapControlsConsts.scenarioBarDepth.classList.remove('hide')
  mapControlsConsts.scenarioSelectionDepth.classList.remove('hide')
  mapControlsConsts.scenarioBarVelocity.classList.add('hide')
  if (window.innerWidth <= mapControlsConsts.deviceScreenWidth) {
    mapControlsConsts.scenarioSelectionDepth.classList.add('hide')
    mapControlsConsts.scenarioSelectionVelocity.classList.add('hide')
    mapControlsConsts.bottomCopyrightContainer.classList.add('hide')
    mapControlsConsts.topCopyrightContainer.classList.remove('hide')
  }
}

function velocityRadioChanges () {
  mapControlsConsts.extentInfoRs.classList.add(mapControlsConsts.extentDesc)
  mapControlsConsts.extentInfoReservoirs.classList.add(mapControlsConsts.extentDesc)
  mapControlsConsts.extentInfoSw.classList.add(mapControlsConsts.extentDesc)
  mapControlsConsts.depthInfo.classList.add('hide')
  mapControlsConsts.velocityInfo.classList.remove('hide')
  mapControlsConsts.scenarioBarDepth.classList.add('hide')
  mapControlsConsts.scenarioBarVelocity.classList.remove('hide')
  mapControlsConsts.scenarioSelectionVelocity.classList.remove('hide')
  mapControlsConsts.topCopyrightContainer.classList.add('hide')
  mapControlsConsts.bottomCopyrightContainer.classList.remove('hide')
  if (window.innerWidth <= mapControlsConsts.deviceScreenWidth && mapControlsConsts.keyDisplay.style.display === 'block') {
    mapControlsConsts.scenarioSelectionVelocity.classList.add('hide')
  }
  if (window.innerWidth <= mapControlsConsts.deviceScreenWidth) {
    mapControlsConsts.bottomCopyrightContainer.classList.add('hide')
    mapControlsConsts.topCopyrightContainer.classList.remove('hide')
  }
  if (window.innerWidth <= mapControlsConsts.deviceScreenWidth) {
    mapControlsConsts.bottomCopyrightContainer.classList.add('hide')
    mapControlsConsts.topCopyrightContainer.classList.remove('hide')
  }
}

function extentReservoirChanges () {
  mapControlsConsts.extentInfoRs.classList.add(mapControlsConsts.extentDesc)
  mapControlsConsts.extentInfoReservoirs.classList.remove(mapControlsConsts.extentDesc)
  mapControlsConsts.extentInfoSw.classList.add(mapControlsConsts.extentDesc)
  mapControlsConsts.depthInfo.classList.add('hide')
  mapControlsConsts.velocityInfo.classList.add('hide')
  mapControlsConsts.scenarioBarDepth.classList.add('hide')
  mapControlsConsts.scenarioBarVelocity.classList.add('hide')
  mapControlsConsts.boundaryContainer.classList.add('hide')
}

function extentRiversAndTheSeaChanges () {
  mapControlsConsts.extentInfoRs.classList.remove(mapControlsConsts.extentDesc)
  mapControlsConsts.extentInfoReservoirs.classList.add(mapControlsConsts.extentDesc)
  mapControlsConsts.extentInfoSw.classList.add(mapControlsConsts.extentDesc)
  mapControlsConsts.depthInfo.classList.add('hide')
  mapControlsConsts.velocityInfo.classList.add('hide')
  mapControlsConsts.scenarioBarDepth.classList.add('hide')
  mapControlsConsts.scenarioBarVelocity.classList.add('hide')
  mapControlsConsts.boundaryContainer.classList.add('hide')
}

function extentSurfaceWaterChanges () {
  mapControlsConsts.extentInfoRs.classList.add(mapControlsConsts.extentDesc)
  mapControlsConsts.extentInfoReservoirs.classList.add(mapControlsConsts.extentDesc)
  mapControlsConsts.extentInfoSw.classList.remove(mapControlsConsts.extentDesc)
  mapControlsConsts.depthInfo.classList.add('hide')
  mapControlsConsts.velocityInfo.classList.add('hide')
  mapControlsConsts.scenarioBarDepth.classList.add('hide')
  mapControlsConsts.scenarioBarVelocity.classList.add('hide')
  mapControlsConsts.boundaryContainer.classList.remove('hide')
}
