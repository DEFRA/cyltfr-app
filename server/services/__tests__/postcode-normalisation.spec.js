/* eslint-disable no-unexpected-multiline */
/* eslint-disable @stylistic/func-call-spacing */
const { Postcode } = require('../postcode-normalisation')

describe('postcode-normalisation', () => {
  test.each(['cv37 6yz', 'CV37 6YZ', 'CV376YZ', 'cv376yz', 'CV376yz', 'cv37 6YZ', '  c&v3 7  ;  * 6^y #Z /'])
  ('normalise returns valid postcode CV376YZ for input "%s"', async (input) => {
    const expectedResult = new Postcode('CV376YZ', true, false, null, null)
    const findFunction = jest.fn()
    expect((await Postcode.normalise(input, findFunction)).postcodeInfo).toStrictEqual(expectedResult)
    expect(findFunction).toHaveBeenCalled()
  })

  test.each(['invalid'])
  ('normalise returns invalid postcode for input "%s", does not call find function', async (input) => {
    const expectedResult = new Postcode('INVALID', false, undefined, undefined, undefined)
    const findFunction = jest.fn()
    expect((await Postcode.normalise(input, findFunction)).postcodeInfo).toStrictEqual(expectedResult)
    expect(findFunction).not.toHaveBeenCalled()
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

  test.each([
    ['this is a test', null],
    ['CV37 6YZZ', 'CV37 6YZ'],
    ['Full address, 1 Address Street, Somewhere, Some county, YO1 1XX', 'YO1 1XX'],
    ['yo1 1xx', 'yo1 1xx'],
    ['Yo1 1xx#', 'Yo1 1xx']
  ])('findPostcodeInString finds postcodes and returns them from strings "%s"', (input, expectedPostcode) => {
    expect(Postcode.findPostcodeInString(input)).toStrictEqual(expectedPostcode)
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
