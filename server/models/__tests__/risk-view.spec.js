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

  test('Sets isFloodWarningArea to true when in floodWarningArea', () => {
    const riskData = {
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningAreas: [{ id: 1, name: 'Test Area' }],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: { probabilityForBand: 'Low' },
      surfaceWaterRisk: 'Medium',
      extraInfo: null
    }
    const result = new Risk(riskData, address, null)
    expect(result.isFloodWarningArea).toBe(true)
  })

  test('Includes only valid holding comments', async () => {
    const riskData = {
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: { probabilityForBand: 'Medium' },
      riverAndSeaRiskCC: { probabilityForBand: 'Unavailable' },
      surfaceWaterRisk: 'Medium',
      extraInfo: [
        {
          info: 'A Test Comment',
          apply: 'holding'
        },
        {
          info: null,
          apply: 'holding'
        },
        {
          info: '',
          apply: 'holding'
        }
      ]
    }
    const result = new Risk(riskData, address, null)
    expect(result).toMatchObject({ hasHoldingComments: true, hasLlfaComments: false })
    expect(result.holdingComments).toHaveLength(1)
  })

  test('Includes only valid llfa comments', async () => {
    const riskData = {
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: { probabilityForBand: 'Medium' },
      riverAndSeaRiskCC: { probabilityForBand: 'Unavailable' },
      surfaceWaterRisk: 'Medium',
      extraInfo: [
        {
          info: 'Flood report',
          apply: 'llfa'
        },
        {
          info: null,
          apply: 'llfa'
        },
        {
          info: '',
          apply: 'llfa'
        }
      ]
    }
    const result = new Risk(riskData, address, null)
    expect(result).toMatchObject({ hasHoldingComments: false, hasLlfaComments: true })
    expect(result.llfaComments).toHaveLength(1)
  })

  test('Duplicate llfa comments are removed', async () => {
    const riskData = {
      isGroundwaterArea: false,
      floodAlertArea: [],
      floodWarningArea: [],
      leadLocalFloodAuthority: 'Cheshire West and Chester',
      reservoirRisk: null,
      riverAndSeaRisk: { probabilityForBand: 'Medium' },
      riverAndSeaRiskCC: { probabilityForBand: 'Unavailable' },
      surfaceWaterRisk: 'Medium',
      extraInfo: [
        {
          info: 'Flood report',
          apply: 'llfa'
        },
        {
          info: 'Proposed schemes',
          apply: 'llfa'
        },
        {
          info: 'Flood report',  // Duplicate - will be removed
          apply: 'llfa'
        }
      ]
    }
    const result = new Risk(riskData, address, null)
    expect(result.llfaComments).toHaveLength(2)
  })
})
