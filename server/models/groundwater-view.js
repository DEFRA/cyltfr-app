const { capitaliseAddress } = require('../services/address.js')
const RiskViewModel = require('./risk-view')

function groundwaterViewModel (gwRisk, risk, address, backLinkUri) {
  const reservoirDryRisk = !!(gwRisk.reservoirDryRisk?.length)
  const reservoirWetRisk = !!(gwRisk.reservoirWetRisk?.length)
  const riskView = new RiskViewModel(risk, address, backLinkUri)
  const reservoirRisk = reservoirDryRisk || reservoirWetRisk

  this.surfaceWaterIsFirst = riskView.surfaceWaterIsFirst
  this.reservoirRisk = reservoirRisk
  this.backLink = backLinkUri

  if (reservoirRisk) {
    processReservoirs.call(this, reservoirDryRisk, gwRisk, reservoirWetRisk)
  }

  // Groundwater area
  this.isGroundwaterArea = gwRisk.isGroundwaterArea
  this.easting = address.x
  this.northing = address.y
  this.postcode = address.postcode
  this.lines = address.address.split(', ')
  this.address = address
  this.fullAddress = capitaliseAddress(address.address)
  this.date = Date.now()
  this.year = new Date().getFullYear()

  this.testInfo = JSON.stringify({
    isGroundwaterArea: gwRisk.isGroundwaterArea
  })
}

module.exports = groundwaterViewModel

function processReservoirs (reservoirDryRisk, risk, reservoirWetRisk) {
  const reservoirs = []

  const add = function (item) {
    reservoirs.push({
      name: item.reservoirName,
      owner: item.undertaker,
      authority: item.leadLocalFloodAuthority,
      location: item.location,
      riskDesignation: item.riskDesignation,
      comments: item.comments
    })
  }

  if (reservoirDryRisk) {
    risk.reservoirDryRisk.forEach(add)
  }

  if (reservoirWetRisk) {
    risk.reservoirWetRisk
      .filter(item => !reservoirs.find(r => r.name === item.reservoirName))
      .forEach(item => add(item))
  }

  this.reservoirs = reservoirs
}
