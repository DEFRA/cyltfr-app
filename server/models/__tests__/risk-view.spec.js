const Risk = require('../risk-view')
const address = { x: 1, y: 1, postcode: 'test', address: '1, STREET, VILLAGE, TOWN, PO1 1CE' }

describe('Risk view model', () => {
  beforeAll(() => {

  })

  test('Sets Surface water risk-level to very low if empty', async () => {
    const riskData = {
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: null,
      surfaceWaterRisk: null,
      extraInfo: null
    }
    const result = new Risk(riskData, address, null)
    expect(result).toMatchObject({ surfaceWaterRiskCC: 'Very low', surfaceWaterRisk: 'Very low' })
  })

  test('Sets Rivers and sea water risk-level to very low if empty', async () => {
    const riskData = {
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: null,
      surfaceWaterRisk: null,
      extraInfo: null
    }
    const result = new Risk(riskData, address, null)
    expect(result).toMatchObject({ riverAndSeaRiskCC: 'Very low', riverAndSeaRisk: 'Very low' })
  })

  test('Sets Surface water class name correctly', async () => {
    const riskData = {
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: null,
      surfaceWaterRisk: 'Medium',
      extraInfo: null
    }
    const result = new Risk(riskData, address, null)
    expect(result).toMatchObject({ surfaceWaterRiskCC: 'Medium', surfaceWaterRisk: 'Medium', surfaceWaterStyle: 'medium' })
  })

  test('Sets Rivers and sea class name correctly in lower case', async () => {
    const riskData = {
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: { probabilityForBand: 'Low' },
      surfaceWaterRisk: 'Medium',
      extraInfo: null
    }
    const result = new Risk(riskData, address, null)
    expect(result).toMatchObject({ riverAndSeaRisk: 'Low', riverAndSeaRiskCC: 'Low', riversSeaRiskStyle: 'low' })
  })

  test('Sets Rivers and sea level change ignored for lower cc data', async () => {
    const riskData = {
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: { probabilityForBand: 'Medium' },
      riverAndSeaRiskCC: { probabilityForBand: 'Low' },
      surfaceWaterRisk: 'Medium',
      extraInfo: null
    }
    const result = new Risk(riskData, address, null)
    expect(result).toMatchObject({ riverAndSeaRisk: 'Medium', riverAndSeaRiskCC: 'Medium' })
  })

  test('Sets Rivers and sea level change unchanged for unavailable CC data', async () => {
    const riskData = {
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: { probabilityForBand: 'Medium' },
      riverAndSeaRiskCC: { probabilityForBand: 'Unavailable' },
      surfaceWaterRisk: 'Medium',
      extraInfo: null
    }
    const result = new Risk(riskData, address, null)
    expect(result).toMatchObject({ riverAndSeaRisk: 'Medium', riverAndSeaRiskCC: 'Unavailable' })
  })
})
