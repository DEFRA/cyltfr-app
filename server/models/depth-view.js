const { capitaliseAddress } = require('../services/address.js')

const RiskLevel = {
  VeryLow: 'Very Low',
  Low: 'Low',
  Medium: 'Medium',
  High: 'High'
}

const Levels = Object.keys(RiskLevel).map(l => RiskLevel[l])

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
  depthData.rs200 = rsDepthJson['200']?.current || RiskLevel.VeryLow
  depthData.rs300 = rsDepthJson['300']?.current || RiskLevel.VeryLow
  depthData.rs600 = rsDepthJson['600']?.current || RiskLevel.VeryLow
  depthData.rs200cc = rsDepthJson['200']?.cc || RiskLevel.VeryLow
  depthData.rs300cc = rsDepthJson['300']?.cc || RiskLevel.VeryLow
  depthData.rs600cc = rsDepthJson['600']?.cc || RiskLevel.VeryLow

  depthData.rs200classname = depthData.rs200.replace(' ', '-')
  depthData.rs300classname = depthData.rs300.replace(' ', '-')
  depthData.rs600classname = depthData.rs600.replace(' ', '-')
  depthData.rs200ccclassname = depthData.rs200cc.replace(' ', '-')
  depthData.rs300ccclassname = depthData.rs300cc.replace(' ', '-')
  depthData.rs600ccclassname = depthData.rs600cc.replace(' ', '-')

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
  depthData.sw200 = swDepthJson['200']?.current || RiskLevel.VeryLow
  depthData.sw300 = swDepthJson['300']?.current || RiskLevel.VeryLow
  depthData.sw600 = swDepthJson['600']?.current || RiskLevel.VeryLow
  depthData.sw200cc = swDepthJson['200']?.cc || RiskLevel.VeryLow
  depthData.sw300cc = swDepthJson['300']?.cc || RiskLevel.VeryLow
  depthData.sw600cc = swDepthJson['600']?.cc || RiskLevel.VeryLow

  depthData.sw200classname = depthData.sw200.replace(' ', '-')
  depthData.sw300classname = depthData.sw300.replace(' ', '-')
  depthData.sw600classname = depthData.sw600.replace(' ', '-')
  depthData.sw200ccclassname = depthData.sw200cc.replace(' ', '-')
  depthData.sw300ccclassname = depthData.sw300cc.replace(' ', '-')
  depthData.sw600ccclassname = depthData.sw600cc.replace(' ', '-')

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

module.exports = depthViewModel
