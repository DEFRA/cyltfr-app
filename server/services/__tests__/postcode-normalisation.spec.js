/* eslint-disable no-unexpected-multiline */
/* eslint-disable @stylistic/func-call-spacing */
const { Postcode } = require('../postcode-normalisation')

describe('postcode-normalisation', () => {
  test.each(['cv37 6yz', 'CV37 6YZ', 'CV376YZ', 'cv376yz', 'CV376yz', 'cv37 6YZ', '  c&v3 7  ;  * 6^y #Z /'])
  ('normalise returns valid postcode CV376YZ for input "%s"', async (input) => {
    const expectedResult = { postcodeInfo: new Postcode('CV376YZ', true) }
    expect(await Postcode.normalise(input)).toStrictEqual(expectedResult)
  })

  test.each([
    ['', null],
    [undefined, null],
    [null, null],
    ['null', null],
    ['undefined', null],
    ['   ', ''],
    ['!!!', ''],
    ['CV37 6YZZ', 'CV376YZZ'],
    ['12345', '12345'],
    ['ABCDE', 'ABCDE']
  ])('normalise returns invalid value "%s"', async (input, expectedPostcode) => {
    const expectedResult = { postcodeInfo: new Postcode(expectedPostcode, false) }
    expect(await Postcode.normalise(input)).toStrictEqual(expectedResult)
  })

  test('compare returns true when postcodes are the same', async () => {
    expect(await Postcode.compare('CV37 6YZ', 'cv376yz')).toBe(true)
  })

  test('compare returns false when postcodes are different', async () => {
    expect(await Postcode.compare('CV37 6YZ', 'AB12 3CD')).toBe(false)
  })

  test.each(['', null, undefined])
  ('compare returns false for invalid value "%s"', async (input) => {
    expect(await Postcode.compare('CV37 6YZ', input)).toBe(false)
  })
})
