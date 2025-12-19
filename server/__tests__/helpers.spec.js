const { normalisePostcode } = require('../helpers')

describe('helpers', () => {
  describe('normalisePostcode', () => {
    test('should convert to uppercase and remove spaces', () => {
      expect(normalisePostcode('cv37 6yz')).toBe('CV376YZ')
      expect(normalisePostcode('CV37 6YZ')).toBe('CV376YZ')
      expect(normalisePostcode('CV376YZ')).toBe('CV376YZ')
      expect(normalisePostcode('cv376yz')).toBe('CV376YZ')
      expect(normalisePostcode('CV376yz')).toBe('CV376YZ')
      expect(normalisePostcode('cv37 6YZ')).toBe('CV376YZ')
    })

    test('should handle different space patterns', () => {
      expect(normalisePostcode('CV37  6YZ')).toBe('CV376YZ')
      expect(normalisePostcode(' CV37 6YZ ')).toBe('CV376YZ')
      expect(normalisePostcode('CV37   6YZ')).toBe('CV376YZ')
    })

    test('should handle edge cases', () => {
      expect(normalisePostcode('')).toBe('')
      expect(normalisePostcode(null)).toBe('')
      expect(normalisePostcode(undefined)).toBe('')
      expect(normalisePostcode('   ')).toBe('')
    })
  })
})
