const closeKeyBtn = document.getElementById('close-key')
const exitMapBtn = document.getElementById('exit-map')
const keyDisplay = document.getElementById('map-key')
const maps = window.maps
const openKeyBtn = document.getElementById('open-key')
const riskMeasurementRadio = document.querySelectorAll('.risk-measurement')
const extentRadioSw = document.getElementById('sw-extent-radio')
const extentRadioRs = document.getElementById('rs-extent-radio')
const keyContainer = 'key-container'
const selectedAddressCheckbox = document.getElementById('selected-address')
const extentDescContainer = document.getElementsByClassName('extent-desc-container')
const extentDescCcContainer = document.getElementsByClassName('extent-desc-container-cc')
const extentRadio = document.getElementsByClassName('extent-radio')
const extentRadioCC = document.getElementsByClassName('extent-radio-cc')
const depthDescContainer = document.getElementsByClassName('depth-desc-container')
const depthDescCcContainer = document.getElementsByClassName('depth-desc-container-cc')
const depthRadio = document.getElementsByClassName('depth-radio')
const depthRadioCC = document.getElementsByClassName('depth-radio-cc')
const depthScenarioBar = document.getElementsByClassName('defra-map-scenarios-v3_container')
const depthScenarioBarCc = document.getElementsByClassName('defra-map-scenarios-v3_container-cc')
const rsAndResOptions = document.getElementById('rs-res-container')
const scenarioRadioButtons = document.querySelectorAll('.scenario-radio-button')
const techMapOptions = document.querySelectorAll('.tech-map-option')
const techMapKeys = document.querySelectorAll('.tech-map-key')
const reservoirsExtent = document.getElementById('reservoirs-radio')
const surfaceWaterContainer = document.getElementById('surfaceWaterContainer')
const riversAndSeaContainer = document.getElementById('riversAndSeaContainer')
const upTo20 = document.getElementsByClassName('up-to-20-radio')
const upTo30 = document.getElementsByClassName('up-to-30-radio')
const upTo60 = document.getElementsByClassName('up-to-60-radio')
const upTo90 = document.getElementsByClassName('up-to-90-radio')
const upTo20Cc = document.getElementsByClassName('up-to-20-cc-radio')
const upTo30Cc = document.getElementsByClassName('up-to-30-cc-radio')
const upTo60Cc = document.getElementsByClassName('up-to-60-cc-radio')
const upTo90Cc = document.getElementsByClassName('up-to-90-cc-radio')
const params = window.location.search
const currentPageURL = new URLSearchParams(document.location.search)
const mapPageQuery = currentPageURL.get('map')

export const mapPageConsts = {
  closeKeyBtn,
  exitMapBtn,
  keyDisplay,
  openKeyBtn,
  maps,
  riskMeasurementRadio,
  keyContainer,
  selectedAddressCheckbox,
  extentDescContainer,
  extentDescCcContainer,
  extentRadio,
  extentRadioCC,
  depthDescContainer,
  depthDescCcContainer,
  depthRadio,
  depthRadioCC,
  depthScenarioBar,
  depthScenarioBarCc,
  rsAndResOptions,
  scenarioRadioButtons,
  techMapOptions,
  techMapKeys,
  extentRadioSw,
  extentRadioRs,
  reservoirsExtent,
  upTo20,
  upTo20Cc,
  params
}

export const mapControlsConsts = {
  keyDisplay,
  openKeyBtn,
  reservoirsExtent,
  extentRadioSw,
  extentRadioRs,
  depthRadio,
  depthRadioCC,
  surfaceWaterContainer,
  riversAndSeaContainer,
  mapPageQuery,
  upTo20,
  upTo30,
  upTo60,
  upTo90,
  upTo20Cc,
  upTo30Cc,
  upTo60Cc,
  upTo90Cc
}
