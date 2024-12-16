const { capitaliseAddress } = require('../services/address.js')

const riskLevel = {
  veryLow: 'Very low',
  low: 'Low',
  medium: 'Medium',
  high: 'High'
}

const Levels = Object.keys(riskLevel).map(l => riskLevel[l])

function depthViewModel (swDepthJson, rsDepthJson, address, backLinkUri) {
  const depthData = {
    easting: address.x,
    northing: address.y,
    postcode: address.postcode,
    lines: address.address.split(', '),
    address,
    fullAddress: capitaliseAddress(address.address),
    backLink: backLinkUri
  }

  if (swDepthJson) {
    swDepthFlatten(depthData, swDepthJson)
  }
  if (rsDepthJson) {
    rsDepthFlatten(depthData, rsDepthJson)
  }

  return depthData
}

function rsDepthFlatten (depthData, rsDepthJson) {
  depthData.rs200 = rsDepthJson['200']?.current ? formatRiskLevel(rsDepthJson['200'].current) : riskLevel.veryLow
  depthData.rs300 = rsDepthJson['300']?.current ? formatRiskLevel(rsDepthJson['300'].current) : riskLevel.veryLow
  depthData.rs600 = rsDepthJson['600']?.current ? formatRiskLevel(rsDepthJson['600'].current) : riskLevel.veryLow
  depthData.rs200cc = rsDepthJson['200']?.cc ? formatRiskLevel(rsDepthJson['200'].cc) : riskLevel.veryLow
  depthData.rs300cc = rsDepthJson['300']?.cc ? formatRiskLevel(rsDepthJson['300'].cc) : riskLevel.veryLow
  depthData.rs600cc = rsDepthJson['600']?.cc ? formatRiskLevel(rsDepthJson['600'].cc) : riskLevel.veryLow

  depthData.rs200classname = depthData.rs200.replace(' ', '-').toLowerCase()
  depthData.rs300classname = depthData.rs300.replace(' ', '-').toLowerCase()
  depthData.rs600classname = depthData.rs600.replace(' ', '-').toLowerCase()
  depthData.rs200ccclassname = depthData.rs200cc.replace(' ', '-').toLowerCase()
  depthData.rs300ccclassname = depthData.rs300cc.replace(' ', '-').toLowerCase()
  depthData.rs600ccclassname = depthData.rs600cc.replace(' ', '-').toLowerCase()

  depthData.rs200Level = Levels.indexOf(depthData.rs200)
  depthData.rs300Level = Levels.indexOf(depthData.rs300)
  depthData.rs600Level = Levels.indexOf(depthData.rs600)
  depthData.rs200ccLevel = Levels.indexOf(depthData.rs200cc)
  depthData.rs300ccLevel = Levels.indexOf(depthData.rs300cc)
  depthData.rs600ccLevel = Levels.indexOf(depthData.rs600cc)

  depthData.rs200Change = depthData.rs200ccLevel - depthData.rs200Level
  depthData.rs300Change = depthData.rs300ccLevel - depthData.rs300Level
  depthData.rs600Change = depthData.rs600ccLevel - depthData.rs600Level
}

function swDepthFlatten (depthData, swDepthJson) {
  depthData.sw200 = swDepthJson['200']?.current ? formatRiskLevel(swDepthJson['200'].current) : riskLevel.veryLow
  depthData.sw300 = swDepthJson['300']?.current ? formatRiskLevel(swDepthJson['300'].current) : riskLevel.veryLow
  depthData.sw600 = swDepthJson['600']?.current ? formatRiskLevel(swDepthJson['600'].current) : riskLevel.veryLow
  depthData.sw200cc = swDepthJson['200']?.cc ? formatRiskLevel(swDepthJson['200'].cc) : riskLevel.veryLow
  depthData.sw300cc = swDepthJson['300']?.cc ? formatRiskLevel(swDepthJson['300'].cc) : riskLevel.veryLow
  depthData.sw600cc = swDepthJson['600']?.cc ? formatRiskLevel(swDepthJson['600'].cc) : riskLevel.veryLow

  depthData.sw200classname = depthData.sw200.replace(' ', '-').toLowerCase()
  depthData.sw300classname = depthData.sw300.replace(' ', '-').toLowerCase()
  depthData.sw600classname = depthData.sw600.replace(' ', '-').toLowerCase()
  depthData.sw200ccclassname = depthData.sw200cc.replace(' ', '-').toLowerCase()
  depthData.sw300ccclassname = depthData.sw300cc.replace(' ', '-').toLowerCase()
  depthData.sw600ccclassname = depthData.sw600cc.replace(' ', '-').toLowerCase()

  depthData.sw200Level = Levels.indexOf(depthData.sw200)
  depthData.sw300Level = Levels.indexOf(depthData.sw300)
  depthData.sw600Level = Levels.indexOf(depthData.sw600)
  depthData.sw200ccLevel = Levels.indexOf(depthData.sw200cc)
  depthData.sw300ccLevel = Levels.indexOf(depthData.sw300cc)
  depthData.sw600ccLevel = Levels.indexOf(depthData.sw600cc)

  depthData.sw200Change = depthData.sw200ccLevel - depthData.sw200Level
  depthData.sw300Change = depthData.sw300ccLevel - depthData.sw300Level
  depthData.sw600Change = depthData.sw600ccLevel - depthData.sw600Level
}

function formatRiskLevel (riskLevel) {
  if (!riskLevel) return riskLevel
  return riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1).toLowerCase()
}

module.exports = depthViewModel
