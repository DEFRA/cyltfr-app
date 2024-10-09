const util = require('../../util')
const risk = require('../risk')
const config = require('../../config')

jest.mock('../../util')
jest.mock('../../config')

describe('Risk service', () => {
  beforeAll(() => {
    config.setConfigOptions({ serviceUrl: 'http://localhost:8050' })
    util.getJson = jest.fn()
  })

  test('Calls getByCoordinates', async () => {
    risk.getByCoordinates(1, 2, 3)
    expect(util.getJson).toHaveBeenCalledWith('http://localhost:8050/floodrisk/1/2/3')
  })

  test('Calls swdepth', async () => {
    risk.swDepthRisk(1, 2)
    expect(util.getJson).toHaveBeenCalledWith('http://localhost:8050/swdepth/1/2')
  })

  test('Calls rsdepth', async () => {
    risk.rsDepthRisk(1, 2)
    expect(util.getJson).toHaveBeenCalledWith('http://localhost:8050/rsdepth/1/2')
  })
})
