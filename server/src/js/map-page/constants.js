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

export const mapPageConsts = {
  closeKeyBtn,
  exitMapBtn,
  keyDisplay,
  openKeyBtn,
  maps,
  riskMeasurementRadio,
  keyContainer,
  extentDesc,
  selectedAddressCheckbox
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
