const closeKeyBtn = document.getElementById('close-key')
const exitMapBtn = document.getElementById('exit-map')
const keyDisplay = document.getElementById('map-key')
const maps = window.maps
const openKeyBtn = document.getElementById('open-key')
const reservoirsRadio = document.getElementById('reservoirs-radio')
const riskMeasurementRadio = document.querySelectorAll('.risk-measurement')
const swExtentRadio = document.getElementById('sw-extent-radio')
const rsExtentRadio = document.getElementById('rs-radio')
const extentRadioSw = document.getElementById('sw-extent-radio')
const extentRadioRs = document.getElementById('rs-extent-radio')
const keyContainer = 'key-container'
const extentDesc = 'extent-desc-container'
const selectedAddressCheckbox = document.getElementById('selected-address')
const extentDescContainer = document.getElementsByClassName('extent-desc-container')
const extentDescCcContainer = document.getElementsByClassName('extent-desc-container-cc')
const extentRadio = document.getElementsByClassName('extent-radio')
const extentRadioCC = document.getElementById('extent-radio-cc')
const depthDescContainer = document.getElementsByClassName('depth-desc-container')
const depthDescCcContainer = document.getElementsByClassName('depth-desc-container-cc')
const depthRadio = document.getElementsByClassName('depth-radio')
const depthRadioCC = document.getElementById('depth-radio-cc')
const depthScenarioBar = document.getElementsByClassName('defra-map-scenarios-v3_container')
const depthScenarioBarCc = document.getElementsByClassName('defra-map-scenarios-v3_container-cc')
const rsAndResOptions = document.getElementById('rs-res-container')
const scenarioRadioButtons = document.querySelectorAll('.scenario-radio-button')
const upTo20 = document.getElementById('up-to-20')
const upTo30 = document.getElementById('up-to-30')
const upTo60 = document.getElementById('up-to-60')
const upTo90 = document.getElementById('up-to-90')
const upTo20Cc = document.getElementById('up-to-20-cc')
const upTo30Cc = document.getElementById('up-to-30-cc')
const upTo60Cc = document.getElementById('up-to-60-cc')
const upTo90Cc = document.getElementById('up-to-90-cc')
const params = window.location.search

export const mapPageConsts = {
  closeKeyBtn,
  exitMapBtn,
  keyDisplay,
  openKeyBtn,
  maps,
  riskMeasurementRadio,
  keyContainer,
  extentDesc,
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
  params
}

export const mapControlsConsts = {
  keyDisplay,
  openKeyBtn,
  swExtentRadio,
  rsExtentRadio,
  reservoirsRadio,
  extentDesc,
  extentRadioSw,
  extentRadioRs,
  depthRadio,
  upTo20,
  upTo30,
  upTo60,
  upTo90,
  upTo20Cc,
  upTo30Cc,
  upTo60Cc,
  upTo90Cc
}
