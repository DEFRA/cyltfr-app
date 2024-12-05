const { capitaliseAddress } = require('../services/address.js')

function groundwaterViewModel (risk, address, backLinkUri) {
  const reservoirDryRisk = !!(risk.reservoirDryRisk?.length)
  const reservoirWetRisk = !!(risk.reservoirWetRisk?.length)
  const reservoirRisk = reservoirDryRisk || reservoirWetRisk

  this.reservoirRisk = reservoirRisk
  this.backLink = backLinkUri

  if (reservoirRisk) {
    processReservoirs.call(this, reservoirDryRisk, risk, reservoirWetRisk)
  }

  // Groundwater area
  this.isGroundwaterArea = risk.isGroundwaterArea
  this.easting = address.x
  this.northing = address.y
  this.postcode = address.postcode
  this.lines = address.address.split(', ')
  this.address = address
  this.fullAddress = capitaliseAddress(address.address)
  this.date = Date.now()
  this.year = new Date().getFullYear()

  this.testInfo = JSON.stringify({
    isGroundwaterArea: risk.isGroundwaterArea
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
      .filter(item => !reservoirs.find(r => r.location === item.location))
      .forEach(item => add(item))
  }

  this.reservoirs = reservoirs
}
