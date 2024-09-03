import { showOrHideAdvancedToggleText } from './map-controls'
import { screenAdjustConsts } from './constants'

export function adjustPosition () {
  adjustLogoAndCopyright()
  keyToggleAdjustments()
  scenarioBarAdjustments()
  zoomBtnAdjustments()
  showOrHideAdvancedToggleText()
}

function adjustLogoAndCopyright () {
  if ((!screenAdjustConsts.scenarioBarDepth.classList.contains('hide') || !screenAdjustConsts.scenarioBarVelocity.classList.contains('hide')) &&
  window.innerWidth <= screenAdjustConsts.deviceScreenWidth) {
    screenAdjustConsts.osLogo.classList.add('os-logo-position-change')
    screenAdjustConsts.bottomCopyrightContainer.classList.add('hide')
    screenAdjustConsts.topCopyrightContainer.classList.remove('hide')
  } else {
    screenAdjustConsts.osLogo.classList.remove('os-logo-position-change')
    screenAdjustConsts.bottomCopyrightContainer.classList.remove('hide')
    screenAdjustConsts.topCopyrightContainer.classList.add('hide')
  }
}

const searchParams = new URLSearchParams(window.location.search)
const currentMapPage = searchParams.get('map')

function keyToggleAdjustments () {
  if (!screenAdjustConsts.keyDisplay.classList.contains('hide') && window.innerWidth <= screenAdjustConsts.deviceScreenWidth) {
    screenAdjustConsts.scenarioSelectionDepth.classList.add('hide')
    screenAdjustConsts.scenarioSelectionVelocity.classList.add('hide')
  } else if (!screenAdjustConsts.keyDisplay.classList.contains('hide') && window.innerWidth > screenAdjustConsts.deviceScreenWidth) {
    if (currentMapPage === 'RiversOrSea' ||
    currentMapPage === 'SurfaceWater' ||
    currentMapPage === 'Reservoirs') {
      screenAdjustConsts.advancedToggle.classList.add(screenAdjustConsts.keyAdvButtonDisplay)
    }
    if (screenAdjustConsts.depthRadio.checked) {
      screenAdjustConsts.scenarioSelectionDepth.classList.remove('hide')
    }
    if (screenAdjustConsts.velocityRadio.checked) {
      screenAdjustConsts.scenarioSelectionVelocity.classList.remove('hide')
    }
  }
}

function scenarioBarAdjustments () {
  if (screenAdjustConsts.depthRadio.checked && window.innerWidth > screenAdjustConsts.deviceScreenWidth) {
    screenAdjustConsts.scenarioSelectionDepth.classList.remove('hide')
  } else if (screenAdjustConsts.velocityRadio.checked && window.innerWidth > screenAdjustConsts.deviceScreenWidth) {
    screenAdjustConsts.scenarioSelectionVelocity.classList.remove('hide')
  }
}

function zoomBtnAdjustments () {
  if ((screenAdjustConsts.scenarioBarDepth.style.display === 'block' ||
  screenAdjustConsts.scenarioBarVelocity.style.display === 'block') &&
  window.innerWidth <= screenAdjustConsts.deviceScreenWidth
  ) {
    screenAdjustConsts.zoomBtns[0].classList.add(screenAdjustConsts.olZoomChecked)
  }
}
