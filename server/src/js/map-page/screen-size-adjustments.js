import { screenAdjustConsts } from './constants'

export function adjustPosition () {
  adjustLogoAndCopyright()
  zoomBtnAdjustments()
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

function zoomBtnAdjustments () {
  if ((screenAdjustConsts.scenarioBarDepth.style.display === 'block' ||
  screenAdjustConsts.scenarioBarVelocity.style.display === 'block') &&
  window.innerWidth <= screenAdjustConsts.deviceScreenWidth
  ) {
    screenAdjustConsts.zoomBtns[0].classList.add(screenAdjustConsts.olZoomChecked)
  }
}
