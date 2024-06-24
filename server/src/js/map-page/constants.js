const advancedToggle = document.getElementById('advanced-key-button')
const boundaryContainer = document.getElementById('boundary-container')
const closeKeyBtn = document.getElementById('close-key')
const exitMapBtn = document.getElementById('exit-map')
const extentInfoReservoirs = document.getElementById('reservoirs-extent-desc-container')
const extentInfoRs = document.getElementById('rs-extent-desc-container')
const extentInfoSw = document.getElementById('sw-extent-desc-container')
const keyDisplay = document.getElementById('map-key')
const leftArrow = document.getElementsByClassName('left-scenario-arrow')
const maps = window.maps
const openKeyBtn = document.getElementById('open-key')
const reservoirsContainer = document.getElementById('reservoirs-section-container')
const reservoirsRadio = document.getElementById('reservoirs-radio')
const rightArrow = document.getElementsByClassName('right-scenario-arrow')
const riskMeasurementRadio = document.querySelectorAll('.risk-measurement')
const riversAndTheSea = 'rivers and the sea'
const rsContainer = document.getElementById('rs-section-container')
const rsRadio = document.getElementById('rs-radio')
const selectedAddressInput = document.getElementById('selected-address')
const scenarioRadioButtons = document.querySelectorAll('.scenario-radio-button')
const scenarioSelectionDepth = document.getElementById('scenario-selection-depth')
const scenarioSelectionVelocity = document.getElementById('scenario-selection-velocity')
const surfaceWater = 'surface water'
const swContainer = document.getElementById('sw-section-container')
const velocityContainer = document.getElementById('sw-velocity-section-container')
const scenarioBarDepth = document.getElementById('scenario-container-depth')
const scenarioBarVelocity = document.getElementById('scenario-container-velocity')
const osLogo = document.getElementById('os-logo')
const depthInfo = document.getElementById('sw-depth-desc-container')
const velocityInfo = document.getElementById('sw-velocity-desc-container')
const olZoom = document.getElementsByClassName('ol-zoom')
const topCopyrightContainer = document.getElementById('copyright-info-container-top')
const bottomCopyrightContainer = document.getElementById('copyright-info-container-bottom')

const advancedToggleText = document.getElementById('advanced-button-text')
const deviceScreenWidth = 768
const advancedToggleCutoff = 510
const advancedButtonText = document.getElementById('advanced-button-text')
const advancedButtonImage = document.getElementById('advanced-button-image')
const swExtentRadio = document.getElementById('sw-extent-radio')
const rsExtentRadio = document.getElementById('rs-radio')
const zoomBtns = document.getElementsByClassName('ol-control')

const scenariosRadiosDepth = document.querySelector('input[name="scenarios-depth"]:checked')
const scenariosRadiosVelocity = document.querySelector('input[name="scenarios-velocity"]:checked')

const extentRadioReservoirs = document.getElementById('reservoirs-radio')
const extentRadioSw = document.getElementById('sw-extent-radio')
const depthRadio = document.getElementById('sw-depth-radio')
const velocityRadio = document.getElementById('sw-velocity-radio')

const mediumRadioDepth = document.getElementById('risk-radio-medium-depth')
const lowRadioDepth = document.getElementById('risk-radio-low-depth')
const mediumRadioVelocity = document.getElementById('risk-radio-medium-velocity')
const lowRadioVelocity = document.getElementById('risk-radio-low-velocity')

const rightMove = 150
const leftMove = -150

const keyContainer = 'key-container'
const keyAdvOptionsContainer = 'key-adv-options-container'
const extentDesc = 'extent-desc-container'
const keyAdvButtonDisplay = 'key-adv-button-display'
const olZoomChecked = 'ol-zoom-checked'

export const mapPageConsts = {
  advancedToggle,
  boundaryContainer,
  closeKeyBtn,
  deviceScreenWidth,
  exitMapBtn,
  extentInfoReservoirs,
  extentInfoRs,
  extentInfoSw,
  keyDisplay,
  leftArrow,
  maps,
  openKeyBtn,
  reservoirsContainer,
  reservoirsRadio,
  rightArrow,
  riskMeasurementRadio,
  riversAndTheSea,
  rsContainer,
  rsRadio,
  selectedAddressInput,
  scenarioRadioButtons,
  scenarioSelectionDepth,
  scenarioSelectionVelocity,
  surfaceWater,
  swContainer,
  velocityContainer,
  rightMove,
  leftMove,
  keyContainer,
  extentDesc
}

export const mapControlsConsts = {
  scenarioBarDepth,
  scenarioBarVelocity,
  osLogo,
  keyDisplay,
  openKeyBtn,
  scenarioSelectionDepth,
  scenarioSelectionVelocity,
  advancedToggle,
  advancedToggleText,
  deviceScreenWidth,
  advancedToggleCutoff,
  advancedButtonText,
  advancedButtonImage,
  velocityContainer,
  swContainer,
  rsContainer,
  reservoirsContainer,
  swExtentRadio,
  rsExtentRadio,
  reservoirsRadio,
  surfaceWater,
  riversAndTheSea,
  extentInfoRs,
  extentInfoReservoirs,
  extentInfoSw,
  depthInfo,
  velocityInfo,
  boundaryContainer,
  olZoom,
  olZoomChecked,
  topCopyrightContainer,
  bottomCopyrightContainer,
  depthRadio,
  velocityRadio,
  scenariosRadiosDepth,
  scenariosRadiosVelocity,
  extentRadioReservoirs,
  extentRadioSw,
  mediumRadioDepth,
  lowRadioDepth,
  mediumRadioVelocity,
  lowRadioVelocity,
  keyContainer,
  keyAdvOptionsContainer,
  extentDesc,
  keyAdvButtonDisplay
}

export const screenAdjustConsts = {
  scenarioSelectionDepth,
  scenarioSelectionVelocity,
  advancedToggle,
  deviceScreenWidth,
  zoomBtns,
  olZoomChecked,
  scenarioBarDepth,
  scenarioBarVelocity,
  depthRadio,
  velocityRadio,
  osLogo,
  topCopyrightContainer,
  bottomCopyrightContainer,
  keyDisplay,
  keyAdvButtonDisplay
}
