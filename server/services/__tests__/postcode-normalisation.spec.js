/* eslint-disable no-unexpected-multiline */
/* eslint-disable @stylistic/func-call-spacing */
const { Postcode } = require('../postcode-normalisation')

describe('postcode-normalisation', () => {
  test.each(['cv37 6yz', 'CV37 6YZ', 'CV376YZ', 'cv376yz', 'CV376yz', 'cv37 6YZ', '  c&v3 7  ;  * 6^y #Z /'])
  ('normalise returns valid, non NI postcode CV376YZ for input "%s"', (input) => {
    const expectedResult = new Postcode('CV376YZ', true, false)
    expect(Postcode.normalise(input)).toStrictEqual(expectedResult)
  })

  test.each(['', null, undefined])
  ('normalise returns invalid, non NI postcode for invalid value "%s"', (input) => {
    const expectedResult = new Postcode(input, false, false)
    expect(Postcode.normalise(input)).toStrictEqual(expectedResult)
  })

  test.each(['   ', '!!!', 'CV37 6YZZ', '12345', 'ABCDE', 'null', 'undefined'])
  ('normalise returns invalid, non NI postcode for invalid input "%s"', (input) => {
    const expectedResult = new Postcode(input, false, false)
    const actualResult = Postcode.normalise(input)
    expect(actualResult.postcode).not.toBe(null)
    expect(actualResult.isValid).toBe(expectedResult.isValid)
    expect(actualResult.isNI).toBe(expectedResult.isNI)
  })

  test('compare returns true when postcodes are the same', () => {
    expect(Postcode.compare('CV37 6YZ', 'cv376yz')).toBe(true)
  })

  test('compare returns false when postcodes are different', () => {
    expect(Postcode.compare('CV37 6YZ', 'AB12 3CD')).toBe(false)
  })

  test.each(['', null, undefined])
  ('compare returns false for invalid value "%s"', (input) => {
    expect(Postcode.compare('CV37 6YZ', input)).toBe(false)
  })
})
