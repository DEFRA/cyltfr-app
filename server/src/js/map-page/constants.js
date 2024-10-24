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
const depthRadioCC = document.getElementsByClassName('depth-radio-cc')

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
  depthRadioCC
}

export const mapControlsConsts = {
  keyDisplay,
  openKeyBtn,
  swExtentRadio,
  rsExtentRadio,
  reservoirsRadio,
  extentDesc,
  extentRadioSw,
  extentRadioRs
}
