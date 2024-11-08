const { capitaliseAddress } = require('../services/address.js')

const RiskLevel = {
  VeryLow: 'Very low',
  Low: 'Low',
  Medium: 'Medium',
  High: 'High'
}

const RiskTitles = {
  'Very Low': 'Very low risk',
  Low: 'Low risk',
  Medium: 'Medium risk',
  High: 'High risk'
}

const Levels = Object.keys(RiskLevel).map(l => RiskLevel[l])

function riskViewModel (risk, address, backLinkUri) {
  const riverAndSeaRisk = risk.riverAndSeaRisk
    ? risk.riverAndSeaRisk.probabilityForBand
    : RiskLevel.VeryLow
  const riverAndSeaRiskCC = risk.riverAndSeaRiskCC
    ? risk.riverAndSeaRiskCC.probabilityForBand
    : RiskLevel.VeryLow
  const surfaceWaterRisk = risk.surfaceWaterRisk || RiskLevel.VeryLow
  const surfaceWaterRiskCC = risk.surfaceWaterRiskCC || RiskLevel.VeryLow
  const reservoirDryRisk = !!(risk.reservoirDryRisk?.length)
  const reservoirWetRisk = !!(risk.reservoirWetRisk?.length)
  const reservoirRisk = reservoirDryRisk || reservoirWetRisk

  this.riverAndSeaRisk = riverAndSeaRisk
  this.riverAndSeaRiskCC = riverAndSeaRiskCC
  this.surfaceWaterRisk = surfaceWaterRisk
  this.surfaceWaterRiskCC = surfaceWaterRiskCC
  this.riverAndSeaClassName = riverAndSeaRisk.toLowerCase().replace(' ', '-')
  this.surfaceWaterClassName = surfaceWaterRisk.toLowerCase().replace(' ', '-')
  this.riversSeaRiskStyle = riverAndSeaRisk.replace(/ /g, '-')
  this.surfaceWaterStyle = surfaceWaterRisk.replace(/ /g, '-')
  this.riversSeaRiskCCStyle = riverAndSeaRiskCC.replace(/ /g, '-')
  this.surfaceWaterCCStyle = surfaceWaterRiskCC.replace(/ /g, '-')
  this.reservoirRisk = reservoirRisk
  this.backLink = backLinkUri

  if (reservoirRisk) {
    processReservoirs.call(this, reservoirDryRisk, risk, reservoirWetRisk)
  }

  // Groundwater area
  this.isGroundwaterArea = risk.isGroundwaterArea
  this.extraInfo = risk.extraInfo

  this.hasHoldingComments = false
  this.hasLlfaComments = false

  // Extra info
  processExtraInfo.call(this, risk)

  this.easting = address.x
  this.northing = address.y
  this.postcode = address.postcode
  this.lines = address.address.split(', ')
  this.address = address
  this.fullAddress = capitaliseAddress(address.address)
  this.leadLocalFloodAuthority = risk.leadLocalFloodAuthority
  this.date = Date.now()
  this.year = new Date().getFullYear()
  this.riversAndSeaTitle = RiskTitles[riverAndSeaRisk]
  this.surfaceWaterTitle = RiskTitles[surfaceWaterRisk]

  if (riverAndSeaRisk) {
    const name = riverAndSeaRisk.toLowerCase()
    this.riversAndSeaTextName = `partials/riskdescriptions/${name.replace(/ /g, '-')}.html`
  }

  if (surfaceWaterRisk) {
    const name = surfaceWaterRisk.toLowerCase()
    this.surfaceWaterTextName = `partials/riskdescriptions/${name.replace(/ /g, '-')}.html`
  }

  const riversAndSeaLevel = Levels.indexOf(riverAndSeaRisk)
  const surfaceWaterLevel = Levels.indexOf(surfaceWaterRisk)
  const surfaceWaterIsFirst = surfaceWaterLevel >= riversAndSeaLevel

  processHighestRisk.call(this, surfaceWaterLevel, riversAndSeaLevel)

  if (surfaceWaterIsFirst) {
    this.firstSource = 'surface-water.html'
    this.secondSource = 'rivers-sea.html'
  } else {
    this.firstSource = 'rivers-sea.html'
    this.secondSource = 'surface-water.html'
  }

  this.firstSource = 'partials/' + this.firstSource
  this.secondSource = 'partials/' + this.secondSource
  this.additionalInformation = 'partials/groundwaterAndReservoirs.html'
  this.surfaceWaterIsFirst = surfaceWaterIsFirst
  this.testInfo = JSON.stringify({
    riverAndSeaRisk,
    surfaceWaterRisk,
    reservoirRisk,
    isGroundwaterArea: risk.isGroundwaterArea
  })
}

module.exports = riskViewModel

function processHighestRisk (surfaceWaterLevel, riversAndSeaLevel) {
  this.highestRisk = 'partials/blank.html'
  if ((surfaceWaterLevel < riversAndSeaLevel) && (riversAndSeaLevel > 0)) { this.highestRisk = 'partials/rsl.html' }
  if ((surfaceWaterLevel > riversAndSeaLevel) && (surfaceWaterLevel > 0)) { this.highestRisk = 'partials/sw.html' }
  if ((surfaceWaterLevel === riversAndSeaLevel) && (riversAndSeaLevel > 0)) { this.highestRisk = 'partials/rsl-sw.html' }
}

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

function processExtraInfo (risk) {
  if (Array.isArray(risk.extraInfo) && risk.extraInfo.length) {
    const maxComments = 3
    const llfaDescriptions = {
      'Flood report': 'Historical flooding reports',
      'Non compliant mapping': 'Additional local flood maps',
      'Proposed schemes': 'Potential new flood protection schemes',
      'Completed schemes': 'Completed flood protection schemes',
      'Flood action plan': 'A flood action plan',
      'Other info': 'Other information, for example, engineer\'s reports or land drainage consents'
    }

    this.holdingComments = risk.extraInfo
      .filter(comment => comment.apply === 'holding')
      .map(comment => comment.info)
      .filter(info => info)
      .slice(0, maxComments)

    this.llfaComments = risk.extraInfo
      .filter(comment => comment.apply === 'llfa')
      .map(comment => comment.info)
      .filter(info => info)
      .filter((info, idx, arr) => arr.indexOf(info) === idx)
      .map(info => llfaDescriptions[info])
      .filter(info => info)

    this.hasHoldingComments = !!this.holdingComments.length
    this.hasLlfaComments = !!this.llfaComments.length
  }
}
