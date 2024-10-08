const util = require('../../util')
const risk = require('../risk')

jest.mock('../../util')

describe('Risk service', () => {
  beforeAll(() => {
    util.getJson = jest.fn().mockImplementation((uri) => { return uri })
  })

  test('Calls getByCoordinates', async () => {
    const result = risk.getByCoordinates(1, 2, 3)
    expect(result).toContain('/floodrisk/1/2/3')
  })

  test('Calls swdepth', async () => {
    const result = risk.swDepthRisk(1, 2)
    expect(result).toContain('/swdepth/1/2')
  })

  test('Calls rsdepth', async () => {
    const result = risk.rsDepthRisk(1, 2)
    expect(result).toContain('/rsdepth/1/2')
  })
})
