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
    swDepthJson = correctCCdata(swDepthJson)
    swDepthFlatten(depthData, swDepthJson)
  }
  if (rsDepthJson) {
    rsDepthJson = correctCCdata(rsDepthJson)
    rsDepthFlatten(depthData, rsDepthJson)
  }

  return depthData
}

function correctCCdata (depthJson) {
  for (const key in depthJson) {
    const currentLevelIndex = Levels.indexOf(depthJson[key].current)
    const ccLevelIndex = Levels.indexOf(depthJson[key].cc)
    if (ccLevelIndex < currentLevelIndex) {
      depthJson[key].cc = depthJson[key].current
    }
  }
  return depthJson
}

function flattenDepthData (depthData, depthJson, prefix) {
  depthData[`${prefix}200`] = depthJson['200']?.current ? formatRiskLevel(depthJson['200'].current) : riskLevel.veryLow
  depthData[`${prefix}300`] = depthJson['300']?.current ? formatRiskLevel(depthJson['300'].current) : riskLevel.veryLow
  depthData[`${prefix}600`] = depthJson['600']?.current ? formatRiskLevel(depthJson['600'].current) : riskLevel.veryLow
  depthData[`${prefix}200cc`] = depthJson['200']?.cc ? formatRiskLevel(depthJson['200'].cc) : riskLevel.veryLow
  depthData[`${prefix}300cc`] = depthJson['300']?.cc ? formatRiskLevel(depthJson['300'].cc) : riskLevel.veryLow
  depthData[`${prefix}600cc`] = depthJson['600']?.cc ? formatRiskLevel(depthJson['600'].cc) : riskLevel.veryLow

  depthData[`${prefix}200classname`] = formatClassName(depthData[`${prefix}200`])
  depthData[`${prefix}300classname`] = formatClassName(depthData[`${prefix}300`])
  depthData[`${prefix}600classname`] = formatClassName(depthData[`${prefix}600`])
  depthData[`${prefix}200ccclassname`] = formatClassName(depthData[`${prefix}200cc`])
  depthData[`${prefix}300ccclassname`] = formatClassName(depthData[`${prefix}300cc`])
  depthData[`${prefix}600ccclassname`] = formatClassName(depthData[`${prefix}600cc`])

  depthData[`${prefix}200Level`] = Levels.indexOf(depthData[`${prefix}200`])
  depthData[`${prefix}300Level`] = Levels.indexOf(depthData[`${prefix}300`])
  depthData[`${prefix}600Level`] = Levels.indexOf(depthData[`${prefix}600`])
  depthData[`${prefix}200ccLevel`] = Levels.indexOf(depthData[`${prefix}200cc`])
  depthData[`${prefix}300ccLevel`] = Levels.indexOf(depthData[`${prefix}300cc`])
  depthData[`${prefix}600ccLevel`] = Levels.indexOf(depthData[`${prefix}600cc`])

  depthData[`${prefix}200Change`] = depthData[`${prefix}200ccLevel`] - depthData[`${prefix}200Level`]
  depthData[`${prefix}300Change`] = depthData[`${prefix}300ccLevel`] - depthData[`${prefix}300Level`]
  depthData[`${prefix}600Change`] = depthData[`${prefix}600ccLevel`] - depthData[`${prefix}600Level`]
}

function rsDepthFlatten (depthData, rsDepthJson) {
  flattenDepthData(depthData, rsDepthJson, 'rs')
}

function swDepthFlatten (depthData, swDepthJson) {
  flattenDepthData(depthData, swDepthJson, 'sw')
}

function formatRiskLevel (riskValue) {
  if (!riskValue) { return riskValue }
  return riskValue.charAt(0).toUpperCase() + riskValue.slice(1).toLowerCase()
}

function formatClassName (riskValue) {
  return riskValue.replace(' ', '-').toLowerCase()
}

module.exports = depthViewModel
