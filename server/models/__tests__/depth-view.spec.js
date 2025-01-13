const depth = require('../depth-view')
const address = { x: 1, y: 1, postcode: 'test', address: '1, STREET, VILLAGE, TOWN, PO1 1CE' }

describe('Depth view model', () => {
  beforeAll(() => {

  })

  test('Does not fail if not passed any depth', async () => {
    const result = depth(null, null, address)
    expect(result).toMatchObject({ easting: 1, northing: 1 })
  })

  test('Sets Surface water risk-level to very low if empty', async () => {
    const swDepth = {
      200: {
        cc: 'Medium'
      }
    }
    const result = depth(swDepth, null, address)
    expect(result).toMatchObject({ sw200cc: 'Medium', sw200: 'Very low' })
  })

  test('Sets Rivers and sea water risk-level to very low if empty', async () => {
    const rsDepth = {
      200: {
        cc: 'Medium'
      }
    }
    const result = depth(null, rsDepth, address)
    expect(result).toMatchObject({ rs200cc: 'Medium', rs200: 'Very low' })
  })

  test('Sets Rivers and sea risk-level to very low if 200 current is missing', async () => {
    const rsDepth = {
      200: {}
    }
    const result = depth(null, rsDepth, address)
    expect(result).toMatchObject({ rs200: 'Very low', rs200cc: 'Very low' })
  })

  test('Sets Surface water risk-level to very low if 200 current is missing', async () => {
    const swDepth = {
      200: {}
    }
    const result = depth(swDepth, null, address)
    expect(result).toMatchObject({ sw200: 'Very low', sw200cc: 'Very low' })
  })

  test('Sets Surface water class name correctly', async () => {
    const swDepth = {
      200: {
        current: 'Medium'
      }
    }
    const result = depth(swDepth, null, address)
    expect(result).toMatchObject({ sw200: 'Medium', sw200cc: 'Medium', sw200ccclassname: 'medium' })
  })

  test('Sets Rivers and sea class name correctly in lower case', async () => {
    const rsDepth = {
      200: {
        current: 'Medium'
      }
    }
    const result = depth(null, rsDepth, address)
    expect(result).toMatchObject({ rs200: 'Medium', rs200cc: 'Medium', rs200ccclassname: 'medium' })
  })

  test('Sets Rivers and sea level change ignored for lower cc data', async () => {
    const rsDepth = {
      200: {
        current: 'Very low',
        cc: 'Low'
      },
      300: {
        current: 'Medium',
        cc: 'Low'
      },
      600: {
        current: 'High',
        cc: 'High'
      }

    }
    const result = depth(null, rsDepth, address)
    expect(result).toMatchObject({ rs300: 'Medium', rs300cc: 'Medium' })
  })

  test('Sets Rivers and sea level change', async () => {
    const rsDepth = {
      200: {
        current: 'Very low',
        cc: 'Low'
      },
      300: {
        current: 'Medium',
        cc: 'Low'
      },
      600: {
        current: 'High',
        cc: 'High'
      }

    }
    const result = depth(null, rsDepth, address)
    expect(result).toMatchObject({ rs200Change: 1, rs300Change: 0, rs600Change: 0 })
  })
})
